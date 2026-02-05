/**
 * Shared integration types for Project Bridge
 * These types define the common interface for all third-party integrations
 */
export declare enum IntegrationType {
    MPESA = "MPESA",
    WHATSAPP = "WHATSAPP",
    QUICKBOOKS = "QUICKBOOKS",
    XERO = "XERO"
}
export declare enum IntegrationStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    ERROR = "ERROR",
    CONNECTING = "CONNECTING"
}
export declare enum TenantCountry {
    KENYA = "KE",
    TANZANIA = "TZ",
    UGANDA = "UG",
    RWANDA = "RW",
    NIGERIA = "NG",
    USA = "US",
    UK = "UK",
    EU = "EU"
}
export declare enum TenantTier {
    BASIC = "BASIC",
    ADVANCED = "ADVANCED",
    PREMIUM = "PREMIUM",
    ENTERPRISE = "ENTERPRISE"
}
/**
 * Base configuration interface for all integrations
 */
export interface ServiceConfig {
    /** Unique identifier for the integration instance */
    id: string;
    /** Tenant identifier */
    tenantId: string;
    /** Integration type */
    type: IntegrationType;
    /** Whether the integration is active */
    isActive: boolean;
    /** Integration-specific configuration */
    config: Record<string, any>;
    /** Last sync timestamp */
    lastSyncAt?: Date;
    /** Current status */
    status: IntegrationStatus;
    /** Error count for tracking failures */
    errorCount: number;
    /** Last error message */
    lastError?: string;
}
/**
 * Health status for integration monitoring
 */
export interface HealthStatus {
    status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
    lastCheck: Date;
    responseTime?: number;
    errorMessage?: string;
}
/**
 * Result of a sync operation
 */
export interface SyncResult {
    success: boolean;
    processed: number;
    errors: string[];
    lastSyncAt: Date;
    nextSyncAt?: Date;
}
/**
 * Result of webhook processing
 */
export interface WebhookResult {
    success: boolean;
    status: number;
    message?: string;
    data?: any;
}
/**
 * Sync request parameters
 */
export interface SyncRequest {
    tenantId: string;
    type: 'INBOUND' | 'OUTBOUND';
    dataType: 'TRANSACTIONS' | 'ENTITIES' | 'PAYMENTS';
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
}
/**
 * Base interface that all integration services must implement
 */
export interface IIntegrationService {
    /** Service name */
    readonly name: string;
    /** Integration type */
    readonly type: IntegrationType;
    /** Supported country */
    readonly country: TenantCountry;
    /** Required tenant tier */
    readonly tier: TenantTier;
    /**
     * Authenticate with the external service
     * @param config - Service configuration
     * @returns Promise resolving to true if authentication succeeds
     */
    authenticate(config: ServiceConfig): Promise<boolean>;
    /**
     * Test the connection to the external service
     * @param config - Service configuration
     * @returns Promise resolving to true if connection is successful
     */
    testConnection(config: ServiceConfig): Promise<boolean>;
    /**
     * Sync data with the external service
     * @param request - Sync request parameters
     * @returns Promise resolving to sync result
     */
    syncData(request: SyncRequest): Promise<SyncResult>;
    /**
     * Handle incoming webhook from the external service
     * @param payload - Webhook payload
     * @returns Promise resolving to webhook result
     */
    handleWebhook(payload: any): Promise<WebhookResult>;
    /**
     * Get the health status of the integration
     * @returns Promise resolving to health status
     */
    getHealthStatus(): Promise<HealthStatus>;
}
export interface MpesaConfig {
    consumerKey: string;
    consumerSecret: string;
    passkey: string;
    shortcode: number;
    lipaNaMpesaOnlineShortcode?: number;
    lipaNaMpesaOnlinePasskey?: string;
    environment: 'SANDBOX' | 'PRODUCTION';
    callbackUrl: string;
    confirmationUrl?: string;
    validationUrl?: string;
    timeoutUrl?: string;
}
export interface MpesaStkPushRequest {
    businessShortCode: number;
    transactionType: 'CustomerPayBillOnline' | 'CustomerBuyGoodsOnline';
    amount: number;
    phoneNumber: string;
    callBackURL: string;
    accountReference: string;
    transactionDesc: string;
}
export interface MpesaStkPushResponse {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
}
export interface MpesaC2BRequest {
    ShortCode: number;
    ResponseType: 'Completed' | 'Cancelled';
    ConfirmationURL: string;
    ValidationURL: string;
}
export interface MpesaB2CRequest {
    InitiatorName: string;
    SecurityCredential: string;
    CommandID: 'SalaryPayment' | 'BusinessPayment' | 'PromotionPayment' | 'AccountTransfer';
    Amount: number;
    PartyA: number;
    PartyB: number;
    Remarks: string;
    QueueTimeOutURL: string;
    ResultURL: string;
    Occasion?: string;
}
export interface WhatsAppConfig {
    phoneNumberId: string;
    accessToken: string;
    webhookVerifyToken: string;
    version: string;
    baseUrl: string;
}
export interface WhatsAppMessage {
    messagingProduct: 'whatsapp';
    to: string;
    from?: string;
    text?: {
        body: string;
    };
    template?: {
        name: string;
        language: {
            code: string;
        };
        components?: Array<{
            type: string;
            parameters?: Array<{
                type: string;
                [key: string]: any;
            }>;
        }>;
    };
}
export interface WhatsAppWebhookPayload {
    object: 'whatsapp_business_account';
    entry: Array<{
        id: string;
        changes: Array<{
            value: {
                messaging_product: 'whatsapp';
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };
                contacts?: Array<{
                    profile: {
                        name: string;
                    };
                    wa_id: string;
                }>;
                messages: Array<{
                    from: string;
                    id: string;
                    timestamp: string;
                    text?: {
                        body: string;
                    };
                    type: string;
                }>;
            };
            field: string;
        }>;
    }>;
}
export interface QuickBooksConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    environment: 'sandbox' | 'production';
    realmId?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
}
export interface QuickBooksInvoice {
    Id?: string;
    SyncToken?: string;
    DocNumber?: string;
    TxnDate?: string;
    CurrencyRef?: {
        value: string;
        name: string;
    };
    Line?: Array<{
        Id?: string;
        LineNum?: number;
        Amount: number;
        DetailType: string;
        SalesItemLineDetail?: {
            ItemRef?: {
                value: string;
                name: string;
            };
            UnitPrice?: number;
            Qty?: number;
        };
        Description?: string;
    }>;
    CustomerRef?: {
        value: string;
        name: string;
    };
    CustomerMemo?: {
        value: string;
    };
    SalesTermRef?: {
        value: string;
        name: string;
    };
    TotalAmt?: number;
    DueDate?: string;
    Balance?: number;
}
export interface XeroConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    environment: 'development' | 'production';
    tenantId?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
}
export interface XeroInvoice {
    InvoiceID?: string;
    InvoiceNumber?: string;
    Type?: 'ACCREC' | 'ACCPAY';
    Contact?: {
        ContactID?: string;
        Name?: string;
        EmailAddress?: string;
    };
    Date?: string;
    DueDate?: string;
    LineAmountTypes?: 'Exclusive' | 'Inclusive' | 'NoTax';
    LineItems?: Array<{
        Description?: string;
        Quantity?: number;
        UnitAmount?: number;
        AccountCode?: string;
        TaxType?: string;
        LineAmount?: number;
    }>;
    CurrencyCode?: string;
    Total?: number;
    AmountDue?: number;
}
export declare class IntegrationError extends Error {
    integrationType: IntegrationType;
    code: string;
    details?: any | undefined;
    constructor(integrationType: IntegrationType, code: string, message: string, details?: any | undefined);
}
export declare class TenantTierError extends Error {
    requiredTier: TenantTier;
    currentTier: TenantTier;
    constructor(requiredTier: TenantTier, currentTier: TenantTier, feature: string);
}
export declare class ComplianceError extends Error {
    country: TenantCountry;
    regulation: string;
    constructor(country: TenantCountry, regulation: string, message: string);
}
//# sourceMappingURL=types.d.ts.map