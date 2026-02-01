// Core data types for the 80% manual use case
// Designed for African informal economy businesses

// ==================== PERSON (Customer/Supplier/Employee) ====================

export type PersonType = "customer" | "supplier" | "employee" | "other";

export interface Person {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  type: PersonType;
  photo?: string; // base64 or URL
  address?: string;
  notes?: string;
  tags: string[];

  // Business relationship tracking
  creditBalance: number; // Positive = they owe you, Negative = you owe them
  totalSpent: number; // For customers
  totalSupplied: number; // For suppliers
  transactionCount: number;
  lastTransactionDate?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Quick person creation (minimal fields)
export interface QuickPersonInput {
  name: string;
  phone?: string;
  type: PersonType;
  photo?: string;
  note?: string;
}

// ==================== TRANSACTION (Sales/Expenses/Purchases) ====================

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
  itemId?: string; // Reference to inventory item
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

  // Financial details
  amount: number;
  currency: string; // KES, TZS, UGX, etc.
  paymentMethod: PaymentMethod;

  // Line items (for detailed transactions)
  lineItems?: TransactionLineItem[];

  // Parties involved
  personId?: string; // Customer or supplier
  personName?: string; // Denormalized for quick display

  // Description & categorization
  description: string;
  category?: string; // e.g., "Food", "Transport", "Stock"
  tags: string[];

  // Receipt & proof
  receiptPhoto?: string;
  receiptNumber?: string;

  // Credit tracking
  isCredit: boolean;
  creditDueDate?: Date;
  creditPaid: boolean;

  // Notes
  notes?: string;
  voiceNoteUrl?: string;

  // Metadata
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
  tenantId?: string;
}

// Quick transaction input (for fast entry)
export interface QuickTransactionInput {
  type: TransactionType;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  personId?: string;
  personName?: string;
  category?: string;
  isCredit?: boolean;
  receiptPhoto?: string;
  notes?: string;
}

// ==================== ITEM (Inventory/Service) ====================

export type ItemType = "product" | "service" | "raw_material" | "other";

export interface Item {
  id: string;
  name: string;
  description?: string;
  type: ItemType;

  // Photos
  photos: string[];

  // Stock tracking (for products)
  currentStock: number;
  unit: string; // kg, pieces, liters, etc.
  reorderLevel: number;
  maxStock?: number;

  // Pricing
  costPrice: number; // What you pay
  sellingPrice: number; // What you charge
  avgCostPrice?: number; // Average over time

  // Calculated
  profitMargin: number; // percentage
  stockValue: number; // currentStock * avgCostPrice

  // Categorization
  category?: string;
  tags: string[];

  // Supplier info
  supplierId?: string;
  supplierName?: string;

  // Alerts
  lowStockAlert: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Stock movement (for tracking ins and outs)
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

// ==================== NOTE (Free-form notekeeping) ====================

export interface Note {
  id: string;
  title?: string;
  content: string;

  // Relationships (notes can be attached to anything)
  personId?: string;
  transactionId?: string;
  itemId?: string;

  // Type for organization
  type?: "general" | "reminder" | "idea" | "complaint" | "feedback" | "other";

  // Media
  photos: string[];
  voiceNoteUrl?: string;

  // Organization
  tags: string[];

  // Reminders
  reminderDate?: Date;
  isReminderCompleted?: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ==================== TAG (For organization) ====================

export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  count: number; // How many items use this tag
}

// ==================== DAILY SUMMARY ====================

export interface DailySummary {
  date: Date;
  revenue: number;
  expenses: number;
  profit: number;
  transactionCount: number;

  // Breakdowns
  paymentMethods: Record<PaymentMethod, number>;
  categories: Record<string, number>;

  // Credit tracking
  creditGiven: number;
  creditReceived: number;

  // Alerts
  alerts: string[];
}

// ==================== APP STATE ====================

export interface AppState {
  // Offline support
  isOnline: boolean;
  pendingSyncs: number;
  lastSyncAt?: Date;

  // Current view
  currentScreen: Screen;
  selectedDate: Date;

  // Tenant
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
  currency: string;
}

export type Screen =
  | "dashboard"
  | "add-transaction"
  | "transactions"
  | "people"
  | "items"
  | "notes"
  | "reports"
  | "settings";

// ==================== API TYPES ====================

export interface TenantResolutionResponse {
  id: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
  features: {
    manual_transactions: boolean;
    voice_input: boolean;
    photo_receipts: boolean;
    customer_management: boolean;
    inventory: boolean;
    mpesa: boolean;
    whatsapp: boolean;
  };
}

export interface DashboardStatsResponse {
  today: {
    revenue: number;
    expenses: number;
    profit: number;
    transactionCount: number;
  };
  thisWeek: {
    revenue: number;
    comparison: number;
  };
  topCustomers: Array<{
    name: string;
    totalSpent: number;
    transactionCount: number;
  }>;
  alerts: Array<{
    type: "low_stock" | "credit_due" | "high_expense";
    message: string;
    severity: "info" | "warning" | "urgent";
  }>;
}

// ==================== UTILITY TYPES ====================

export interface SyncAction {
  id: string;
  type:
    | "create_transaction"
    | "update_transaction"
    | "create_person"
    | "update_person"
    | "create_item"
    | "update_item"
    | "create_note";
  payload: any;
  timestamp: number;
  retryCount: number;
  status: "pending" | "syncing" | "synced" | "failed";
  error?: string;
}

export type FilterPeriod =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "last_month"
  | "custom";

// ==================== COMPONENT TYPES ====================

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "tel" | "email";
  error?: string;
  className?: string;
}

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export interface FilterState {
  dateRange: { start: Date; end: Date } | null;
  type: TransactionType | "all";
  paymentMethod: PaymentMethod | "all";
  personId: string | "all";
  category: string | "all";
  minAmount: number | null;
  maxAmount: number | null;
}

export interface SortState {
  field: "date" | "amount" | "name";
  direction: "asc" | "desc";
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}
