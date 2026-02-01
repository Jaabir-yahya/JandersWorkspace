export interface User {
  id: string;
  email: string;
  display_name: string;
  tenant_ids: string[];
  current_tenant_id: string;
  metadata: Record<string, unknown>;
}

export interface Tenant {
  id: string;
  name: string;
  currency_code: string;
  metadata: Record<string, unknown>;
  features: TenantFeatures;
  created_at: string;
  updated_at: string;
}

export interface TenantFeatures {
  core: {
    transactions: boolean;
    entityManagement: boolean;
    basicReports: boolean;
  };
  payments: {
    mpesa: boolean;
    flutterwave: boolean;
    paystack: boolean;
    momo: boolean;
    orange: boolean;
  };
  advanced: {
    analytics: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    multiUser: boolean;
    batchOperations: boolean;
  };
  industry: {
    retail: {
      inventory: boolean;
      barcodeScanning: boolean;
    };
    services: {
      appointments: boolean;
      staffManagement: boolean;
    };
    transport: {
      fleetManagement: boolean;
      routeOptimization: boolean;
    };
  };
}

export interface Entity {
  id: string;
  tenant_id: string;
  type: "CUSTOMER" | "SUPPLIER" | "EMPLOYEE";
  display_name: string;
  phone_number?: string;
  linked_phones?: string[];
  alternate_names?: string[];
  location?: string;
  notes?: string;
  balance?: number;
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
  type: "RETAIL" | "SERVICE" | "RENTAL" | "EXPENSE" | "EXPENSE_RETURN";
  status:
    | "DRAFT"
    | "POSTED"
    | "REVERSED"
    | "RECONCILED"
    | "VOIDED"
    | "ARCHIVED";
  payment_status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CREDIT";
  total_amount: number;
  currency_code: string;
  transaction_date: string;
  reference?: string;
  reversed_transaction_id?: string;
  linked_transaction_id?: string;
  due_date?: string;
  context?: string;
  metadata: Record<string, unknown>;
}

// Integration types for African payment systems
export interface PaymentAdapter {
  id: string;
  name: string;
  country: string;
  currencies: string[];
  isActive?: boolean;
  config?: Record<string, unknown>;
}

export interface MpesaConfig {
  shortCode: string;
  password: string;
  consumerKey: string;
  consumerSecret: string;
  passKey: string;
  callbackUrl: string;
}

export interface FlutterwaveConfig {
  publicKey: string;
  secretKey: string;
  encryptionKey: string;
  webhookUrl: string;
}

export interface PaystackConfig {
  publicKey: string;
  secretKey: string;
  webhookUrl: string;
}

// Standardized request/response formats
export interface StandardPaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  customerEmail?: string;
  reference: string;
  metadata?: {
    notes?: string;
    customerName?: string;
    [key: string]: unknown;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  reference?: string;
  amount?: number;
  status?: string;
  error?: string;
}

export interface TransactionStatus {
  id: string;
  status: string;
  message?: string;
  timestamp: string;
}

// Utility types
export type Theme = "light" | "dark" | "system";
export type ConnectionStatus = "online" | "offline" | "syncing";
export type SearchType = "customer" | "transaction" | "phone";
