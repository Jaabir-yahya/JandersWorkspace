import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useDashboardStatsStore } from "../../store";

interface StatCardProps {
  title: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, trend, icon, color }: StatCardProps) {
  const isPositive = trend >= 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-4">
        <div
          className={`flex items-center gap-0.5 text-sm font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          {Math.abs(trend).toFixed(1)}%
        </div>
        <span className="text-sm text-muted-foreground">vs last period</span>
      </div>
    </div>
  );
}

export function StatsCards() {
  const { stats } = useDashboardStatsStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        trend={stats.revenueTrend}
        icon={<DollarSign className="w-5 h-5" />}
        color="#22c55e"
      />
      <StatCard
        title="Total Expenses"
        value={formatCurrency(stats.totalExpenses)}
        trend={stats.expensesTrend}
        icon={<TrendingDown className="w-5 h-5" />}
        color="#ef4444"
      />
      <StatCard
        title="Net Profit"
        value={formatCurrency(stats.netProfit)}
        trend={stats.profitTrend}
        icon={<TrendingUp className="w-5 h-5" />}
        color="#3b82f6"
      />
      <StatCard
        title="Active Customers"
        value={stats.activeCustomers.toString()}
        trend={stats.customersTrend}
        icon={<Users className="w-5 h-5" />}
        color="#8b5cf6"
      />
    </div>
  );
}
