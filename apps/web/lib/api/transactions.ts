import { apiClient, getCurrentTenantId } from '../api-client';
import type { Transaction } from '../types';

export interface TransactionListParams {
  tenant_id?: string | null;
  page?: number;
  pageSize?: number;
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  status?: 'PENDING' | 'COMPLETED' | 'VOID';
  category?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface TransactionListResponse {
  data: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export const transactionsApi = {
  /**
   * List transactions with pagination and filtering.
   * Backend requires tenant_id (validated against JWT). Pass tenant_id or it uses getCurrentTenantId().
   */
  list: (params?: TransactionListParams) => {
    const tid = params?.tenant_id ?? getCurrentTenantId();
    const { tenant_id: _, ...rest } = params ?? {};
    const query = { ...rest, tenant_id: tid };
    return apiClient.get<TransactionListResponse>('/transactions', { params: query });
  },

  /**
   * Get a single transaction by ID
   * @param id - Transaction ID
   * @returns Transaction details
   */
  get: (id: string) => apiClient.get<Transaction>(`/transactions/${id}`),

  /**
   * Create a new transaction
   * @param data - Transaction data
   * @returns Created transaction
   */
  create: (data: Partial<Transaction>) => apiClient.post<Transaction>('/transactions', data),

  /**
   * Update an existing transaction
   * @param id - Transaction ID
   * @param data - Updated transaction data
   * @returns Updated transaction
   */
  update: (id: string, data: Partial<Transaction>) =>
    apiClient.put<Transaction>(`/transactions/${id}`, data),

  /**
   * Delete a transaction
   * @param id - Transaction ID
   * @returns Success message
   */
  delete: (id: string) => apiClient.delete<{ message: string }>(`/transactions/${id}`),

  /**
   * Reverse a transaction
   * @param id - Transaction ID
   * @param reason - Reason for reversal
   * @returns Reversed transaction
   */
  reverse: (id: string, reason: string) =>
    apiClient.post<Transaction>(`/transactions/${id}/reverse`, { reason }),

  /**
   * Get transaction summary by category
   * @param params - Query parameters for filtering
   * @returns Transaction summary grouped by category
   */
  summary: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<{ category: string; total: number; count: number }[]>('/transactions/summary', { params }),

  /**
   * Get transaction balance
   * @param params - Query parameters for filtering
   * @returns Current balance
   */
  balance: (params?: { accountId?: string; startDate?: string; endDate?: string }) =>
    apiClient.get<{ balance: number; currency: string }>('/transactions/balance', { params }),
};
