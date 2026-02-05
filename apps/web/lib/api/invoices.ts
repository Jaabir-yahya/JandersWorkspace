import { apiClient } from '../api-client';
import type { Invoice, InvoiceItem } from '../types';

export interface InvoiceListParams {
  page?: number;
  pageSize?: number;
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID';
  customerId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface InvoiceListResponse {
  data: Invoice[];
  total: number;
  page: number;
  pageSize: number;
}

export const invoicesApi = {
  /**
   * List invoices with pagination and filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of invoices
   */
  list: (params?: InvoiceListParams) =>
    apiClient.get<InvoiceListResponse>('/invoices', { params }),

  /**
   * Get a single invoice by ID
   * @param id - Invoice ID
   * @returns Invoice details
   */
  get: (id: string) => apiClient.get<Invoice>(`/invoices/${id}`),

  /**
   * Create a new invoice
   * @param data - Invoice data
   * @returns Created invoice
   */
  create: (data: Partial<Invoice>) => apiClient.post<Invoice>('/invoices', data),

  /**
   * Update an existing invoice
   * @param id - Invoice ID
   * @param data - Updated invoice data
   * @returns Updated invoice
   */
  update: (id: string, data: Partial<Invoice>) =>
    apiClient.put<Invoice>(`/invoices/${id}`, data),

  /**
   * Delete an invoice
   * @param id - Invoice ID
   * @returns Success message
   */
  delete: (id: string) => apiClient.delete<{ message: string }>(`/invoices/${id}`),

  /**
   * Send an invoice to customer
   * @param id - Invoice ID
   * @param email - Customer email (optional, uses invoice customer email if not provided)
   * @returns Updated invoice
   */
  send: (id: string, email?: string) =>
    apiClient.post<Invoice>(`/invoices/${id}/send`, { email }),

  /**
   * Mark an invoice as paid
   * @param id - Invoice ID
   * @param paymentMethod - Payment method used
   * @param amount - Amount paid (optional, defaults to invoice total)
   * @returns Updated invoice
   */
  markAsPaid: (id: string, paymentMethod: string, amount?: number) =>
    apiClient.post<Invoice>(`/invoices/${id}/pay`, { paymentMethod, amount }),

  /**
   * Void an invoice
   * @param id - Invoice ID
   * @param reason - Reason for voiding
   * @returns Updated invoice
   */
  void: (id: string, reason: string) =>
    apiClient.post<Invoice>(`/invoices/${id}/void`, { reason }),

  /**
   * Add an item to an invoice
   * @param id - Invoice ID
   * @param item - Invoice item to add
   * @returns Updated invoice
   */
  addItem: (id: string, item: Partial<InvoiceItem>) =>
    apiClient.post<Invoice>(`/invoices/${id}/items`, item),

  /**
   * Update an item in an invoice
   * @param id - Invoice ID
   * @param itemId - Invoice item ID
   * @param item - Updated invoice item data
   * @returns Updated invoice
   */
  updateItem: (id: string, itemId: string, item: Partial<InvoiceItem>) =>
    apiClient.put<Invoice>(`/invoices/${id}/items/${itemId}`, item),

  /**
   * Remove an item from an invoice
   * @param id - Invoice ID
   * @param itemId - Invoice item ID
   * @returns Updated invoice
   */
  removeItem: (id: string, itemId: string) =>
    apiClient.delete<Invoice>(`/invoices/${id}/items/${itemId}`),

  /**
   * Generate invoice PDF
   * @param id - Invoice ID
   * @returns PDF file
   */
  generatePdf: (id: string) =>
    apiClient.get<Blob>(`/invoices/${id}/pdf`, { responseType: 'blob' } as any),

  /**
   * Get invoice summary
   * @param params - Query parameters for filtering
   * @returns Invoice summary statistics
   */
  summary: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<{
      total: number;
      paid: number;
      pending: number;
      overdue: number;
      count: number;
    }>('/invoices/summary', { params }),
};
