"use client";

import { useState, useCallback, useEffect } from "react";
import {
  useWebhooks as useWebhooksSWR,
  useWebhookStats as useWebhookStatsSWR,
  retryWebhook,
  deleteWebhook,
  type WebhookEvent,
  type WebhookFilters,
  type WebhookStats,
} from "@/lib/api/webhooks";

interface UseWebhooksReturn {
  events: WebhookEvent[];
  total: number;
  stats: WebhookStats | undefined;
  isLoading: boolean;
  isStatsLoading: boolean;
  error: Error | null;
  filters: WebhookFilters;
  setFilters: (filters: WebhookFilters) => void;
  refresh: () => void;
  retryEvent: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

const DEFAULT_PAGE_SIZE = 20;

export function useWebhooks(tenantId?: string): UseWebhooksReturn {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFiltersState] = useState<WebhookFilters>({
    tenantId,
    limit: DEFAULT_PAGE_SIZE,
    offset: 0,
  });

  // Update filters when pagination changes
  useEffect(() => {
    setFiltersState((prev) => ({
      ...prev,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }));
  }, [page, pageSize]);

  // Fetch webhooks and stats
  const {
    data: webhooksData,
    error: webhooksError,
    isLoading: isWebhooksLoading,
    mutate: mutateWebhooks,
  } = useWebhooksSWR(filters);

  const {
    data: statsData,
    isLoading: isStatsLoading,
    mutate: mutateStats,
  } = useWebhookStatsSWR(tenantId);

  // Set up auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      mutateWebhooks();
      mutateStats();
    }, 10000);

    return () => clearInterval(interval);
  }, [mutateWebhooks, mutateStats]);

  // Filter handlers
  const setFilters = useCallback((newFilters: WebhookFilters) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      offset: 0, // Reset to first page when filters change
    }));
    setPage(1);
  }, []);

  // Refresh function
  const refresh = useCallback(() => {
    mutateWebhooks();
    mutateStats();
  }, [mutateWebhooks, mutateStats]);

  // Retry a failed webhook
  const retryEvent = useCallback(
    async (id: string) => {
      await retryWebhook(id, true);
      refresh();
    },
    [refresh]
  );

  // Delete a webhook event
  const deleteEvent = useCallback(
    async (id: string) => {
      await deleteWebhook(id);
      refresh();
    },
    [refresh]
  );

  return {
    events: webhooksData?.events || [],
    total: webhooksData?.total || 0,
    stats: statsData,
    isLoading: isWebhooksLoading,
    isStatsLoading,
    error: webhooksError || null,
    filters,
    setFilters,
    refresh,
    retryEvent,
    deleteEvent,
    page,
    setPage,
    pageSize,
    setPageSize,
  };
}

// Hook for real-time webhook monitoring
export function useWebhookMonitor(tenantId?: string) {
  const [recentEvents, setRecentEvents] = useState<WebhookEvent[]>([]);
  const { events, stats, isLoading, error, refresh } = useWebhooks(tenantId);

  // Keep track of recent events (last 24 hours)
  useEffect(() => {
    if (events) {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const recent = events.filter(
        (event) => new Date(event.createdAt) > twentyFourHoursAgo
      );
      setRecentEvents(recent);
    }
  }, [events]);

  // Calculate trend (compare last hour to previous hour)
  const getTrend = useCallback(() => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const lastHour = recentEvents.filter(
      (e) => new Date(e.createdAt) > oneHourAgo
    ).length;
    const previousHour = recentEvents.filter(
      (e) => {
        const date = new Date(e.createdAt);
        return date > twoHoursAgo && date <= oneHourAgo;
      }
    ).length;

    if (previousHour === 0) return lastHour > 0 ? 100 : 0;
    return ((lastHour - previousHour) / previousHour) * 100;
  }, [recentEvents]);

  // Get events by hour for charting
  const getEventsByHour = useCallback(() => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - (23 - i));
      return hour;
    });

    return hours.map((hour) => {
      const nextHour = new Date(hour.getTime() + 60 * 60 * 1000);
      const count = recentEvents.filter((e) => {
        const date = new Date(e.createdAt);
        return date >= hour && date < nextHour;
      }).length;
      return {
        hour: hour.getHours(),
        label: hour.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        }),
        count,
      };
    });
  }, [recentEvents]);

  return {
    events,
    recentEvents,
    stats,
    isLoading,
    error,
    refresh,
    trend: getTrend(),
    eventsByHour: getEventsByHour(),
  };
}
