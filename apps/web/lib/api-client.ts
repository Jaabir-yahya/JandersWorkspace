import useSWR, { mutate } from "swr";
import axios, { AxiosError } from "axios";
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
} from "./types";

/**
 * Default tenant/user IDs for development
 * In production, these should come from authentication context
 * @deprecated Use proper multi-tenant authentication instead
 */
export const DEFAULT_TENANT_ID =
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ||
  "00000000-0000-0000-0000-000000000000";
export const DEFAULT_USER_ID =
  process.env.NEXT_PUBLIC_DEFAULT_USER_ID ||
  "00000000-0000-0000-0000-000000000000";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

/**
 * Custom API error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout for slow connections
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
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
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as { message?: string; error?: string };
      const message = data?.message || data?.error || `HTTP Error ${status}`;

      // Handle specific error cases
      if (status === 401) {
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        return Promise.reject(new ApiError("Authentication required", 401, data));
      }

      if (status === 403) {
        return Promise.reject(new ApiError("Access denied", 403, data));
      }

      if (status === 404) {
        return Promise.reject(new ApiError("Resource not found", 404, data));
      }

      if (status >= 500) {
        return Promise.reject(
          new ApiError("Server error. Please try again later.", status, data),
        );
      }

      return Promise.reject(new ApiError(message, status, data));
    }

    if (error.request) {
      // Request was made but no response received
      return Promise.reject(
        new ApiError(
          "Network error. Please check your connection.",
          undefined,
          error.request,
        ),
      );
    }

    // Something else happened
    return Promise.reject(
      new ApiError(error.message || "An unexpected error occurred"),
    );
  },
);

/**
 * SWR fetcher with data transformation and error handling
 * @param url - The API endpoint URL
 * @returns Transformed response data
 * @throws ApiError on request failure
 */
 
const fetcher = async <T = any>(url: string): Promise<T> => {
  try {
    const res = await api.get<T>(url);
    // Handle array responses (lists)
    if (Array.isArray(res.data)) {
      return res.data.map(transformTransaction) as T;
    }
    // Handle single object responses
    if (res.data && typeof res.data === "object") {
      return transformTransaction(res.data) as T;
    }
    return res.data;
  } catch (error) {
    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error;
    }
    // Wrap other errors
    throw new ApiError(
      error instanceof Error ? error.message : "Failed to fetch data",
    );
  }
};

// Transform API response to match frontend types
function transformTransaction(apiData: any): any {
  if (!apiData || typeof apiData !== "object") return apiData;

  return {
    ...apiData,
    // Map API's createdAt to frontend's transaction_date
    transaction_date:
      apiData.transaction_date || apiData.createdAt || apiData.created_at,
  };
}

// ====================
// Transaction Hooks
// ====================

/**
 * Hook for fetching transactions with optional filters
 * @param filters - Optional transaction filters
 * @returns SWR response with transactions array
 */
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

  return useSWR<Transaction[]>(url, fetcher<Transaction[]>, {
    refreshInterval: 30000, // Poll every 30 seconds (reduced from 5s for performance)
    revalidateOnFocus: true,
    // Add caching for better performance
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
  });
}

/**
 * Hook for fetching a single transaction by ID
 * @param id - Transaction ID
 * @returns SWR response with transaction data
 */
export function useTransaction(id: string) {
  return useSWR<Transaction>(
    id ? `/transactions/${id}` : null,
    fetcher<Transaction>,
  );
}

export async function createTransaction(data: CreateTransactionInput) {
  const response = await api.post<Transaction>("/transactions", data);
  mutate("/transactions");
  return response.data;
}

export async function postTransaction(id: string, userId: string) {
  const response = await api.post<Transaction>(`/transactions/${id}/post`, {
    user_id: userId,
  });
  mutate(`/transactions/${id}`);
  mutate("/transactions");
  return response.data;
}

export async function reverseTransaction(
  id: string,
  data: ReverseTransactionInput,
) {
  const response = await api.post<Transaction>(
    `/transactions/${id}/reverse`,
    data,
  );
  mutate(`/transactions/${id}`);
  mutate("/transactions");
  return response.data;
}

export async function updatePaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
) {
  const response = await api.patch<Transaction>(
    `/transactions/${id}/payment_status`,
    { payment_status: paymentStatus },
  );
  mutate(`/transactions/${id}`);
  mutate("/transactions");
  return response.data;
}

// ====================
// Entity Hooks
// ====================

/**
 * Hook for fetching entities with optional filters
 * @param filters - Optional entity search filters
 * @returns SWR response with entities array
 */
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

  return useSWR<Entity[]>(url, fetcher<Entity[]>, {
    refreshInterval: 60000, // Poll every 60 seconds (reduced from 10s for performance)
    dedupingInterval: 10000, // Dedupe requests within 10 seconds
  });
}

/**
 * Hook for fetching a single entity by ID
 * @param id - Entity ID
 * @returns SWR response with entity data
 */
export function useEntity(id: string) {
  return useSWR<Entity>(id ? `/entities/${id}` : null, fetcher<Entity>);
}

/**
 * Hook for fetching entity 360 view with transactions
 * @param id - Entity ID
 * @returns SWR response with entity data and transactions
 */
export function useEntity360View(id: string) {
  return useSWR<EntityWithBalance & { transactions: Transaction[] }>(
    id ? `/entities/${id}/360-view?tenant_id=${DEFAULT_TENANT_ID}` : null,
    fetcher<EntityWithBalance & { transactions: Transaction[] }>,
  );
}

/**
 * Hook for fetching entity balance
 * @param id - Entity ID
 * @returns SWR response with balance data
 */
export function useEntityBalance(id: string) {
  return useSWR<{ balance: number; total_credit: number; total_debit: number }>(
    id ? `/entities/${id}/balance` : null,
    fetcher<{ balance: number; total_credit: number; total_debit: number }>,
  );
}

/**
 * Hook for searching entities by phone number
 * @param phone - Phone number to search
 * @returns SWR response with matching entities
 */
export function useSearchEntitiesByPhone(phone: string) {
  return useSWR<Entity[]>(
    phone ? `/entities/search?phone=${encodeURIComponent(phone)}` : null,
    fetcher<Entity[]>,
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
  const response = await api.post<Entity>(`/entities/${id}/linked-phones`, {
    phone,
  });
  mutate(`/entities/${id}/360-view?tenant_id=${DEFAULT_TENANT_ID}`);
  return response.data;
}

export async function removeLinkedPhone(id: string, phone: string) {
  const response = await api.delete<Entity>(`/entities/${id}/linked-phones`, {
    data: { phone },
  });
  mutate(`/entities/${id}/360-view?tenant_id=${DEFAULT_TENANT_ID}`);
  return response.data;
}

// ====================
// Payment Records Hooks
// ====================

/**
 * Hook for fetching payment records for a transaction
 * @param transactionId - Transaction ID
 * @returns SWR response with payment records
 */
export function usePaymentRecords(transactionId: string) {
  return useSWR<PaymentRecord[]>(
    transactionId ? `/payment-records/transaction/${transactionId}` : null,
    fetcher<PaymentRecord[]>,
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

/**
 * Hook for fetching attachments for a transaction
 * @param transactionId - Transaction ID
 * @returns SWR response with attachments
 */
export function useAttachmentsForTransaction(transactionId: string) {
  return useSWR<Attachment[]>(
    transactionId ? `/attachments/transaction/${transactionId}` : null,
    fetcher<Attachment[]>,
  );
}

/**
 * Hook for fetching attachments for an entity
 * @param entityId - Entity ID
 * @returns SWR response with attachments
 */
export function useAttachmentsForEntity(entityId: string) {
  return useSWR<Attachment[]>(
    entityId ? `/attachments/entity/${entityId}` : null,
    fetcher<Attachment[]>,
  );
}

export async function uploadAttachment(
  file: File,
  options: { transactionId?: string; entityId?: string; userId: string },
) {
  const formData = new FormData();
  formData.append("file", file);
  if (options.transactionId)
    formData.append("transaction_id", options.transactionId);
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

export async function deleteAttachment(
  id: string,
  parentId: string,
  parentType: "transaction" | "entity",
) {
  await api.delete(`/attachments/${id}`);
  mutate(`/attachments/${parentType}/${parentId}`);
}

// ====================
// Dashboard Hooks
// ====================

/**
 * Hook for fetching dashboard statistics
 * @returns SWR response with dashboard stats
 */
export function useDashboardStats() {
  return useSWR<DashboardStats>(
    `/dashboard/stats?tenant_id=${DEFAULT_TENANT_ID}`,
    fetcher<DashboardStats>,
    {
      refreshInterval: 60000, // Refresh every 60 seconds (reduced from 30s for performance)
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      revalidateOnFocus: false, // Don't revalidate on focus to reduce API calls
    },
  );
}

export default api;
