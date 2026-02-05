'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign,
  CreditCard,
  Package,
  Plus,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  FileText,
  Settings,
  BookOpen,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { formatCurrency, formatDate, downloadAsCSV } from '@/lib/utils';
import { dashboardApi } from '@/lib/api/dashboard';
import { reportingApi } from '@/lib/api/reporting';
import { getApiErrorMessage } from '@/lib/api-client';
import type { DashboardStats, RecentActivity } from '@/lib/types';
import type { TrialBalanceResponse } from '@/lib/api/reporting';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, activityData, trialData] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.recentActivity(10),
        reportingApi.trialBalance().catch(() => null),
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
      setTrialBalance(trialData ?? null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setStats({
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
        cashBalance: 0,
        accountsReceivable: 0,
        accountsPayable: 0,
        inventoryValue: 0,
        overdueInvoices: 0,
        currency: 'KES',
      });
      setRecentActivity([]);
      setTrialBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!stats) return;
    const csvData = [
      {
        Metric: 'Total Revenue',
        Value: stats.totalRevenue,
        Currency: stats.currency,
      },
      {
        Metric: 'Total Expenses',
        Value: stats.totalExpenses,
        Currency: stats.currency,
      },
      {
        Metric: 'Net Income',
        Value: stats.netIncome,
        Currency: stats.currency,
      },
      {
        Metric: 'Cash Balance',
        Value: stats.cashBalance,
        Currency: stats.currency,
      },
      {
        Metric: 'Accounts Receivable',
        Value: stats.accountsReceivable,
        Currency: stats.currency,
      },
      {
        Metric: 'Accounts Payable',
        Value: stats.accountsPayable,
        Currency: stats.currency,
      },
      {
        Metric: 'Inventory Value',
        Value: stats.inventoryValue,
        Currency: stats.currency,
      },
      {
        Metric: 'Overdue Invoices',
        Value: stats.overdueInvoices,
        Currency: 'Count',
      },
    ];
    downloadAsCSV(csvData, 'dashboard-kpis');
    toast.success('Dashboard exported successfully');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'purchase':
        router.push('/supplies');
        break;
      case 'invoice':
        router.push('/invoices');
        break;
      case 'payment':
        router.push('/invoices');
        break;
      case 'settings':
        router.push('/settings');
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeleton h-32 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-baobab-600">Failed to load dashboard data</p>
      </div>
    );
  }

  // Active variables: anything with a balance or count for quick view (ledger + dashboard mains)
  type ActiveRow = { id: string; label: string; value: number; unit: 'currency' | 'count'; type?: 'DEBIT' | 'CREDIT' };
  const activeRows: ActiveRow[] = [];
  if (trialBalance?.accounts?.length) {
    trialBalance.accounts.forEach((acc) => {
      activeRows.push({ id: acc.id, label: acc.name, value: acc.balance, unit: 'currency', type: acc.type as 'DEBIT' | 'CREDIT' });
    });
  }
  activeRows.push(
    { id: 'rev', label: 'Total revenue (month)', value: stats.totalRevenue, unit: 'currency' },
    { id: 'exp', label: 'Total expenses', value: stats.totalExpenses, unit: 'currency' },
    { id: 'net', label: 'Net income', value: stats.netIncome, unit: 'currency' },
    { id: 'cash', label: 'Cash & payments', value: stats.cashBalance, unit: 'currency' },
    { id: 'ar', label: 'Accounts receivable', value: stats.accountsReceivable, unit: 'currency' },
    { id: 'ap', label: 'Accounts payable', value: stats.accountsPayable, unit: 'currency' },
    { id: 'inv', label: 'Inventory value', value: stats.inventoryValue, unit: 'currency' },
    { id: 'overdue', label: 'Overdue invoices', value: stats.overdueInvoices, unit: 'count' },
  );
  const showTypeCol = Boolean(trialBalance?.accounts?.length);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-baobab-900">Dashboard</h1>
          <p className="text-baobab-600 mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(new Date())}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchDashboardData}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
          <Link href="/supplies"><Button variant="secondary" size="sm">Record purchase</Button></Link>
          <Link href="/invoices"><Button variant="primary" size="sm"><Plus className="h-4 w-4 mr-1" />Quick entry</Button></Link>
          <Link href="/reports"><Button variant="ghost" size="sm">Reports</Button></Link>
          <Button variant="ghost" size="sm" onClick={handleExport}>Export</Button>
        </div>
      </div>

      {/* Empty state */}
      {stats.totalRevenue === 0 && stats.cashBalance === 0 && stats.accountsReceivable === 0 && recentActivity.length === 0 && (
        <div className="bg-savanna-50 border border-baobab-200 rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-baobab-700 text-sm">No data yet. Select a tenant to see active state and recent activity.</p>
          <Button variant="ghost" size="sm" onClick={() => router.push('/tenant-select')}>Select tenant</Button>
        </div>
      )}

      {/* Overdue alert */}
      {stats.overdueInvoices > 0 && (
        <div className="bg-clay-50 border border-clay-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-clay-600 shrink-0" />
            <span className="text-sm font-medium text-clay-900">
              {stats.overdueInvoices} overdue invoice{stats.overdueInvoices > 1 ? 's' : ''} – follow up on payments
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/invoices')}>View Invoices</Button>
        </div>
      )}

      {/* Active – variables with a balance or count for quick view (ledger + dashboard mains) */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-display font-semibold text-baobab-900 flex items-center gap-2">
                <Scale className="h-5 w-5 text-savanna-600" />
                Active
              </h2>
              <p className="text-sm text-baobab-600 mt-1">
                Variables with a balance or count for quick view – ledger accounts and dashboard mains. Verify in Ledger or Reports.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/ledger"><Button variant="secondary" size="sm"><BookOpen className="h-4 w-4 mr-1" />Ledger</Button></Link>
              <Link href="/reports"><Button variant="ghost" size="sm">Reports <ArrowUpRight className="h-4 w-4 ml-0.5 inline" /></Button></Link>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-baobab-200 bg-savanna-50/60">
                  <th className="text-left px-6 py-3 font-medium text-baobab-700">Variable</th>
                  {showTypeCol && <th className="text-left px-6 py-3 font-medium text-baobab-700 w-24">Type</th>}
                  <th className="text-right px-6 py-3 font-medium text-baobab-700">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-baobab-100">
                {activeRows.map((row) => (
                  <tr key={row.id} className="hover:bg-savanna-50/40">
                    <td className="px-6 py-2.5 font-medium text-baobab-900">{row.label}</td>
                    {showTypeCol && (
                      <td className="px-6 py-2.5">
                        {row.type ? <span className={row.type === 'DEBIT' ? 'text-savanna-700' : 'text-clay-700'}>{row.type}</span> : <span className="text-baobab-400">—</span>}
                      </td>
                    )}
                    <td className="px-6 py-2.5 text-right font-semibold text-baobab-900">
                      {row.unit === 'currency' ? formatCurrency(row.value, stats.currency) : row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showTypeCol && trialBalance && (
            <div className="px-6 py-3 border-t border-baobab-200 bg-savanna-50/40 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-baobab-600">
                Debits: <strong>{formatCurrency(trialBalance.summary.totalDebits, stats.currency)}</strong>
                {' · '}
                Credits: <strong>{formatCurrency(trialBalance.summary.totalCredits, stats.currency)}</strong>
              </span>
              {trialBalance.summary.isBalanced ? <Badge variant="success">Balanced</Badge> : <Badge variant="warning">Unbalanced</Badge>}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Recent – activity only */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-baobab-900">
              Recent
            </h2>
            <Link href="/ledger">
              <Button variant="ghost" size="sm">View all <ArrowUpRight className="h-4 w-4 ml-1 inline" /></Button>
            </Link>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-baobab-200">
            {recentActivity.length === 0 ? (
              <div className="px-6 py-8 text-center text-baobab-500 text-sm">No recent activity. Record a purchase or create an invoice to see it here.</div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-savanna-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'invoice' ? 'bg-acacia-100' :
                        activity.type === 'payment' ? 'bg-savanna-200' :
                        activity.type === 'expense' ? 'bg-clay-100' : 'bg-baobab-100'
                      }`}>
                        {activity.type === 'invoice' && <FileText className="h-5 w-5 text-acacia-700" />}
                        {activity.type === 'payment' && <DollarSign className="h-5 w-5 text-savanna-700" />}
                        {activity.type === 'expense' && <Package className="h-5 w-5 text-clay-700" />}
                      </div>
                      <div>
                        <p className="font-medium text-baobab-900">{activity.description}</p>
                        <p className="text-sm text-baobab-500">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="currency font-bold text-baobab-900">
                        {formatCurrency(activity.amount, stats.currency)}
                      </p>
                      <Badge variant={activity.type === 'payment' ? 'success' : 'info'}>
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card interactive className="p-6 group cursor-pointer" onClick={() => handleQuickAction('purchase')}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display font-semibold text-lg text-baobab-900 mb-2">
                Record Purchase
              </h3>
              <p className="text-sm text-baobab-600 mb-4">
                Add new inventory or expense purchases
              </p>
              <kbd className="kbd">Ctrl+N</kbd>
            </div>
            <Package className="h-8 w-8 text-acacia-600 group-hover:scale-110 transition-transform" />
          </div>
        </Card>

        <Card interactive className="p-6 group cursor-pointer" onClick={() => handleQuickAction('invoice')}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display font-semibold text-lg text-baobab-900 mb-2">
                Create Invoice
              </h3>
              <p className="text-sm text-baobab-600 mb-4">
                Generate invoice for customer
              </p>
              <kbd className="kbd">Ctrl+I</kbd>
            </div>
            <FileText className="h-8 w-8 text-savanna-600 group-hover:scale-110 transition-transform" />
          </div>
        </Card>

        <Card interactive className="p-6 group cursor-pointer" onClick={() => handleQuickAction('payment')}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display font-semibold text-lg text-baobab-900 mb-2">
                Record Payment
              </h3>
              <p className="text-sm text-baobab-600 mb-4">
                Log MPesa or bank payments
              </p>
              <kbd className="kbd">Ctrl+P</kbd>
            </div>
            <DollarSign className="h-8 w-8 text-clay-600 group-hover:scale-110 transition-transform" />
          </div>
        </Card>

        <Card interactive className="p-6 group cursor-pointer" onClick={() => handleQuickAction('settings')}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display font-semibold text-lg text-baobab-900 mb-2">
                Settings
              </h3>
              <p className="text-sm text-baobab-600 mb-4">
                Configure your business settings
              </p>
              <kbd className="kbd">Ctrl+S</kbd>
            </div>
            <Settings className="h-8 w-8 text-baobab-600 group-hover:scale-110 transition-transform" />
          </div>
        </Card>
      </div>
    </div>
  );
}
