'use client';

import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  FileText,
  AlertCircle,
  Package,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { DashboardStats } from '@/types';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.dashboard.stats();
      return response.data as DashboardStats;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0, stats?.currency),
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(stats?.totalExpenses || 0, stats?.currency),
      icon: TrendingDown,
      trend: '+8.2%',
      trendUp: false,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
    },
    {
      title: 'Net Income',
      value: formatCurrency(stats?.netIncome || 0, stats?.currency),
      icon: TrendingUp,
      trend: '+18.7%',
      trendUp: true,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Cash Balance',
      value: formatCurrency(stats?.cashBalance || 0, stats?.currency),
      icon: DollarSign,
      trend: '-3.1%',
      trendUp: false,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      title: 'Accounts Receivable',
      value: formatCurrency(stats?.accountsReceivable || 0, stats?.currency),
      icon: Users,
      trend: '+5.4%',
      trendUp: true,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Accounts Payable',
      value: formatCurrency(stats?.accountsPayable || 0, stats?.currency),
      icon: FileText,
      trend: '-2.8%',
      trendUp: false,
      color: 'text-neutral-600',
      bgColor: 'bg-neutral-50',
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(stats?.inventoryValue || 0, stats?.currency),
      icon: Package,
      trend: '+1.2%',
      trendUp: true,
      color: 'text-neutral-600',
      bgColor: 'bg-neutral-50',
    },
    {
      title: 'Overdue Invoices',
      value: formatNumber(stats?.overdueInvoices || 0),
      icon: AlertCircle,
      trend: stats?.overdueInvoices && stats.overdueInvoices > 0 ? 'Action required' : 'All clear',
      trendUp: false,
      color: stats?.overdueInvoices && stats.overdueInvoices > 0 ? 'text-danger-600' : 'text-success-600',
      bgColor: stats?.overdueInvoices && stats.overdueInvoices > 0 ? 'bg-danger-50' : 'bg-success-50',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">
            Overview of your business performance
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50">
            This Month
          </button>
          <button className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50">
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-neutral-900 mt-2">
                  {card.value}
                </p>
              </div>
              <div className={`${card.bgColor} ${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
              {card.trendUp ? (
                <TrendingUp className="w-4 h-4 text-success-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  card.trendUp ? 'text-success-600' : 'text-danger-600'
                }`}
              >
                {card.trend}
              </span>
              <span className="text-sm text-neutral-500 ml-1">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <ShoppingCart className="w-6 h-6 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-700">
              New Purchase
            </span>
            <kbd className="kbd">Ctrl+P</kbd>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <FileText className="w-6 h-6 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-700">
              New Invoice
            </span>
            <kbd className="kbd">Ctrl+I</kbd>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <DollarSign className="w-6 h-6 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-700">
              Record Payment
            </span>
            <kbd className="kbd">Ctrl+M</kbd>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Package className="w-6 h-6 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-700">
              Add Inventory
            </span>
            <kbd className="kbd">Ctrl+N</kbd>
          </button>
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Recent Transactions
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      Invoice #INV-{1000 + i}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900">
                    KSh {(50000 + i * 1000).toLocaleString()}
                  </p>
                  <span className="inline-block px-2 py-1 text-xs font-medium text-success-700 bg-success-50 rounded">
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Alerts & Notifications
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-danger-900">
                  5 Overdue Invoices
                </p>
                <p className="text-sm text-danger-700 mt-1">
                  Total amount: KSh 450,000
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <Package className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning-900">
                  Low Stock Items: 8
                </p>
                <p className="text-sm text-warning-700 mt-1">
                  Reorder needed for multiple items
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <FileText className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-primary-900">
                  3 Pending Approvals
                </p>
                <p className="text-sm text-primary-700 mt-1">
                  Transactions awaiting approval
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
