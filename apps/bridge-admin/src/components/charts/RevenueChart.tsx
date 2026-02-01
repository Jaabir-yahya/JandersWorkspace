import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTransactionsStore } from "../../store";
import { useMemo } from "react";
import type { TimeSeriesData } from "../../types";

export function RevenueChart() {
  const { transactions } = useTransactionsStore();

  const data = useMemo<TimeSeriesData[]>(() => {
    const days = 30;
    const today = new Date();
    const result: TimeSeriesData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      const dayTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date).toISOString().split("T")[0];
        return tDate === dateString;
      });

      const revenue = dayTransactions
        .filter((t) => t.type === "sale" && !t.isCredit)
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = dayTransactions
        .filter((t) => t.type === "expense" || t.type === "purchase")
        .reduce((sum, t) => sum + t.amount, 0);

      result.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue,
        expenses,
        profit: revenue - expenses,
        transactions: dayTransactions.length,
      });
    }

    return result;
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Revenue Overview
          </h3>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Profit</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `KES ${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value) => [formatCurrency(Number(value)), ""]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
