import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';

export interface DashboardStats {
  total_revenue_today: number;
  total_revenue_week: number;
  total_revenue_month: number;
  transactions_today: number;
  transactions_week: number;
  outstanding_credit: number;
  outstanding_debt: number;
  payment_method_breakdown: {
    cash: number;
    mpesa: number;
    bank: number;
    credit: number;
  };
  top_customers: Array<{
    entity_id: string;
    display_name: string;
    total_amount: number;
    transaction_count: number;
  }>;
  recent_activity: Array<{
    id: string;
    type: 'transaction' | 'payment' | 'entity' | 'reversal';
    description: string;
    amount?: number;
    timestamp: string;
  }>;
}

@Injectable()
export class DashboardService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async getDashboardStats(tenantId: string): Promise<DashboardStats> {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Revenue today
    const { data: todayRevenue, error: todayError } = await this.supabase
      .from('transactions')
      .select('total_amount')
      .eq('tenant_id', tenantId)
      .eq('status', 'POSTED')
      .in('type', ['RETAIL', 'SERVICE', 'RENTAL'])
      .gte('transaction_date', startOfToday.toISOString());

    if (todayError) {
      throw new BadRequestException(todayError.message);
    }

    // Revenue this week
    const { data: weekRevenue, error: weekError } = await this.supabase
      .from('transactions')
      .select('total_amount')
      .eq('tenant_id', tenantId)
      .eq('status', 'POSTED')
      .in('type', ['RETAIL', 'SERVICE', 'RENTAL'])
      .gte('transaction_date', startOfWeek.toISOString());

    if (weekError) {
      throw new BadRequestException(weekError.message);
    }

    // Revenue this month
    const { data: monthRevenue, error: monthError } = await this.supabase
      .from('transactions')
      .select('total_amount')
      .eq('tenant_id', tenantId)
      .eq('status', 'POSTED')
      .in('type', ['RETAIL', 'SERVICE', 'RENTAL'])
      .gte('transaction_date', startOfMonth.toISOString());

    if (monthError) {
      throw new BadRequestException(monthError.message);
    }

    // Transaction counts
    const { count: todayCount, error: todayCountError } = await this.supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'POSTED')
      .gte('transaction_date', startOfToday.toISOString());

    if (todayCountError) {
      throw new BadRequestException(todayCountError.message);
    }

    const { count: weekCount, error: weekCountError } = await this.supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'POSTED')
      .gte('transaction_date', startOfWeek.toISOString());

    if (weekCountError) {
      throw new BadRequestException(weekCountError.message);
    }

    // Outstanding credit (money owed to us)
    const { data: creditData, error: creditError } = await this.supabase
      .from('transactions')
      .select('total_amount')
      .eq('tenant_id', tenantId)
      .eq('status', 'POSTED')
      .in('type', ['RETAIL', 'SERVICE', 'RENTAL'])
      .eq('payment_status', 'CREDIT');

    if (creditError) {
      throw new BadRequestException(creditError.message);
    }

    // Outstanding debt (money we owe suppliers)
    const { data: debtData, error: debtError } = await this.supabase
      .from('transactions')
      .select('total_amount')
      .eq('tenant_id', tenantId)
      .eq('status', 'POSTED')
      .eq('type', 'EXPENSE')
      .eq('payment_status', 'CREDIT');

    if (debtError) {
      throw new BadRequestException(debtError.message);
    }

    // Payment method breakdown (from payment_records)
    const { data: paymentData, error: paymentError } = await this.supabase
      .from('payment_records')
      .select('method, amount')
      .eq('tenant_id', tenantId);

    if (paymentError) {
      throw new BadRequestException(paymentError.message);
    }

    // Top customers
    const { data: topCustomers, error: topCustomersError } = await this.supabase.rpc(
      'get_top_customers',
      { p_tenant_id: tenantId, p_limit: 5 }
    );

    if (topCustomersError) {
      // If the function doesn't exist, return empty array
      console.warn('get_top_customers function not found:', topCustomersError.message);
    }

    // Recent activity
    const { data: recentActivity, error: activityError } = await this.supabase
      .from('transactions')
      .select('id, type, total_amount, transaction_date, reference, entities:entity_id(display_name)')
      .eq('tenant_id', tenantId)
      .order('transaction_date', { ascending: false })
      .limit(10);

    if (activityError) {
      throw new BadRequestException(activityError.message);
    }

    // Calculate payment method breakdown
    const paymentBreakdown = { cash: 0, mpesa: 0, bank: 0, credit: 0 };
    (paymentData || []).forEach((payment: any) => {
      const method = payment.method?.toLowerCase();
      if (method === 'cash') paymentBreakdown.cash += payment.amount;
      else if (method === 'm-pesa' || method === 'mpesa') paymentBreakdown.mpesa += payment.amount;
      else if (method === 'bank_transfer' || method === 'bank') paymentBreakdown.bank += payment.amount;
      else if (method === 'credit') paymentBreakdown.credit += payment.amount;
    });

    // Format recent activity
    const formattedActivity: DashboardStats['recent_activity'] = (recentActivity || []).map((txn: any) => ({
      id: txn.id,
      type: (txn.type === 'EXPENSE_RETURN' ? 'reversal' : 'transaction') as 'transaction' | 'reversal',
      description: `${txn.type} - ${txn.entities?.display_name || 'Unknown'}${txn.reference ? ` (${txn.reference})` : ''}`,
      amount: txn.total_amount,
      timestamp: txn.transaction_date,
    }));

    return {
      total_revenue_today: (todayRevenue || []).reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0),
      total_revenue_week: (weekRevenue || []).reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0),
      total_revenue_month: (monthRevenue || []).reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0),
      transactions_today: todayCount || 0,
      transactions_week: weekCount || 0,
      outstanding_credit: (creditData || []).reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0),
      outstanding_debt: (debtData || []).reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0),
      payment_method_breakdown: paymentBreakdown,
      top_customers: topCustomers || [],
      recent_activity: formattedActivity,
    };
  }
}
