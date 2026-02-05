import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Generic fetcher for SWR
const fetcher = async (url: string) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Supply/Inventory hooks
export interface Supply {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  supplier: string;
  category: string;
  batchNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const useSupplies = () => {
  const { data, error, isLoading } = useSWR<Supply[]>("/supplies", fetcher);

  const createSupply = async (
    supplyData: Omit<Supply, "id" | "createdAt" | "updatedAt">,
  ) => {
    const response = await fetch(`${API_BASE_URL}/supplies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplyData),
    });

    if (!response.ok) {
      throw new Error("Failed to create supply");
    }

    // Update SWR cache
    mutate("/supplies");

    return response.json();
  };

  const updateSupply = async (id: string, supplyData: Partial<Supply>) => {
    const response = await fetch(`${API_BASE_URL}/supplies/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supplyData),
    });

    if (!response.ok) {
      throw new Error("Failed to update supply");
    }

    // Update SWR cache
    mutate("/supplies");

    return response.json();
  };

  const deleteSupply = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/supplies/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete supply");
    }

    // Update SWR cache
    mutate("/supplies");

    return response.json();
  };

  return {
    supplies: data || [],
    isLoading,
    error,
    createSupply,
    updateSupply,
    deleteSupply,
  };
};

// Invoice hooks
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  paymentStatus: "unpaid" | "partial" | "paid";
  paidAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export const useInvoices = () => {
  const { data, error, isLoading } = useSWR<Invoice[]>("/invoices", fetcher);

  const createInvoice = async (
    invoiceData: Omit<Invoice, "id" | "createdAt" | "updatedAt">,
  ) => {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      throw new Error("Failed to create invoice");
    }

    // Update SWR cache
    mutate("/invoices");

    return response.json();
  };

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      throw new Error("Failed to update invoice");
    }

    // Update SWR cache
    mutate("/invoices");

    return response.json();
  };

  const deleteInvoice = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete invoice");
    }

    // Update SWR cache
    mutate("/invoices");

    return response.json();
  };

  return {
    invoices: data || [],
    isLoading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
};

// Payment hooks
export interface Payment {
  id: string;
  invoiceId?: string;
  amount: number;
  paymentMethod: "cash" | "mpesa" | "bank" | "check" | "other";
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const usePayments = () => {
  const { data, error, isLoading } = useSWR<Payment[]>("/payments", fetcher);

  const createPayment = async (
    paymentData: Omit<Payment, "id" | "createdAt" | "updatedAt">,
  ) => {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error("Failed to create payment");
    }

    // Update SWR cache
    mutate("/payments");

    return response.json();
  };

  const updatePayment = async (id: string, paymentData: Partial<Payment>) => {
    const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error("Failed to update payment");
    }

    // Update SWR cache
    mutate("/payments");

    return response.json();
  };

  return {
    payments: data || [],
    isLoading,
    error,
    createPayment,
    updatePayment,
  };
};

// Ledger hooks for trial balance and transaction history
export interface LedgerEntry {
  id: string;
  account: string;
  debit: number;
  credit: number;
  description: string;
  entityType: "supply" | "invoice" | "payment" | "adjustment";
  entityId: string;
  createdAt: string;
}

export const useLedger = (filters?: {
  startDate?: string;
  endDate?: string;
  account?: string;
  entityType?: string;
}) => {
  const queryString = new URLSearchParams(filters as any).toString();
  const { data, error, isLoading } = useSWR<LedgerEntry[]>(
    `/ledger${queryString ? `?${queryString}` : ""}`,
    fetcher,
  );

  return {
    ledgerEntries: data || [],
    isLoading,
    error,
  };
};

// Dashboard hooks for KPIs and summary data
export interface DashboardKPI {
  totalBalance: number;
  cogs: number;
  supplierPayables: number;
  cashBalance: number;
  activeTenants?: number;
  unpaidInvoices: number;
  lowStockItems: number;
  overduePayments: number;
}

export const useDashboardKPI = () => {
  const { data, error, isLoading } = useSWR<DashboardKPI>(
    "/dashboard/kpi",
    fetcher,
  );

  return {
    kpi: data,
    isLoading,
    error,
  };
};

export interface RecentTransaction {
  id: string;
  type: "supply" | "invoice" | "payment";
  description: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
}

export const useRecentTransactions = (limit = 10) => {
  const { data, error, isLoading } = useSWR<RecentTransaction[]>(
    `/dashboard/recent-transactions?limit=${limit}`,
    fetcher,
  );

  return {
    transactions: data || [],
    isLoading,
    error,
  };
};

// Reports hooks
export interface TrialBalance {
  account: string;
  totalDebits: number;
  totalCredits: number;
  balance: number;
}

export const useTrialBalance = (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const { data, error, isLoading } = useSWR<TrialBalance[]>(
    `/reports/trial-balance${params.toString() ? `?${params.toString()}` : ""}`,
    fetcher,
  );

  return {
    trialBalance: data || [],
    isLoading,
    error,
  };
};

// Utility hook for exporting data
export const useExportData = () => {
  const exportToCSV = async (
    type: "supplies" | "invoices" | "payments" | "ledger",
    filters?: any,
  ) => {
    const params = new URLSearchParams(filters as any).toString();
    const response = await fetch(
      `${API_BASE_URL}/export/${type}${params ? `?${params}` : ""}`,
    );

    if (!response.ok) {
      throw new Error("Failed to export data");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportToJSON = async (
    type: "supplies" | "invoices" | "payments" | "ledger",
    filters?: any,
  ) => {
    const params = new URLSearchParams(filters as any).toString();
    const response = await fetch(
      `${API_BASE_URL}/export/${type}/json${params ? `?${params}` : ""}`,
    );

    if (!response.ok) {
      throw new Error("Failed to export data");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return {
    exportToCSV,
    exportToJSON,
  };
};
