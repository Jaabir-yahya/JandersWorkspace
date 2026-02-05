/**
 * QuickBooks Integration Service
 * Handles QuickBooks Online API integration for accounting
 */
import { IIntegrationService, ServiceConfig, IntegrationType, TenantCountry, TenantTier, SyncRequest, SyncResult, WebhookResult, HealthStatus, QuickBooksConfig, QuickBooksInvoice } from '../types';
export interface QuickBooksServiceConfig extends ServiceConfig {
    config: QuickBooksConfig;
}
export declare class QuickBooksService implements IIntegrationService {
    readonly name = "QuickBooks Online";
    readonly type = IntegrationType.QUICKBOOKS;
    readonly country = TenantCountry.USA;
    readonly tier = TenantTier.ADVANCED;
    private readonly sandboxUrl;
    private readonly productionUrl;
    private readonly authUrl;
    private config;
    private connected;
    private axiosInstance;
    constructor(config?: QuickBooksServiceConfig);
    /**
     * Get the base URL for QuickBooks API
     */
    private get baseUrl();
    /**
     * Connect to QuickBooks API
     */
    connect(): Promise<boolean>;
    /**
     * Disconnect from QuickBooks API
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
     * Authenticate with QuickBooks API
     */
    authenticate(config: ServiceConfig): Promise<boolean>;
    /**
     * Refresh the access token using the refresh token
     */
    private refreshAccessToken;
    /**
     * Test connection to QuickBooks
     */
    testConnection(config: ServiceConfig): Promise<boolean>;
    /**
     * Get company information
     */
    getCompanyInfo(): Promise<any>;
    /**
     * Get all invoices
     */
    getInvoices(query?: string): Promise<QuickBooksInvoice[]>;
    /**
     * Get a single invoice by ID
     */
    getInvoice(invoiceId: string): Promise<QuickBooksInvoice>;
    /**
     * Create a new invoice
     */
    createInvoice(invoice: QuickBooksInvoice): Promise<QuickBooksInvoice>;
    /**
     * Update an existing invoice
     */
    updateInvoice(invoice: QuickBooksInvoice): Promise<QuickBooksInvoice>;
    /**
     * Get all customers
     */
    getCustomers(query?: string): Promise<any[]>;
    /**
     * Get all payments
     */
    getPayments(query?: string): Promise<any[]>;
    /**
     * Sync data with QuickBooks
     */
    syncData(request: SyncRequest): Promise<SyncResult>;
    /**
     * Handle QuickBooks webhook
     */
    handleWebhook(payload: any): Promise<WebhookResult>;
    /**
     * Get health status of QuickBooks integration
     */
    getHealthStatus(): Promise<HealthStatus>;
}
export default QuickBooksService;
//# sourceMappingURL=index.d.ts.map