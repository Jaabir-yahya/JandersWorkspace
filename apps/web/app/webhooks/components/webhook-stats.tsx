"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { WebhookStats } from "@/lib/api/webhooks";

interface WebhookStatsProps {
  stats: WebhookStats | undefined;
  isLoading: boolean;
  trend?: number;
}

export function WebhookStats({ stats, isLoading, trend = 0 }: WebhookStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Events",
      value: stats?.total || 0,
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: trend,
    },
    {
      title: "Success Rate",
      value: stats ? `${stats.successRate.toFixed(1)}%` : "0%",
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      subtitle: stats
        ? `${stats.delivered} delivered`
        : "0 delivered",
    },
    {
      title: "Failed Events",
      value: stats?.failed || 0,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      subtitle: stats && stats.failed > 0
        ? `${((stats.failed / stats.total) * 100).toFixed(1)}% of total`
        : "No failures",
    },
    {
      title: "Pending",
      value: stats?.pending || 0,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      subtitle: stats && stats.pending > 0
        ? "Awaiting processing"
        : "All caught up",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`${card.bgColor} p-2 rounded-md`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{card.value}</span>
              {card.trend !== undefined && card.trend !== 0 && (
                <span
                  className={`flex items-center text-xs ${
                    card.trend > 0 ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {card.trend > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(card.trend).toFixed(1)}%
                </span>
              )}
            </div>
            {card.subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {card.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Mini chart component for 24-hour activity
interface ActivityChartProps {
  data: { hour: number; label: string; count: number }[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">24-Hour Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-24">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-1 group"
            >
              <div
                className="w-full bg-primary/20 rounded-t-sm transition-all group-hover:bg-primary/40 relative"
                style={{ height: `${(item.count / maxCount) * 100}%` }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                  {item.label}: {item.count} events
                </div>
              </div>
              {/* Show every 4th label */}
              {index % 4 === 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
