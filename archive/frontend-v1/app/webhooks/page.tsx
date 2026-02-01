"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WebhookList } from "./components/webhook-list";
import { WebhookStats, ActivityChart } from "./components/webhook-stats";
import { WebhookDetail } from "./components/webhook-detail";
import { useWebhooks, useWebhookMonitor } from "./hooks/use-webhooks";
import {
  type WebhookEvent,
  type IntegrationType,
  type WebhookStatus,
} from "@/lib/api/webhooks";
import {
  RefreshCw,
  Filter,
  Webhook,
  Calendar,
  Activity,
} from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { FullPageLoader } from "@/components/loading";

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000000";

export default function WebhooksPage() {
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const {
    events,
    total,
    stats,
    isLoading,
    isStatsLoading,
    error,
    filters,
    setFilters,
    refresh,
    retryEvent,
    deleteEvent,
    page,
    setPage,
    pageSize,
    setPageSize,
  } = useWebhooks(DEFAULT_TENANT_ID);

  const { trend, eventsByHour } = useWebhookMonitor(DEFAULT_TENANT_ID);

  const handleViewDetail = (event: WebhookEvent) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedEvent(null);
  };

  const handleIntegrationChange = (value: string) => {
    setFilters({
      ...filters,
      integrationType: value === "all" ? undefined : (value as IntegrationType),
    });
  };

  const handleStatusChange = (value: string) => {
    setFilters({
      ...filters,
      status: value === "all" ? undefined : (value as WebhookStatus),
    });
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    setFilters({
      ...filters,
      [field]: value || undefined,
    });
  };

  const clearFilters = () => {
    setFilters({
      tenantId: DEFAULT_TENANT_ID,
      limit: pageSize,
      offset: 0,
    });
  };

  const activeFiltersCount = [
    filters.integrationType,
    filters.status,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-500 mb-2">
            Error Loading Webhooks
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message}
          </p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Webhook className="h-6 w-6 text-emerald-500" />
              Webhook Monitor
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor incoming webhooks from M-Pesa, WhatsApp, and other integrations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <WebhookStats
          stats={stats}
          isLoading={isStatsLoading}
          trend={trend}
        />

        {/* Activity Chart */}
        <ActivityChart data={eventsByHour} />

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </CardTitle>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Integration Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Integration
                </label>
                <Select
                  value={filters.integrationType || "all"}
                  onValueChange={handleIntegrationChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All integrations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All integrations</SelectItem>
                    <SelectItem value="MPESA">M-Pesa</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="QUICKBOOKS">QuickBooks</SelectItem>
                    <SelectItem value="XERO">Xero</SelectItem>
                    <SelectItem value="SHOPIFY">Shopify</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="RETRYING">Retrying</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) => handleDateChange("startDate", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  To Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.endDate || ""}
                    onChange={(e) => handleDateChange("endDate", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webhook List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Webhook Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WebhookList
              events={events}
              isLoading={isLoading}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onViewDetail={handleViewDetail}
              onRetry={retryEvent}
              onDelete={deleteEvent}
            />
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <WebhookDetail
          event={selectedEvent}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onRetry={retryEvent}
          onDelete={deleteEvent}
        />
      </div>
    </ErrorBoundary>
  );
}
