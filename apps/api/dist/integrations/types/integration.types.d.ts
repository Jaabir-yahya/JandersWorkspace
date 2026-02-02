export declare enum IntegrationType {
    MPESA = "MPESA",
    WHATSAPP = "WHATSAPP",
    QUICKBOOKS = "QUICKBOOKS",
    XERO = "XERO",
    SHOPIFY = "SHOPIFY"
}
export declare enum TenantTier {
    BASIC = "BASIC",
    ADVANCED = "ADVANCED",
    PREMIUM = "PREMIUM",
    ENTERPRISE = "ENTERPRISE"
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
export declare enum WebhookStatus {
    PENDING = "PENDING",
    DELIVERED = "DELIVERED",
    FAILED = "FAILED",
    RETRYING = "RETRYING"
}
export declare enum IntegrationStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    ERROR = "ERROR",
    SYNCING = "SYNCING"
}
export declare enum EventType {
    TRANSACTION_CREATED = "transaction.created",
    TRANSACTION_UPDATED = "transaction.updated",
    TRANSACTION_POSTED = "transaction.posted",
    TRANSACTION_REVERSED = "transaction.reversed",
    PAYMENT_RECEIVED = "payment.received",
    PAYMENT_FAILED = "payment.failed",
    ENTITY_CREATED = "entity.created",
    ENTITY_UPDATED = "entity.updated",
    INVOICE_GENERATED = "invoice.generated",
    SYNC_COMPLETED = "sync.completed",
    SYNC_FAILED = "sync.failed",
    WEBHOOK_DELIVERED = "webhook.delivered",
    WEBHOOK_FAILED = "webhook.failed"
}
export declare enum EventSource {
    LEDGER = "LEDGER",
    MPESA = "MPESA",
    WHATSAPP = "WHATSAPP",
    QUICKBOOKS = "QUICKBOOKS",
    XERO = "XERO",
    SHOPIFY = "SHOPIFY",
    WEBHOOK = "WEBHOOK"
}
export interface TenantConfig {
    id: string;
    tenantId: string;
    tier: TenantTier;
    country: TenantCountry;
    features: Record<string, any>;
    integrationSettings: Record<string, any>;
    commissionRates: {
        mpesa?: number;
        whatsapp?: number;
        quickbooks?: number;
        xero?: number;
        shopify?: number;
    };
    complianceData: Record<string, any>;
    rateLimits: {
        daily: number;
        monthly: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface IntegrationConfig {
    id: string;
    tenantId: string;
    integrationType: IntegrationType;
    config: Record<string, any>;
    isActive: boolean;
    lastSyncAt?: Date;
    syncStatus: IntegrationStatus;
    errorCount: number;
    lastError?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface WebhookConfig {
    id: string;
    tenantId: string;
    name: string;
    url: string;
    events: EventType[];
    secret: string;
    isActive: boolean;
    retryPolicy: {
        maxRetries: number;
        backoffMs: number;
    };
    lastTriggeredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface WebhookDelivery {
    id: string;
    tenantId: string;
    webhookConfigId: string;
    eventType: EventType;
    payload: any;
    responseStatus?: number;
    responseBody?: string;
    responseHeaders?: Record<string, string>;
    deliveredAt?: Date;
    retryCount: number;
    status: WebhookStatus;
    nextRetryAt?: Date;
    errorMessage?: string;
    createdAt: Date;
}
export interface ExternalReference {
    id: string;
    tenantId: string;
    localId: string;
    localType: 'transaction' | 'entity' | 'payment';
    externalSystem: string;
    externalId: string;
    externalData: Record<string, any>;
    syncDirection: 'OUTBOUND' | 'INBOUND' | 'BIDIRECTIONAL';
    lastSyncAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IntegrationEvent {
    id: string;
    tenantId: string;
    eventType: EventType;
    sourceSystem: EventSource;
    targetSystem?: string;
    correlationId?: string;
    eventData: any;
    processedAt?: Date;
    errorMessage?: string;
    retryCount: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    priority: number;
    createdAt: Date;
}
export interface CurrencyRate {
    id: string;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    source: string;
    validFrom: Date;
    validTo?: Date;
    createdAt: Date;
}
export interface FeatureFlag {
    id: string;
    name: string;
    description?: string;
    tiers: TenantTier[];
    countries: TenantCountry[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
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
export interface ShopifyConfig {
    shopDomain: string;
    accessToken: string;
    apiVersion: string;
}
export interface ShopifyOrder {
    id?: number;
    email?: string;
    financial_status?: string;
    total_price?: string;
    currency?: string;
    line_items?: Array<{
        id: number;
        variant_id?: number;
        title: string;
        quantity: number;
        price: string;
    }>;
    customer?: {
        id?: number;
        email?: string;
        first_name?: string;
        last_name?: string;
        phone?: string;
    };
    billing_address?: {
        first_name?: string;
        last_name?: string;
        address1?: string;
        phone?: string;
        city?: string;
        province?: string;
        country?: string;
        zip?: string;
    };
}
export interface DataMapper {
    toMpesaTransaction(txn: any): MpesaStkPushRequest;
    toWhatsAppMessage(data: any): WhatsAppMessage;
    toQuickBooksInvoice(txn: any, entity: any): QuickBooksInvoice;
    toXeroInvoice(txn: any, entity: any): XeroInvoice;
    toShopifyOrder(txn: any): ShopifyOrder;
    fromQuickBooksInvoice(invoice: QuickBooksInvoice): any;
    fromXeroInvoice(invoice: XeroInvoice): any;
    fromShopifyOrder(order: ShopifyOrder): any;
    convertCurrency(amount: number, from: string, to: string): Promise<number>;
    mapAccountCode(localCode: string, system: string): string;
    formatPhoneNumber(phone: string, country: TenantCountry): string;
}
export interface IIntegrationService {
    name: string;
    type: IntegrationType;
    country: TenantCountry;
    tier: TenantTier;
    authenticate(config: IntegrationConfig): Promise<boolean>;
    testConnection(config: IntegrationConfig): Promise<boolean>;
    syncData(request: SyncRequest): Promise<SyncResult>;
    handleWebhook(payload: any): Promise<WebhookResult>;
    getHealthStatus(): Promise<HealthStatus>;
}
export interface SyncRequest {
    tenantId: string;
    type: 'INBOUND' | 'OUTBOUND';
    dataType: 'TRANSACTIONS' | 'ENTITIES' | 'PAYMENTS';
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
}
export interface SyncResult {
    success: boolean;
    processed: number;
    errors: string[];
    lastSyncAt: Date;
    nextSyncAt?: Date;
}
export interface WebhookResult {
    success: boolean;
    status: number;
    message?: string;
    data?: any;
}
export interface HealthStatus {
    status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
    lastCheck: Date;
    responseTime?: number;
    errorMessage?: string;
}
export interface CreateTransactionDto {
    entity_id: string;
    reference?: string;
    type: 'RETAIL' | 'SERVICE' | 'RENTAL' | 'EXPENSE';
    currency_code?: string;
    lines: Array<{
        description: string;
        sku?: string;
        quantity: number;
        unit_price: number;
        account_code: string;
        metadata?: Record<string, any>;
    }>;
    metadata?: Record<string, any>;
}
export interface MpesaStkPushDto {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc?: string;
    transactionId?: string;
}
export interface WhatsAppMessageDto {
    to: string;
    type: 'text' | 'template';
    content: {
        body?: string;
        templateName?: string;
        templateData?: Record<string, any>;
    };
}
export interface CreateWebhookDto {
    name: string;
    url: string;
    events: EventType[];
    retryPolicy?: {
        maxRetries: number;
        backoffMs: number;
    };
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
