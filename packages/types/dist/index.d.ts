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
export interface TransactionFilters {
    status?: string;
    type?: string;
    entityId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    paymentStatus?: string;
}
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
export type PaymentMethod = "CASH" | "MPESA" | "BANK" | "CARD" | "CREDIT" | "OTHER";
export interface PaymentRecord {
    id: string;
    transactionId: string;
    method: PaymentMethod;
    amount: number;
    reference?: string;
    paidAt?: string;
    metadata: Record<string, unknown>;
}
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
export type WebhookEvent = "transaction.created" | "transaction.posted" | "transaction.reversed" | "payment.received" | "entity.created";
export interface WebhookConfig {
    id: string;
    url: string;
    events: WebhookEvent[];
    secret?: string;
    isActive: boolean;
}
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
export interface NaturalLanguageQuery {
    query: string;
    context?: {
        entityAliases?: string[];
        locationHints?: string[];
        dateRange?: {
            from: string;
            to: string;
        };
    };
}
export interface SearchResult<T> {
    item: T;
    relevanceScore: number;
    matchedFields: string[];
}
