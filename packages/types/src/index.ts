// Shared TypeScript types for Project Bridge
// These types are used across both frontend and backend

// Note: Prisma types are re-exported from @prisma/client directly
// Import them from there: import { User, Transaction } from '@prisma/client';

// API Response types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// Dashboard types
export interface DashboardStats {
  totalRevenueToday: number;
  totalRevenueWeek: number;
  totalRevenueMonth: number;
  transactionsToday: number;
  transactionsWeek: number;
  outstandingCredit: number;
  outstandingDebt: number;
  paymentMethodBreakdown: {
    cash: number;
    mpesa: number;
    bank: number;
    credit: number;
  };
  topCustomers: Array<{
    entityId: string;
    displayName: string;
    totalAmount: number;
    transactionCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: "transaction" | "payment" | "entity" | "reversal";
    description: string;
    amount?: number;
    timestamp: string;
  }>;
}

// Transaction filter types
export interface TransactionFilters {
  status?: string;
  type?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  paymentStatus?: string;
}

// Entity with balance
export interface EntityWithBalance {
  id: string;
  tenantId: string;
  type: string;
  displayName: string;
  phoneNumber?: string;
  totalCredit: number;
  totalDebit: number;
  netBalance: number;
  transactionCount: number;
  lastTransactionDate?: string;
}

// Payment record types
export type PaymentMethod =
  | "CASH"
  | "MPESA"
  | "BANK"
  | "CARD"
  | "CREDIT"
  | "OTHER";

export interface PaymentRecord {
  id: string;
  transactionId: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  paidAt?: string;
  metadata: Record<string, unknown>;
}

// Attachment types
export type FileType = "IMAGE" | "PDF" | "AUDIO" | "OTHER";

export interface Attachment {
  id: string;
  entityId?: string;
  transactionId?: string;
  fileName: string;
  fileType: FileType;
  fileUrl: string;
  fileSize?: number;
  uploadedByUserId: string;
  uploadedAt: string;
  metadata: Record<string, unknown>;
}

// Webhook types
export type WebhookEvent =
  | "transaction.created"
  | "transaction.posted"
  | "transaction.reversed"
  | "payment.received"
  | "entity.created";

export interface WebhookConfig {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  isActive: boolean;
}

// Subscription/Tier types
export type SubscriptionPlan = "FREE" | "PRO" | "ENTERPRISE";

export interface TenantFeatures {
  maxUsers: number;
  maxTransactionsPerMonth: number;
  maxStorageMB: number;
  maxApiCallsPerDay: number;
  features: {
    mpesaAutoReconciliation: boolean;
    whatsappBusinessApi: boolean;
    multiUserTeams: boolean;
    apiAccess: boolean;
    webhooks: boolean;
    advancedReporting: boolean;
  };
}

// Voice/Audio types for future AI integration
export interface VoiceAttachment {
  id: string;
  transactionId?: string;
  entityId?: string;
  audioUrl: string;
  durationSeconds: number;
  transcribedText?: string;
  transcribedAt?: string;
  language?: string;
  uploadedAt: string;
}

// Natural language search types
export interface NaturalLanguageQuery {
  query: string;
  context?: {
    entityAliases?: string[];
    locationHints?: string[];
    dateRange?: { from: string; to: string };
  };
}

export interface SearchResult<T> {
  item: T;
  relevanceScore: number;
  matchedFields: string[];
}
