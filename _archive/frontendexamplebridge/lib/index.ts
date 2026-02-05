// Core business entities

export interface Tenant {
  id: string;
  name: string;
  currency: Currency;
  fiscalYearStart: Date;
  locale: string;
  timezone: string;
  settings: TenantSettings;
}

export interface TenantSettings {
  enableMultiCurrency: boolean;
  defaultPaymentTerms: number; // days
  taxRate: number; // percentage
  enableInventoryTracking: boolean;
  enableAdvancedAccounting: boolean;
}

export type Currency = 'KES' | 'USD' | 'EUR' | 'GBP' | 'UGX' | 'TZS' | 'RWF';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  decimals: number;
}

// Accounting core types

export type AccountType = 
  | 'ASSET' 
  | 'LIABILITY' 
  | 'EQUITY' 
  | 'REVENUE' 
  | 'EXPENSE';

export type AccountSubType =
  | 'CASH'
  | 'BANK'
  | 'ACCOUNTS_RECEIVABLE'
  | 'INVENTORY'
  | 'FIXED_ASSET'
  | 'ACCOUNTS_PAYABLE'
  | 'CREDIT_CARD'
  | 'LOAN'
  | 'SALES'
  | 'COST_OF_GOODS_SOLD'
  | 'OPERATING_EXPENSE'
  | 'OTHER_INCOME'
  | 'OTHER_EXPENSE';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subType: AccountSubType;
  currency: Currency;
  balance: number;
  isActive: boolean;
  parentId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  date: Date;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  currency: Currency;
  exchangeRate?: number;
  referenceType?: string;
  referenceId?: string;
  createdAt: Date;
  createdBy: string;
}

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  type: TransactionType;
  entries: LedgerEntry[];
  attachments: Attachment[];
  status: TransactionStatus;
  totalAmount: number;
  currency: Currency;
  createdAt: Date;
  createdBy: string;
  approvedAt?: Date;
  approvedBy?: string;
}

export type TransactionType =
  | 'PURCHASE'
  | 'SALE'
  | 'PAYMENT'
  | 'RECEIPT'
  | 'TRANSFER'
  | 'ADJUSTMENT'
  | 'OPENING_BALANCE';

export type TransactionStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'POSTED'
  | 'VOID';

// Inventory & Supplies

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: Unit;
  quantity: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  currency: Currency;
  supplier?: Supplier;
  location?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Unit = 
  | 'PIECE'
  | 'KG'
  | 'LITRE'
  | 'METER'
  | 'BOX'
  | 'CARTON'
  | 'DOZEN'
  | 'SACK'
  | 'BUNDLE';

export interface StockMovement {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  date: Date;
  reference?: string;
  notes?: string;
  transactionId?: string;
  createdAt: Date;
  createdBy: string;
}

export type MovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'RETURN'
  | 'ADJUSTMENT'
  | 'TRANSFER'
  | 'DAMAGE'
  | 'WRITE_OFF';

// Invoices & Payments

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  date: Date;
  dueDate: Date;
  customer?: Customer;
  supplier?: Supplier;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  currency: Currency;
  paymentTerms?: string;
  notes?: string;
  attachments: Attachment[];
  transactionId?: string;
  createdAt: Date;
  createdBy: string;
  approvedAt?: Date;
  approvedBy?: string;
}

export type InvoiceType = 'SALES' | 'PURCHASE';

export type InvoiceStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'SENT'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'VOID';

export interface InvoiceLineItem {
  id: string;
  itemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate: number;
  total: number;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  type: PaymentType;
  method: PaymentMethod;
  date: Date;
  amount: number;
  currency: Currency;
  invoiceId?: string;
  customerId?: string;
  supplierId?: string;
  accountId: string;
  reference?: string;
  notes?: string;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: Date;
  createdBy: string;
}

export type PaymentType = 'RECEIPT' | 'PAYMENT';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CHEQUE'
  | 'MPESA'
  | 'CARD'
  | 'OTHER_MOBILE_MONEY';

export type PaymentStatus =
  | 'PENDING'
  | 'CLEARED'
  | 'BOUNCED'
  | 'CANCELLED';

// Customers & Suppliers

export interface Customer {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  taxId?: string;
  creditLimit?: number;
  paymentTerms?: number;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  taxId?: string;
  paymentTerms?: number;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
}

// Attachments & Audit

export interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'VOID'
  | 'EXPORT'
  | 'LOGIN'
  | 'LOGOUT';

// Dashboard & Reports

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  cashBalance: number;
  accountsReceivable: number;
  accountsPayable: number;
  inventoryValue: number;
  overdueInvoices: number;
  currency: Currency;
  period: DateRange;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ReportFilter {
  dateRange: DateRange;
  accountIds?: string[];
  categories?: string[];
  status?: string[];
  currency?: Currency;
}

// API Response types

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
