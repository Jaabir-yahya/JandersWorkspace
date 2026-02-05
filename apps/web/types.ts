// Core Types for Ledger System

export type Currency = 'KES' | 'USD' | 'EUR' | 'GBP';

export interface Money {
  amount: number;
  currency: Currency;
}

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  currency: Currency;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  reference?: string;
  entries: LedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  status: 'DRAFT' | 'POSTED' | 'VOID';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Supplies/Inventory Types

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  paymentTerms?: string;
  currency: Currency;
  balance: number;
  isActive: boolean;
}

export interface SupplyItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  unit: string;
  category?: string;
  reorderLevel?: number;
  currentStock: number;
  unitCost: number;
  currency: Currency;
}

export interface SupplyPurchase {
  id: string;
  date: string;
  reference: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  tax?: number;
  total: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  notes?: string;
  status: 'PENDING' | 'RECEIVED' | 'PAID' | 'CANCELLED';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  supplyItemId: string;
  supplyItemName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

// Invoice/Payment Types

export interface Customer {
  id: string;
  name: string;
  code: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  paymentTerms?: string;
  currency: Currency;
  balance: number;
  isActive: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  total: number;
  amountPaid: number;
  balance: number;
  currency: Currency;
  notes?: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type PaymentMethod = 
  | 'MPESA' 
  | 'BANK_TRANSFER' 
  | 'CASH' 
  | 'CHEQUE' 
  | 'CARD' 
  | 'OTHER';

export interface Payment {
  id: string;
  date: string;
  reference: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  mpesaCode?: string;
  bankReference?: string;
  notes?: string;
  transactionId?: string;
  createdAt: string;
}

// Dashboard KPIs

export interface KPIData {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  expenses: {
    current: number;
    previous: number;
    change: number;
  };
  profit: {
    current: number;
    previous: number;
    change: number;
  };
  cashBalance: number;
  receivables: number;
  payables: number;
  inventory: {
    value: number;
    lowStockItems: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'PURCHASE' | 'INVOICE' | 'PAYMENT' | 'EXPENSE';
  description: string;
  amount: number;
  currency: Currency;
  date: string;
}

// Audit Log

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
}

// Form State Types

export interface SupplyPurchaseForm {
  date: string;
  reference: string;
  supplierId: string;
  items: PurchaseItem[];
  paymentMethod: PaymentMethod;
  paymentReference: string;
  notes: string;
}

export interface InvoiceForm {
  date: string;
  dueDate: string;
  customerId: string;
  items: InvoiceItem[];
  notes: string;
}

export interface PaymentForm {
  date: string;
  reference: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  mpesaCode: string;
  bankReference: string;
  notes: string;
}

// UI State

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface FilterOptions {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  customerId?: string;
  supplierId?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Offline Support

export interface OfflineQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: string;
  retries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync?: string;
  pendingItems: number;
  isSyncing: boolean;
}
