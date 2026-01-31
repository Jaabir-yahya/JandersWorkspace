import useSWR from "swr";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout for slow connections
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // localStorage not available (SSR or private mode)
  }
  return config;
});

// SWR fetcher
const fetcher = (url: string) => api.get(url).then((res) => res.data);

// Webhook types
export type WebhookStatus = "PENDING" | "DELIVERED" | "FAILED" | "RETRYING";
export type IntegrationType = "MPESA" | "WHATSAPP" | "QUICKBOOKS" | "XERO" | "SHOPIFY";
export type EventType =
  | "transaction.created"
  | "transaction.updated"
  | "transaction.posted"
  | "transaction.reversed"
  | "payment.received"
  | "payment.failed"
  | "entity.created"
  | "entity.updated"
  | "invoice.generated"
  | "sync.completed"
  | "message.received"
  | "message.sent";

export interface WebhookEvent {
  id: string;
  tenantId: string;
  integrationType: IntegrationType;
  eventType: EventType;
  payload: Record<string, any>;
  status: WebhookStatus;
  processed: boolean;
  retryCount: number;
  errorMessage?: string;
  createdAt: string;
  processedAt?: string;
  nextRetryAt?: string;
}

export interface WebhookStats {
  total: number;
  pending: number;
  delivered: number;
  failed: number;
  successRate: number;
}

export interface WebhookFilters {
  tenantId?: string;
  integrationType?: IntegrationType;
  eventType?: EventType;
  status?: WebhookStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// Hook for fetching webhooks with filters
export function useWebhooks(filters?: WebhookFilters) {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
  }

  const query = params.toString();
  const url = `/webhooks/events${query ? `?${query}` : ""}`;

  return useSWR<{ events: WebhookEvent[]; total: number }>(url, fetcher, {
    refreshInterval: 10000, // Poll every 10 seconds
    revalidateOnFocus: true,
  });
}

// Hook for fetching a single webhook
export function useWebhook(id: string) {
  return useSWR<WebhookEvent>(id ? `/webhooks/events/${id}` : null, fetcher);
}

// Hook for fetching webhook stats
export function useWebhookStats(tenantId?: string) {
  const params = tenantId ? `?tenantId=${tenantId}` : "";
  return useSWR<WebhookStats>(`/webhooks/stats${params}`, fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });
}

// API functions
export async function retryWebhook(id: string, force = false): Promise<WebhookEvent> {
  const response = await api.post<WebhookEvent>(`/webhooks/events/${id}/retry`, { force });
  return response.data;
}

export async function deleteWebhook(id: string): Promise<void> {
  await api.delete(`/webhooks/events/${id}`);
}

export async function cleanupOldWebhooks(olderThanDays = 30): Promise<{ deleted: number }> {
  const response = await api.post<{ deleted: number }>("/webhooks/cleanup", {
    olderThanDays,
  });
  return response.data;
}

// Helper functions
export function getStatusColor(status: WebhookStatus): string {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "PENDING":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "FAILED":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "RETRYING":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
}

export function getIntegrationColor(integration: IntegrationType): string {
  switch (integration) {
    case "MPESA":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "WHATSAPP":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "QUICKBOOKS":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "XERO":
      return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
    case "SHOPIFY":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
}

export function formatWebhookTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
