import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ApiResponse, PaginationParams } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Create axios instance with default configuration
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for auth tokens
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();

/**
 * Generic API request wrapper
 */
async function request<T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
        message:
          error.response?.data?.error?.message ||
          error.message ||
          'An error occurred',
        details: error.response?.data?.error?.details,
      },
    };
  }
}

/**
 * Build query string from pagination params
 */
function buildQueryString(params: PaginationParams = {}): string {
  const query = new URLSearchParams();
  
  if (params.page) query.append('page', params.page.toString());
  if (params.pageSize) query.append('pageSize', params.pageSize.toString());
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);
  
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * API methods
 */
export const api = {
  // Accounts
  accounts: {
    list: (params?: PaginationParams) =>
      request({
        method: 'GET',
        url: `/accounts${buildQueryString(params)}`,
      }),
    
    get: (id: string) =>
      request({
        method: 'GET',
        url: `/accounts/${id}`,
      }),
    
    create: (data: any) =>
      request({
        method: 'POST',
        url: '/accounts',
        data,
      }),
    
    update: (id: string, data: any) =>
      request({
        method: 'PUT',
        url: `/accounts/${id}`,
        data,
      }),
    
    delete: (id: string) =>
      request({
        method: 'DELETE',
        url: `/accounts/${id}`,
      }),
    
    getBalance: (id: string, date?: Date) =>
      request({
        method: 'GET',
        url: `/accounts/${id}/balance${date ? `?date=${date.toISOString()}` : ''}`,
      }),
  },

  // Ledger
  ledger: {
    list: (params?: PaginationParams & { accountId?: string; dateFrom?: Date; dateTo?: Date }) =>
      request({
        method: 'GET',
        url: `/ledger${buildQueryString(params)}`,
      }),
    
    get: (id: string) =>
      request({
        method: 'GET',
        url: `/ledger/${id}`,
      }),
  },

  // Transactions
  transactions: {
    list: (params?: PaginationParams & { type?: string; status?: string }) =>
      request({
        method: 'GET',
        url: `/transactions${buildQueryString(params)}`,
      }),
    
    get: (id: string) =>
      request({
        method: 'GET',
        url: `/transactions/${id}`,
      }),
    
    create: (data: any) =>
      request({
        method: 'POST',
        url: '/transactions',
        data,
      }),
    
    update: (id: string, data: any) =>
      request({
        method: 'PUT',
        url: `/transactions/${id}`,
        data,
      }),
    
    approve: (id: string) =>
      request({
        method: 'POST',
        url: `/transactions/${id}/approve`,
      }),
    
    void: (id: string) =>
      request({
        method: 'POST',
        url: `/transactions/${id}/void`,
      }),
  },

  // Inventory
  inventory: {
    list: (params?: PaginationParams & { category?: string; lowStock?: boolean }) =>
      request({
        method: 'GET',
        url: `/inventory${buildQueryString(params)}`,
      }),
    
    get: (id: string) =>
      request({
        method: 'GET',
        url: `/inventory/${id}`,
      }),
    
    create: (data: any) =>
      request({
        method: 'POST',
        url: '/inventory',
        data,
      }),
    
    update: (id: string, data: any) =>
      request({
        method: 'PUT',
        url: `/inventory/${id}`,
        data,
      }),
    
    delete: (id: string) =>
      request({
        method: 'DELETE',
        url: `/inventory/${id}`,
      }),
    
    movements: (id: string, params?: PaginationParams) =>
      request({
        method: 'GET',
        url: `/inventory/${id}/movements${buildQueryString(params)}`,
      }),
    
    adjustStock: (id: string, data: any) =>
      request({
        method: 'POST',
        url: `/inventory/${id}/adjust`,
        data,
      }),
  },

  // Invoices
  invoices: {
    list: (params?: PaginationParams & { type?: string; status?: string }) =>
      request({
        method: 'GET',
        url: `/invoices${buildQueryString(params)}`,
      }),
    
    get: (id: string) =>
      request({
        method: 'GET',
        url: `/invoices/${id}`,
      }),
    
    create: (data: any) =>
      request({
        method: 'POST',
        url: '/invoices',
        data,
      }),
    
    update: (id: string, data: any) =>
      request({
        method: 'PUT',
        url: `/invoices/${id}`,
        data,
      }),
    
    delete: (id: string) =>
      request({
        method: 'DELETE',
        url: `/invoices/${id}`,
      }),
    
    approve: (id: string) =>
      request({
        method: 'POST',
        url: `/invoices/${id}/approve`,
      }),
    
    void: (id: string) =>
      request({
        method: 'POST',
        url: `/invoices/${id}/void`,
      }),
    
    downloadPdf: (id: string) =>
      apiClient.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      }),
  },

  // Payments
  payments: {
    list: (params?: PaginationParams & { type?: string; method?: string }) =>
      request({
        method: 'GET',
        url: `/payments${buildQueryString(params)}`,
      }),
    
    get: (id: string) =>
      request({
        method: 'GET',
        url: `/payments/${id}`,
      }),
    
    create: (data: any) =>
      request({
        method: 'POST',
        url: '/payments',
        data,
      }),
    
    update: (id: string, data: any) =>
      request({
        method: 'PUT',
        url: `/payments/${id}`,
        data,
      }),
    
    void: (id: string) =>
      request({
        method: 'POST',
        url: `/payments/${id}/void`,
      }),
  },

  // Customers
  customers: {
    list: (params?: PaginationParams & { search?: string }) =>
      request({
        method: 'GET',
        url: `/customers${buildQueryString(params)}`,
      }),
    
    get: (id: string) =>
      request({
        method: 'GET',
        url: `/customers/${id}`,
      }),
    
    create: (data: any) =>
      request({
        method: 'POST',
        url: '/customers',
        data,
      }),
    
    update: (id: string, data: any) =>
      request({
        method: 'PUT',
        url: `/customers/${id}`,
        data,
      }),
    
    delete: (id: string) =>
      request({
        method: 'DELETE',
        url: `/customers/${id}`,
      }),
    
    invoices: (id: string, params?: PaginationParams) =>
      request({
        method: 'GET',
        url: `/customers/${id}/invoices${buildQueryString(params)}`,
      }),
    
    payments: (id: string, params?: PaginationParams) =>
      request({
        method: 'GET',
        url: `/customers/${id}/payments${buildQueryString(params)}`,
      }),
  },

  // Suppliers
  suppliers: {
    list: (params?: PaginationParams & { search?: string }) =>
      request({
        method: 'GET',
        url: `/suppliers${buildQueryString(params)}`,
      }),
    
    get: (id: string) =>
      request({
        method: 'GET',
        url: `/suppliers/${id}`,
      }),
    
    create: (data: any) =>
      request({
        method: 'POST',
        url: '/suppliers',
        data,
      }),
    
    update: (id: string, data: any) =>
      request({
        method: 'PUT',
        url: `/suppliers/${id}`,
        data,
      }),
    
    delete: (id: string) =>
      request({
        method: 'DELETE',
        url: `/suppliers/${id}`,
      }),
    
    invoices: (id: string, params?: PaginationParams) =>
      request({
        method: 'GET',
        url: `/suppliers/${id}/invoices${buildQueryString(params)}`,
      }),
    
    payments: (id: string, params?: PaginationParams) =>
      request({
        method: 'GET',
        url: `/suppliers/${id}/payments${buildQueryString(params)}`,
      }),
  },

  // Dashboard
  dashboard: {
    stats: (dateFrom?: Date, dateTo?: Date) =>
      request({
        method: 'GET',
        url: `/dashboard/stats${dateFrom && dateTo ? `?from=${dateFrom.toISOString()}&to=${dateTo.toISOString()}` : ''}`,
      }),
    
    revenueChart: (period: 'day' | 'week' | 'month' | 'year', count: number) =>
      request({
        method: 'GET',
        url: `/dashboard/revenue-chart?period=${period}&count=${count}`,
      }),
    
    expenseChart: (period: 'day' | 'week' | 'month' | 'year', count: number) =>
      request({
        method: 'GET',
        url: `/dashboard/expense-chart?period=${period}&count=${count}`,
      }),
    
    topCustomers: (limit: number = 10) =>
      request({
        method: 'GET',
        url: `/dashboard/top-customers?limit=${limit}`,
      }),
    
    topSuppliers: (limit: number = 10) =>
      request({
        method: 'GET',
        url: `/dashboard/top-suppliers?limit=${limit}`,
      }),
  },

  // Reports
  reports: {
    profitAndLoss: (dateFrom: Date, dateTo: Date) =>
      request({
        method: 'GET',
        url: `/reports/profit-loss?from=${dateFrom.toISOString()}&to=${dateTo.toISOString()}`,
      }),
    
    balanceSheet: (date: Date) =>
      request({
        method: 'GET',
        url: `/reports/balance-sheet?date=${date.toISOString()}`,
      }),
    
    trialBalance: (date: Date) =>
      request({
        method: 'GET',
        url: `/reports/trial-balance?date=${date.toISOString()}`,
      }),
    
    cashFlow: (dateFrom: Date, dateTo: Date) =>
      request({
        method: 'GET',
        url: `/reports/cash-flow?from=${dateFrom.toISOString()}&to=${dateTo.toISOString()}`,
      }),
    
    agingReport: (type: 'receivable' | 'payable', date: Date) =>
      request({
        method: 'GET',
        url: `/reports/aging/${type}?date=${date.toISOString()}`,
      }),
    
    inventoryValuation: (date: Date) =>
      request({
        method: 'GET',
        url: `/reports/inventory-valuation?date=${date.toISOString()}`,
      }),
    
    exportPdf: (reportType: string, params: any) =>
      apiClient.post(`/reports/${reportType}/pdf`, params, {
        responseType: 'blob',
      }),
    
    exportExcel: (reportType: string, params: any) =>
      apiClient.post(`/reports/${reportType}/excel`, params, {
        responseType: 'blob',
      }),
  },
};
