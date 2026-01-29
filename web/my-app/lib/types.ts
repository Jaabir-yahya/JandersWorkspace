// Tenant types
export interface Tenant {
  id: string;
  name: string;
  currency_code: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  tenant_ids: string[]; // Tenants this user has access to
  current_tenant_id: string;
  metadata: Record<string, unknown>;
}

// Analytics/Dashboard types
export interface DashboardStats {
  total_revenue_today: number;
  total_revenue_week: number;
  total_revenue_month: number;
  transactions_today: number;
  transactions_week: number;
  outstanding_credit: number; // Total udhaari owed to us
  outstanding_debt: number; // Total we owe suppliers
  payment_method_breakdown: {
    cash: number;
    mpesa: number;
    bank: number;
    credit: number;
  };
  top_customers: Array<{
    entity_id: string;
    display_name: string;
    total_amount: number;
    transaction_count: number;
  }>;
  recent_activity: Array<{
    id: string;
    type: "transaction" | "payment" | "entity" | "reversal";
    description: string;
    amount?: number;
    timestamp: string;
  }>;
}

// Transaction types
export type TransactionType = "RETAIL" | "SERVICE" | "RENTAL" | "EXPENSE" | "EXPENSE_RETURN";
export type TransactionStatus = "DRAFT" | "POSTED" | "REVERSED" | "RECONCILED" | "VOIDED" | "ARCHIVED";
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CREDIT" | "CREDIT";
export type EntityType = "CUSTOMER" | "SUPPLIER" | "EMPLOYEE";
export type ReasonCode = "RETURN" | "ERROR" | "CANCELLATION" | "OTHER";
export type PaymentMethod = "CASH" | "MPESA" | "BANK" | "CARD" | "CREDIT" | "OTHER";

// Payment record for split payments
export interface PaymentRecord {
  id: string;
  transaction_id: string;
  method: PaymentMethod;
  amount: number;
  reference?: string; // M-Pesa confirmation code, bank ref, etc.
  paid_at?: string;
  metadata: Record<string, unknown>;
}

// Attachment for proof/receipts
export interface Attachment {
  id: string;
  entity_id?: string;
  transaction_id?: string;
  file_name: string;
  file_type: "IMAGE" | "PDF" | "AUDIO" | "OTHER";
  file_url: string;
  file_size?: number;
  uploaded_by_user_id: string;
  uploaded_at: string;
  metadata: Record<string, unknown>;
}

export interface TransactionLine {
  id: string;
  transaction_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_line_amount: number;
  account_code: string;
  sku?: string;
  metadata: Record<string, unknown>;
}

export interface Entity {
  id: string;
  tenant_id: string;
  type: EntityType;
  display_name: string;
  phone_number?: string; // Main phone (E.164)
  linked_phones?: string[]; // Additional phone numbers
  alternate_names?: string[]; // Nicknames, alternate spellings
  location?: string; // Physical address/location
  notes?: string; // Communication log, general notes
  balance?: number; // Calculated: total owed or total credit
  metadata: Record<string, unknown>;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  entity_id: string;
  created_by_user_id: string;
  type: TransactionType;
  status: TransactionStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  currency_code: string;
  transaction_date: string;
  reference?: string;
  reversed_transaction_id?: string;
  linked_transaction_id?: string; // For EXPENSE_RETURN linking to original
  due_date?: string; // For credit/udhaari
  context?: string; // Free-form notes field for observation
  metadata: Record<string, unknown>;
  lines: TransactionLine[];
  payments?: PaymentRecord[]; // Split payments
  attachments?: Attachment[]; // Receipts, proofs
  entity?: Entity;
}

export interface CreateTransactionLineInput {
  description: string;
  quantity: number;
  unit_price: number;
  sku?: string;
  account_code: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentInput {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  paid_at?: string;
}

export interface CreateTransactionInput {
  tenant_id: string;
  created_by_user_id: string;
  entity_id: string;
  type: TransactionType;
  currency_code: string;
  transaction_date: string;
  reference?: string;
  linked_transaction_id?: string; // For returns
  due_date?: string; // For credit
  context?: string; // Free-form notes
  lines: CreateTransactionLineInput[];
  payments?: CreatePaymentInput[]; // Split payments
}

export interface CreateEntityInput {
  tenant_id: string;
  created_by_user_id: string;
  type: EntityType;
  display_name: string;
  phone_number?: string;
  linked_phones?: string[];
  alternate_names?: string[];
  location?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateEntityInput {
  display_name?: string;
  phone_number?: string;
  linked_phones?: string[];
  alternate_names?: string[];
  location?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface EntityWithBalance extends Entity {
  total_credit: number; // Money they owe us
  total_debit: number; // Money we owe them
  net_balance: number; // Positive = they owe us
  transaction_count: number;
  last_transaction_date?: string;
}

export interface EntitySearchFilters {
  tenant_id?: string; // Required for multi-tenancy
  search?: string; // Search across name, phone, linked_phones, alternate_names
  type?: EntityType;
  has_balance?: boolean; // Filter to only entities with outstanding balance
}

export interface TransactionFilters {
  status?: TransactionStatus;
  type?: TransactionType;
  date_from?: string;
  date_to?: string;
  search?: string;
  entity_id?: string;
  payment_status?: PaymentStatus;
}

export interface ReverseTransactionInput {
  user_id: string;
  reason_code: ReasonCode;
  reason_text: string;
}

// Apply payment to existing transaction (for paying off credit)
export interface ApplyPaymentInput {
  transaction_id: string;
  user_id: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  paid_at?: string;
}

// Quick search result
export interface SearchResult {
  type: "transaction" | "entity" | "attachment";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  metadata?: Record<string, unknown>;
}
