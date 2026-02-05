'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Package,
  Users,
  Plus,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  FileText,
  Settings,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { formatCurrency, formatDate, formatPercentage, downloadAsCSV } from '@/lib/utils';
import { dashboardApi } from '@/lib/api/dashboard';
import type { DashboardStats, RecentActivity } from '@/lib/types';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, activityData] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.recentActivity(10),
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-baobab-900">Dashboard</h1>
          <p className="text-baobab-600 mt-1 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(new Date())}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/supplies"><Button variant="secondary" size="sm">Record purchase</Button></Link>
          <Link href="/invoices"><Button variant="secondary" size="sm">Create invoice</Button></Link>
          <Link href="/people"><Button variant="ghost" size="sm">People</Button></Link>
          <Link href="/reports"><Button variant="ghost" size="sm">Reports</Button></Link>
          <Button variant="secondary" onClick={handleExport}>Export Report</Button>
          <Button variant="primary" onClick={() => handleQuickAction('invoice')}>
            <Plus className="h-5 w-5 mr-2" />
            Quick Entry
          </Button>
        </div>
      </div>

      {/* Lighter use: prompt when no data — sign in or select tenant */}
      {stats.totalRevenue === 0 && stats.cashBalance === 0 && stats.accountsReceivable === 0 && recentActivity.length === 0 && (
        <div className="bg-savanna-50 border border-baobab-200 rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-baobab-700 text-sm">
            No data yet. Sign in or select a tenant to see your state and logs. Lighter use: you can still use Supplies, Invoices, and Reports once connected.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>Sign in</Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/tenant-select')}>Select tenant</Button>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {(stats.overdueInvoices > 0) && (
        <div className="bg-clay-50 border border-clay-200 rounded-lg p-4 animate-slide-down">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-clay-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-clay-900">
                {stats.overdueInvoices} overdue invoice{stats.overdueInvoices > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-clay-700 mt-1">
                Follow up with customers to collect payments
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/invoices')}>
              View Invoices
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards - 8 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="stat-card animate-slide-up">
          <CardBody className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-baobab-600">Total Revenue</span>
              <div className="p-2 bg-acacia-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-acacia-700" />
              </div>
            </div>
            <div className="currency text-2xl font-bold text-baobab-900 mb-2">
              {formatCurrency(stats.totalRevenue, stats.currency)}
            </div>
            <div className="flex items-center text-sm text-baobab-600">
              <span className="text-acacia-700 font-medium">This month</span>
            </div>
          </CardBody>
        </Card>

        {/* Total Expenses */}
        <Card className="stat-card animate-slide-up delay-100">
          <CardBody className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-baobab-600">Total Expenses</span>
              <div className="p-2 bg-clay-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-clay-700" />
              </div>
            </div>
            <div className="currency text-2xl font-bold text-baobab-900 mb-2">
              {formatCurrency(stats.totalExpenses, stats.currency)}
            </div>
            <div className="flex items-center text-sm text-baobab-600">
              <span className="text-clay-700 font-medium">This month</span>
            </div>
          </CardBody>
        </Card>

        {/* Net Income */}
        <Card className="stat-card animate-slide-up delay-200">
          <CardBody className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-baobab-600">Net Income</span>
              <div className="p-2 bg-savanna-200 rounded-lg">
                <DollarSign className="h-5 w-5 text-savanna-700" />
              </div>
            </div>
            <div className="currency text-2xl font-bold text-baobab-900 mb-2">
              {formatCurrency(stats.netIncome, stats.currency)}
            </div>
            <div className="flex items-center text-sm">
              <span className={`flex items-center font-medium ${stats.netIncome >= 0 ? 'text-acacia-700' : 'text-clay-700'}`}>
                {stats.netIncome >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {formatPercentage((stats.netIncome / stats.totalRevenue) * 100)}
              </span>
              <span className="text-baobab-500 ml-2">margin</span>
            </div>
          </CardBody>
        </Card>

        {/* Cash Balance */}
        <Card className="stat-card animate-slide-up delay-300">
          <CardBody className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-baobab-600">Cash Balance</span>
              <div className="p-2 bg-acacia-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-acacia-700" />
              </div>
            </div>
            <div className="currency text-2xl font-bold text-baobab-900 mb-2">
              {formatCurrency(stats.cashBalance, stats.currency)}
            </div>
            <div className="flex items-center text-sm text-baobab-600">
              Available funds
            </div>
          </CardBody>
        </Card>

        {/* Accounts Receivable */}
        <Card className="stat-card animate-slide-up delay-400">
          <CardBody className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-baobab-600">Accounts Receivable</span>
              <div className="p-2 bg-savanna-100 rounded-lg">
                <Users className="h-5 w-5 text-savanna-700" />
              </div>
            </div>
            <div className="currency text-2xl font-bold text-baobab-900 mb-2">
              {formatCurrency(stats.accountsReceivable, stats.currency)}
            </div>
            <div className="flex items-center text-sm text-baobab-600">
              Outstanding payments
            </div>
          </CardBody>
        </Card>

        {/* Accounts Payable */}
        <Card className="stat-card animate-slide-up delay-500">
          <CardBody className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-baobab-600">Accounts Payable</span>
              <div className="p-2 bg-clay-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-clay-700" />
              </div>
            </div>
            <div className="currency text-2xl font-bold text-baobab-900 mb-2">
              {formatCurrency(stats.accountsPayable, stats.currency)}
            </div>
            <div className="flex items-center text-sm text-baobab-600">
              Outstanding bills
            </div>
          </CardBody>
        </Card>

        {/* Inventory Value */}
        <Card className="stat-card animate-slide-up delay-600">
          <CardBody className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-baobab-600">Inventory Value</span>
              <div className="p-2 bg-acacia-100 rounded-lg">
                <Package className="h-5 w-5 text-acacia-700" />
              </div>
            </div>
            <div className="currency text-2xl font-bold text-baobab-900 mb-2">
              {formatCurrency(stats.inventoryValue, stats.currency)}
            </div>
            <div className="flex items-center text-sm text-baobab-600">
              Total stock value
            </div>
          </CardBody>
        </Card>

        {/* Overdue Invoices */}
        <Card className="stat-card animate-slide-up delay-700">
          <CardBody className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-baobab-600">Overdue Invoices</span>
              <div className="p-2 bg-clay-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-clay-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-baobab-900 mb-2">
              {stats.overdueInvoices}
            </div>
            <div className="flex items-center text-sm">
              {stats.overdueInvoices > 0 ? (
                <span className="text-clay-700 font-medium">Needs attention</span>
              ) : (
                <span className="text-acacia-700 font-medium">All paid</span>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-baobab-900">
              Recent Transactions
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push('/ledger')}>
              View All
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-baobab-200">
            {recentActivity.map((activity) => (
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
            ))}
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
