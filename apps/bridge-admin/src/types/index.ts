// Core data types for the bridge-admin dashboard
// Reused from bridge-perfect with admin-specific extensions

// ==================== CORE TYPES (from bridge-perfect) ====================

export type PersonType = "customer" | "supplier" | "employee" | "other";

export interface Person {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  type: PersonType;
  photo?: string;
  address?: string;
  notes?: string;
  tags: string[];

  creditBalance: number;
  totalSpent: number;
  totalSupplied: number;
  transactionCount: number;
  lastTransactionDate?: Date;

  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export type TransactionType =
  | "sale"
  | "expense"
  | "purchase"
  | "income"
  | "refund";
export type PaymentMethod =
  | "cash"
  | "mpesa"
  | "credit"
  | "bank"
  | "mobile_money"
  | "other";
export type TransactionStatus = "draft" | "confirmed" | "reconciled";

export interface TransactionLineItem {
  id: string;
  itemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;

  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;

  lineItems?: TransactionLineItem[];

  personId?: string;
  personName?: string;

  description: string;
  category?: string;
  tags: string[];

  receiptPhoto?: string;
  receiptNumber?: string;

  isCredit: boolean;
  creditDueDate?: Date;
  creditPaid: boolean;

  notes?: string;
  voiceNoteUrl?: string;

  date: Date;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
  tenantId?: string;
}

export type ItemType = "product" | "service" | "raw_material" | "other";

export interface Item {
  id: string;
  name: string;
  description?: string;
  type: ItemType;

  photos: string[];

  currentStock: number;
  unit: string;
  reorderLevel: number;
  maxStock?: number;

  costPrice: number;
  sellingPrice: number;
  avgCostPrice?: number;

  profitMargin: number;
  stockValue: number;

  category?: string;
  tags: string[];

  supplierId?: string;
  supplierName?: string;

  lowStockAlert: boolean;

  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason:
    | "purchase"
    | "sale"
    | "damage"
    | "return"
    | "personal_use"
    | "correction";
  notes?: string;
  date: Date;
  transactionId?: string;
}

export interface Note {
  id: string;
  title?: string;
  content: string;

  personId?: string;
  transactionId?: string;
  itemId?: string;

  type?: "general" | "reminder" | "idea" | "complaint" | "feedback" | "other";

  photos: string[];
  voiceNoteUrl?: string;

  tags: string[];

  reminderDate?: Date;
  isReminderCompleted?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  count: number;
}

export interface DailySummary {
  date: Date;
  revenue: number;
  expenses: number;
  profit: number;
  transactionCount: number;

  paymentMethods: Record<PaymentMethod, number>;
  categories: Record<string, number>;

  creditGiven: number;
  creditReceived: number;

  alerts: string[];
}

// ==================== ADMIN-SPECIFIC TYPES ====================

export type AdminView =
  | "dashboard"
  | "transactions"
  | "people"
  | "items"
  | "analytics"
  | "integrations"
  | "settings";

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activeCustomers: number;

  revenueTrend: number;
  expensesTrend: number;
  profitTrend: number;
  customersTrend: number;

  period: "today" | "week" | "month" | "quarter" | "year";

  pendingTransactions: number;
  pendingCredit: number;
  lowStockItems: number;
  unreadNotifications: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface TimeSeriesData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  transactions: number;
}

export type IntegrationType =
  | "mpesa"
  | "whatsapp"
  | "quickbooks"
  | "sage"
  | "wave"
  | "custom";
export type IntegrationStatus =
  | "connected"
  | "disconnected"
  | "error"
  | "syncing";

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  description: string;
  status: IntegrationStatus;
  icon: string;

  lastSyncAt?: Date;
  lastSyncStatus?: "success" | "error" | "partial";
  lastError?: string;

  settings: Record<string, string | number | boolean>;
  isEnabled: boolean;
  autoSync: boolean;
  syncFrequency: "realtime" | "hourly" | "daily" | "manual";

  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationSyncLog {
  id: string;
  integrationId: string;
  startedAt: Date;
  completedAt?: Date;
  status: "pending" | "in_progress" | "completed" | "failed";
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  errors: string[];
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "admin" | "manager" | "staff";
  permissions: string[];
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface TenantFeatures {
  manual_transactions: boolean;
  entity_management: boolean;
  payment_records: boolean;
  dashboard: boolean;
  mpesa_integration: boolean;
  whatsapp_integration: boolean;
  quickbooks_sync: boolean;
  xero_sync: boolean;
  shopify_sync: boolean;
  advanced_reporting: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
  timezone: string;
  logo?: string;
  tier: string;

  features: TenantFeatures;

  settings: {
    defaultPaymentMethod: PaymentMethod;
    receiptPrefix: string;
    lowStockThreshold: number;
    creditReminderDays: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

export type FilterPeriod =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "this_year"
  | "custom";

export interface DateRangeFilter {
  period: FilterPeriod;
  startDate?: Date;
  endDate?: Date;
}

export interface TransactionFilter {
  dateRange: DateRangeFilter;
  type: TransactionType | "all";
  paymentMethod: PaymentMethod | "all";
  personId: string | "all";
  category: string | "all";
  status: TransactionStatus | "all";
  minAmount: number | null;
  maxAmount: number | null;
  isCredit: boolean | null;
}

export interface TableSortState {
  field: string;
  direction: "asc" | "desc";
}

export interface TablePaginationState {
  page: number;
  pageSize: number;
  total: number;
}
