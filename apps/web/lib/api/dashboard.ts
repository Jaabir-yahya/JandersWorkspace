import { apiClient, getCurrentTenantId } from '../api-client';
import type { DashboardStats, RecentActivity } from '../types';

/** Backend dashboard stats shape (snake_case). */
interface BackendDashboardStats {
  total_revenue_today?: number;
  total_revenue_week?: number;
  total_revenue_month?: number;
  transactions_today?: number;
  transactions_week?: number;
  outstanding_credit?: number;
  outstanding_debt?: number;
  payment_method_breakdown?: { cash?: number; mpesa?: number; bank?: number; credit?: number };
  top_customers?: unknown[];
  recent_activity?: Array<{ id: string; type: string; description: string; amount?: number; timestamp: string }>;
}

function mapBackendStatsToFrontend(b: BackendDashboardStats): DashboardStats {
  const revenue = Number(b.total_revenue_month ?? 0);
  const pm = b.payment_method_breakdown ?? {};
  const cashBalance = Number(pm.cash ?? 0) + Number(pm.mpesa ?? 0) + Number(pm.bank ?? 0);
  return {
    totalRevenue: revenue,
    totalExpenses: Number(b.outstanding_debt ?? 0),
    netIncome: revenue - Number(b.outstanding_debt ?? 0),
    cashBalance,
    accountsReceivable: Number(b.outstanding_credit ?? 0),
    accountsPayable: Number(b.outstanding_debt ?? 0),
    inventoryValue: 0,
    overdueInvoices: 0,
    currency: 'KES',
  };
}

/** Backend returns stats with recent_activity; tenant_id is required. */
export const dashboardApi = {
  /**
   * Get dashboard statistics. Backend requires tenant_id (from query or JWT).
   * @param tenantId - Optional; falls back to getCurrentTenantId() (set after login).
   */
  stats: async (tenantId?: string | null): Promise<DashboardStats> => {
    const tid = tenantId ?? getCurrentTenantId();
    if (!tid) return mapBackendStatsToFrontend({});
    try {
      const data = await apiClient.get<BackendDashboardStats>('/dashboard/stats', { params: { tenant_id: tid } });
      return mapBackendStatsToFrontend(data as BackendDashboardStats);
    } catch {
      return mapBackendStatsToFrontend({});
    }
  },

  /**
   * Backend has no separate recent-activity endpoint; stats includes recent_activity.
   * This calls stats and returns the recent_activity slice (or empty array on error).
   */
  recentActivity: async (limit?: number): Promise<RecentActivity[]> => {
    const tid = getCurrentTenantId();
    if (!tid) return [];
    try {
      const data = await apiClient.get<{ recent_activity?: Array<{ id: string; type: string; description: string; amount?: number; timestamp: string }> }>(
        '/dashboard/stats',
        { params: { tenant_id: tid } },
      );
      const list = (data as any)?.recent_activity ?? [];
      const mapped: RecentActivity[] = list.slice(0, limit ?? 10).map((a: any) => ({
        id: a.id,
        type: (a.type === 'transaction' || a.type === 'payment' ? a.type : a.type === 'reversal' ? 'expense' : 'invoice') as RecentActivity['type'],
        description: a.description ?? '',
        amount: a.amount ?? 0,
        date: a.timestamp ?? new Date().toISOString(),
      }));
      return mapped;
    } catch {
      return [];
    }
  },

  /**
   * Backend has no separate /dashboard/kpi; derive from stats or leave for future.
   */
  kpiData: async (): Promise<{ revenue: number; expenses: number; profit: number; invoices: number }> => {
    const tid = getCurrentTenantId();
    if (!tid) return { revenue: 0, expenses: 0, profit: 0, invoices: 0 };
    try {
      const data = await apiClient.get<any>('/dashboard/stats', { params: { tenant_id: tid } });
      const revenue = Number((data as any)?.total_revenue_month ?? 0);
      const expenses = Number((data as any)?.outstanding_debt ?? 0);
      return { revenue, expenses, profit: revenue - expenses, invoices: 0 };
    } catch {
      return { revenue: 0, expenses: 0, profit: 0, invoices: 0 };
    }
  },
};
