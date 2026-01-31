import useSWR, { mutate } from "swr";
import axios from "axios";
import type {
  Transaction,
  Entity,
  EntityWithBalance,
  CreateTransactionInput,
  CreateEntityInput,
  UpdateEntityInput,
  TransactionFilters,
  EntitySearchFilters,
  ReverseTransactionInput,
  PaymentStatus,
  Attachment,
  DashboardStats,
  PaymentRecord,
  CreatePaymentInput,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request/Response interceptors for auth
api.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// SWR fetcher
const fetcher = (url: string) => api.get(url).then((res) => res.data);

// ====================
// Transaction Hooks
// ====================

export function useTransactions(filters?: TransactionFilters) {
  const params = new URLSearchParams();
  // Always include tenant_id
  params.append("tenant_id", DEFAULT_TENANT_ID);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
  }
  const query = params.toString();
  const url = `/transactions${query ? `?${query}` : ""}`;
  
  return useSWR<Transaction[]>(url, fetcher, {
    refreshInterval: 5000, // Poll every 5 seconds
    revalidateOnFocus: true,
  });
}

export function useTransaction(id: string) {
  return useSWR<Transaction>(id ? `/transactions/${id}` : null, fetcher);
}

export async function createTransaction(data: CreateTransactionInput) {
  const response = await api.post<Transaction>("/transactions", data);
  mutate("/transactions");
  return response.data;
}

export async function postTransaction(id: string, userId: string) {
  const response = await api.post<Transaction>(`/transactions/${id}/post`, { user_id: userId });
  mutate(`/transactions/${id}`);
  mutate("/transactions");
  return response.data;
}

export async function reverseTransaction(id: string, data: ReverseTransactionInput) {
  const response = await api.post<Transaction>(`/transactions/${id}/reverse`, data);
  mutate(`/transactions/${id}`);
  mutate("/transactions");
  return response.data;
}

export async function updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
  const response = await api.patch<Transaction>(`/transactions/${id}/payment_status`, { payment_status: paymentStatus });
  mutate(`/transactions/${id}`);
  mutate("/transactions");
  return response.data;
}

// ====================
// Entity Hooks
// ====================

export function useEntities(filters?: EntitySearchFilters) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
  }
  const query = params.toString();
  const url = `/entities${query ? `?${query}` : ""}`;
  
  return useSWR<Entity[]>(url, fetcher, {
    refreshInterval: 10000,
  });
}

export function useEntity(id: string) {
  return useSWR<Entity>(id ? `/entities/${id}` : null, fetcher);
}

export function useEntity360View(id: string) {
  return useSWR<EntityWithBalance & { transactions: Transaction[] }>(
    id ? `/entities/${id}/360-view` : null,
    fetcher
  );
}

export function useEntityBalance(id: string) {
  return useSWR<{ balance: number; total_credit: number; total_debit: number }>(
    id ? `/entities/${id}/balance` : null,
    fetcher
  );
}

export function useSearchEntitiesByPhone(phone: string) {
  return useSWR<Entity[]>(
    phone ? `/entities/search?phone=${encodeURIComponent(phone)}` : null,
    fetcher
  );
}

export async function createEntity(data: CreateEntityInput) {
  const response = await api.post<Entity>("/entities", data);
  mutate("/entities");
  return response.data;
}

export async function updateEntity(id: string, data: UpdateEntityInput) {
  const response = await api.patch<Entity>(`/entities/${id}`, data);
  mutate(`/entities/${id}`);
  mutate("/entities");
  return response.data;
}

export async function addLinkedPhone(id: string, phone: string) {
  const response = await api.post<Entity>(`/entities/${id}/linked-phones`, { phone });
  mutate(`/entities/${id}`);
  return response.data;
}

export async function removeLinkedPhone(id: string, phone: string) {
  const response = await api.delete<Entity>(`/entities/${id}/linked-phones`, { data: { phone } });
  mutate(`/entities/${id}`);
  return response.data;
}

// ====================
// Payment Records Hooks
// ====================

export function usePaymentRecords(transactionId: string) {
  return useSWR<PaymentRecord[]>(
    transactionId ? `/payment-records/transaction/${transactionId}` : null,
    fetcher
  );
}

export async function createPaymentRecord(data: {
  transaction_id: string;
  method: string;
  amount: number;
  reference?: string;
  paid_at?: string;
}) {
  const response = await api.post<PaymentRecord>("/payment-records", data);
  mutate(`/payment-records/transaction/${data.transaction_id}`);
  mutate(`/transactions/${data.transaction_id}`);
  return response.data;
}

export async function deletePaymentRecord(id: string, transactionId: string) {
  await api.delete(`/payment-records/${id}`);
  mutate(`/payment-records/transaction/${transactionId}`);
  mutate(`/transactions/${transactionId}`);
}

// ====================
// Attachment Hooks
// ====================

export function useAttachmentsForTransaction(transactionId: string) {
  return useSWR<Attachment[]>(
    transactionId ? `/attachments/transaction/${transactionId}` : null,
    fetcher
  );
}

export function useAttachmentsForEntity(entityId: string) {
  return useSWR<Attachment[]>(
    entityId ? `/attachments/entity/${entityId}` : null,
    fetcher
  );
}

export async function uploadAttachment(
  file: File,
  options: { transactionId?: string; entityId?: string; userId: string }
) {
  const formData = new FormData();
  formData.append("file", file);
  if (options.transactionId) formData.append("transaction_id", options.transactionId);
  if (options.entityId) formData.append("entity_id", options.entityId);
  formData.append("user_id", options.userId);

  const response = await api.post<Attachment>("/attachments/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (options.transactionId) {
    mutate(`/attachments/transaction/${options.transactionId}`);
  }
  if (options.entityId) {
    mutate(`/attachments/entity/${options.entityId}`);
  }

  return response.data;
}

export async function deleteAttachment(id: string, parentId: string, parentType: "transaction" | "entity") {
  await api.delete(`/attachments/${id}`);
  mutate(`/attachments/${parentType}/${parentId}`);
}

// ====================
// Dashboard Hooks
// ====================

export function useDashboardStats() {
  return useSWR<DashboardStats>(`/dashboard/stats?tenant_id=${DEFAULT_TENANT_ID}`, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });
}

// ====================
// Helper Constants
// ====================

export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000000";
export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

export default api;
