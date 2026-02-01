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
import { ErrorBoundary } from "@/components/error-boundary";
import { FullPageLoader } from "@/components/loading";

export default function DashboardPage() {
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const { isLoading: isLoadingTransactions } = useTransactions();

  const isLoading = isLoadingStats || isLoadingTransactions;

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your business performance
          </p>
        </div>

        {isLoading ? (
          <FullPageLoader message="Loading dashboard..." />
        ) : (
          <>
            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today's Revenue
                  </CardTitle>
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
                  <CardTitle className="text-sm font-medium">
                    Outstanding Credit
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-32" />
                  ) : (
                    <div className="text-2xl font-bold font-mono">
                      {formatCurrency(stats?.outstanding_credit || 0, "KES")}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Money owed to you
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Outstanding Debt
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-32" />
                  ) : (
                    <div className="text-2xl font-bold font-mono">
                      {formatCurrency(stats?.outstanding_debt || 0, "KES")}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Money you owe suppliers
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Payment Methods (This Week)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Banknote className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Cash</p>
                      <p className="text-lg font-mono">
                        {formatCurrency(
                          stats?.payment_method_breakdown?.cash || 0,
                          "KES"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Smartphone className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">M-Pesa</p>
                      <p className="text-lg font-mono">
                        {formatCurrency(
                          stats?.payment_method_breakdown?.mpesa || 0,
                          "KES"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <CreditCard className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Bank</p>
                      <p className="text-lg font-mono">
                        {formatCurrency(
                          stats?.payment_method_breakdown?.bank || 0,
                          "KES"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Receipt className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Credit</p>
                      <p className="text-lg font-mono">
                        {formatCurrency(
                          stats?.payment_method_breakdown?.credit || 0,
                          "KES"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Customers & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Top Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : stats?.top_customers?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No customer data yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {stats?.top_customers?.map((customer) => (
                        <div
                          key={customer.entity_id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{customer.display_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {customer.transaction_count} transactions
                            </p>
                          </div>
                          <p className="font-mono font-semibold">
                            {formatCurrency(customer.total_amount, "KES")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : stats?.recent_activity?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No recent activity
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {stats?.recent_activity?.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={
                                activity.type === "transaction"
                                  ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                  : activity.type === "payment"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : activity.type === "reversal"
                                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                                  : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                              }
                            >
                              {activity.type}
                            </Badge>
                            <div>
                              <p className="text-sm">{activity.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {activity.amount && (
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
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
