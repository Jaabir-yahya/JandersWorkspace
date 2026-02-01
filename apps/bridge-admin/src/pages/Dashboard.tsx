import { useEffect } from "react";
import {
  Plus,
  Download,
  FileText,
  Users,
  Package,
  CreditCard,
} from "lucide-react";
import { StatsCards } from "../components/dashboard/StatsCards";
import { RevenueChart } from "../components/charts/RevenueChart";
import {
  useDashboardStatsStore,
  useTransactionsStore,
  useUIStore,
  usePeopleStore,
} from "../store";

function RecentTransactions() {
  const { transactions } = useTransactionsStore();
  const { getPersonById } = usePeopleStore();
  const recent = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Transactions
        </h3>
        <button
          onClick={() => useUIStore.getState().setCurrentView("transactions")}
          className="text-sm text-primary hover:underline"
        >
          View all
        </button>
      </div>
      <div className="space-y-3">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No transactions yet
          </p>
        ) : (
          recent.map((transaction) => {
            const person = transaction.personId
              ? getPersonById(transaction.personId)
              : null;
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 hover:bg-accent rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "sale"
                        ? "bg-green-100 text-green-600"
                        : transaction.type === "expense"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {transaction.type === "sale" ? (
                      <CreditCard className="w-5 h-5" />
                    ) : transaction.type === "expense" ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <Package className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {person?.name || transaction.personName || "No person"} •{" "}
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-medium ${
                    transaction.type === "sale" || transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "sale" || transaction.type === "income"
                    ? "+"
                    : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function QuickActions() {
  const { setCurrentView } = useUIStore();

  const actions = [
    {
      label: "Add Transaction",
      icon: Plus,
      onClick: () => setCurrentView("transactions"),
      color: "bg-primary text-primary-foreground",
    },
    {
      label: "Add Person",
      icon: Users,
      onClick: () => setCurrentView("people"),
      color: "bg-secondary text-secondary-foreground",
    },
    {
      label: "Add Item",
      icon: Package,
      onClick: () => setCurrentView("items"),
      color: "bg-secondary text-secondary-foreground",
    },
    {
      label: "Export Data",
      icon: Download,
      onClick: () => {
        const csv = useTransactionsStore.getState().exportTransactions();
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
      color: "bg-secondary text-secondary-foreground",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`flex items-center gap-2 p-3 rounded-md transition-colors ${action.color} hover:opacity-90`}
          >
            <action.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AlertsSection() {
  const { stats } = useDashboardStatsStore();

  const alerts = [
    {
      type: "warning",
      message: `${stats.pendingCredit} transactions with pending credit`,
      action: "Review",
    },
    {
      type: "error",
      message: `${stats.lowStockItems} items low on stock`,
      action: "View items",
    },
    {
      type: "info",
      message: `${stats.pendingTransactions} pending transactions`,
      action: "View",
    },
  ].filter((alert) => {
    if (alert.message.includes("pending credit"))
      return stats.pendingCredit > 0;
    if (alert.message.includes("low on stock")) return stats.lowStockItems > 0;
    if (alert.message.includes("pending transactions"))
      return stats.pendingTransactions > 0;
    return false;
  });

  if (alerts.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-yellow-800 mb-2">Alerts</h3>
      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-yellow-700">{alert.message}</span>
            <button className="text-yellow-800 font-medium hover:underline">
              {alert.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { refreshStats } = useDashboardStatsStore();
  const { stats } = useDashboardStatsStore();

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month" selected>
              This Month
            </option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <AlertsSection />
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <RecentTransactions />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Today's Revenue</p>
          <p className="text-2xl font-bold text-foreground">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(stats.totalRevenue / 30)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">This Week</p>
          <p className="text-2xl font-bold text-foreground">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(stats.totalRevenue / 4)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Transactions</p>
          <p className="text-2xl font-bold text-foreground">
            {stats.pendingTransactions + 124}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg. Transaction</p>
          <p className="text-2xl font-bold text-foreground">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(
              stats.totalRevenue / (stats.pendingTransactions + 124 || 1),
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
