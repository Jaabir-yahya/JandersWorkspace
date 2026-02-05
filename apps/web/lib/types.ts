export type Currency = "KES" | "USD" | "EUR" | "GBP" | "UGX" | "TZS" | "RWF";

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  decimals: number;
}

export interface KPIData {
  revenue: MetricData;
  expenses: MetricData;
  profit: MetricData;
  invoices: MetricData;
}

export interface MetricData {
  current: number;
  previous: number;
  change: number;
}

export interface RecentActivity {
  id: string;
  type: "invoice" | "payment" | "expense" | "supply";
  description: string;
  amount: number;
  date: string;
  status?: string;
}

export interface SupplyPurchaseForm {
  date: string;
  reference: string;
  supplierId: string;
  items: PurchaseItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  notes?: string;
  /** Link to inventory container (receive into) — posts to ledger with containerId */
  containerId?: string;
}

export interface PurchaseItem {
  id?: string;
  supplyId?: string;
  supplyItemId?: string;
  description?: string;
  supplyItemName?: string;
  quantity: number;
  unitPrice?: number;
  unitCost?: number;
  total: number;
}

export interface LedgerEntry {
  id: string;
  date: string;
  reference?: string;
  description?: string;
  debit: number;
  credit: number;
  balance: number;
  category: string;
  accountId?: string;
  accountCode?: string;
  accountName?: string;
  currency?: Currency;
  fromAccountId?: string;
  toAccountId?: string;
  amount?: number;
  reasonId?: string;
  entityId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  currency?: Currency;
  balance?: number;
  isActive: boolean;
}

export interface SupplyItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  unit?: string;
  currentStock?: number;
  unitCost?: number;
  unitPrice?: number;
  category?: string;
  sku?: string;
  currency?: Currency;
  isActive?: boolean;
}

export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "MPESA"
  | "CARD"
  | "OTHER_MOBILE_MONEY";

/**
 * Dashboard statistics showing key financial metrics
 */
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
}

/**
 * Inventory item representing a product in stock
 */
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  unit: "PIECE" | "KG" | "LITRE" | "BOX" | "CARTON" | "SACK";
  quantity: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  currency: Currency;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Universal Truth Transaction representing a double-entry financial transaction
 */
export interface Transaction {
  id: string;
  tenantId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  reasonId?: string;
  entityId?: string;
  notes?: string;
  reference?: string;
  metadata?: Record<string, any>;
  reversalId?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Invoice representing a customer invoice
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: Currency;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
  items: InvoiceItem[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Individual line item within an invoice
 */
export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Invoice form data for creating/editing invoices
 */
export interface InvoiceForm {
  customerId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
}

/**
 * Universal Truth Entity (replaces Customer/Supplier)
 */
export interface Entity {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  type: "CUSTOMER" | "SUPPLIER" | "AGENT" | "CONTACT";
  isActive: boolean;
  metadata?: Record<string, any>;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Customer information (legacy - mapped to Entity type=CUSTOMER)
 */
export interface Customer {
  id: string;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  currency?: Currency;
  balance?: number;
  isActive: boolean;
}

/**
 * Universal Truth Account representing a ledger account
 */
export interface Account {
  id: string;
  tenantId: string;
  name: string;
  type:
    | "CASH"
    | "BANK"
    | "AGENT"
    | "INVENTORY"
    | "FX_FLOAT"
    | "CLEARING"
    | "TRUST";
  balance: number;
  currency: Currency;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Business representing a company/organization
 */
export interface Business {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  currency: Currency;
  taxId?: string;
  logo?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Offline support (used by store)
export interface OfflineQueueItem {
  id: string;
  type: "CREATE" | "UPDATE" | "DELETE";
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

/**
 * Universal Truth Proof representing document attachments
 */
export interface Proof {
  id: string;
  tenantId: string;
  transactionId: string;
  type: "RECEIPT" | "INVOICE" | "SWIFT" | "UPLOAD" | "WHATSAPP" | "SCREENSHOT";
  reference?: string;
  metadata?: Record<string, any>;
  filePath?: string;
  createdAt: string;
}

/**
 * Universal Truth TransactionReason
 */
export interface TransactionReason {
  id: string;
  tenantId: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER" | "ADJUSTMENT";
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Universal Truth Tenant
 */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  accountingStandard: "SIMPLE" | "IFRS" | "CASH";
  isAdminTenant: boolean;
  currency: string;
  country: string;
  isActive: boolean;
  capabilities: Record<string, any>;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
