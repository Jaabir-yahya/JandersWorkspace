"use client";

import { useDashboardStats, useTransactions } from "@/lib/api-client";
import { formatCurrency } from "@/lib/helpers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();

  const isLoading = isLoadingStats || isLoadingTransactions;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your business performance
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold font-mono">
                {formatCurrency(stats?.total_revenue_today || 0, "KES")}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {stats?.transactions_today || 0} transactions today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold font-mono">
                {formatCurrency(stats?.total_revenue_week || 0, "KES")}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {stats?.transactions_week || 0} transactions this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Wallet className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold font-mono">
                {formatCurrency(stats?.total_revenue_month || 0, "KES")}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Monthly revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Credit & Debt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Credit (Udhaari)</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold font-mono text-amber-500">
                {formatCurrency(stats?.outstanding_credit || 0, "KES")}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Money owed to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Debt</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold font-mono text-red-500">
                {formatCurrency(stats?.outstanding_debt || 0, "KES")}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Money you owe suppliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Method Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                <Banknote className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Cash</p>
                  <p className="text-lg font-mono font-semibold">
                    {formatCurrency(stats?.payment_method_breakdown?.cash || 0, "KES")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                <Smartphone className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">M-Pesa</p>
                  <p className="text-lg font-mono font-semibold">
                    {formatCurrency(stats?.payment_method_breakdown?.mpesa || 0, "KES")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                <CreditCard className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Bank</p>
                  <p className="text-lg font-mono font-semibold">
                    {formatCurrency(stats?.payment_method_breakdown?.bank || 0, "KES")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                <TrendingUp className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Credit</p>
                  <p className="text-lg font-mono font-semibold">
                    {formatCurrency(stats?.payment_method_breakdown?.credit || 0, "KES")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Customers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : stats?.top_customers?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No customer data yet</p>
            ) : (
              <div className="space-y-3">
                {stats?.top_customers?.map((customer, index) => (
                  <div
                    key={customer.entity_id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{customer.display_name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold">
                        {formatCurrency(customer.total_amount, "KES")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.transaction_count} transactions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : stats?.recent_activity?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {stats?.recent_activity?.slice(0, 10).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {activity.amount !== undefined && (
                      <p className="font-mono font-semibold">
                        {formatCurrency(activity.amount, "KES")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}