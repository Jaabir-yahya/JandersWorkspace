/**
 * Xero Integration Service
 * Handles Xero Accounting API integration
 */
import { IIntegrationService, ServiceConfig, IntegrationType, TenantCountry, TenantTier, SyncRequest, SyncResult, WebhookResult, HealthStatus, XeroConfig, XeroInvoice } from '../types';
export interface XeroServiceConfig extends ServiceConfig {
    config: XeroConfig;
}
export declare class XeroService implements IIntegrationService {
    readonly name = "Xero Accounting";
    readonly type = IntegrationType.XERO;
    readonly country = TenantCountry.UK;
    readonly tier = TenantTier.ADVANCED;
    private readonly baseUrl;
    private readonly identityUrl;
    private readonly tokenUrl;
    private config;
    private connected;
    private axiosInstance;
    constructor(config?: XeroServiceConfig);
    /**
     * Connect to Xero API
     */
    connect(): Promise<boolean>;
    /**
     * Disconnect from Xero API
     */
    disconnect(): Promise<void>;
    /**
     * Check if currently connected
     */
    isConnected(): boolean;
    /**
     * Check if the access token is expired
     */
    private isTokenExpired;
    /**
     * Authenticate with Xero API
     */
    authenticate(config: ServiceConfig): Promise<boolean>;
    /**
     * Refresh the access token using the refresh token
     */
    private refreshAccessToken;
    /**
     * Test connection to Xero
     */
    testConnection(config: ServiceConfig): Promise<boolean>;
    /**
     * Get Xero connections (tenants)
     */
    getConnections(): Promise<any[]>;
    /**
     * Get all invoices
     */
    getInvoices(params?: {
        where?: string;
        order?: string;
    }): Promise<XeroInvoice[]>;
    /**
     * Get a single invoice by ID
     */
    getInvoice(invoiceId: string): Promise<XeroInvoice>;
    /**
     * Create a new invoice
     */
    createInvoice(invoice: XeroInvoice): Promise<XeroInvoice>;
    /**
     * Update an existing invoice
     */
    updateInvoice(invoice: XeroInvoice): Promise<XeroInvoice>;
    /**
     * Get all contacts
     */
    getContacts(params?: {
        where?: string;
        order?: string;
    }): Promise<any[]>;
    /**
     * Get all payments
     */
    getPayments(params?: {
        where?: string;
        order?: string;
    }): Promise<any[]>;
    /**
     * Get chart of accounts
     */
    getAccounts(): Promise<any[]>;
    /**
     * Sync data with Xero
     */
    syncData(request: SyncRequest): Promise<SyncResult>;
    /**
     * Handle Xero webhook
     */
    handleWebhook(payload: any): Promise<WebhookResult>;
    /**
     * Get health status of Xero integration
     */
    getHealthStatus(): Promise<HealthStatus>;
}
export default XeroService;
//# sourceMappingURL=index.d.ts.map