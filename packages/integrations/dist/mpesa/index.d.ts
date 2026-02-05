/**
 * M-Pesa Integration Service
 * Handles M-Pesa Daraja API integration for mobile money payments
 */
import { IIntegrationService, ServiceConfig, IntegrationType, TenantCountry, TenantTier, SyncRequest, SyncResult, WebhookResult, HealthStatus, MpesaConfig, MpesaStkPushRequest, MpesaStkPushResponse, MpesaC2BRequest, MpesaB2CRequest } from '../types';
export interface MpesaServiceConfig extends ServiceConfig {
    config: MpesaConfig;
}
export declare class MpesaService implements IIntegrationService {
    readonly name = "M-Pesa Daraja API";
    readonly type = IntegrationType.MPESA;
    readonly country = TenantCountry.KENYA;
    readonly tier = TenantTier.ADVANCED;
    private readonly sandboxUrl;
    private readonly productionUrl;
    private config;
    private connected;
    private axiosInstance;
    private accessToken;
    private tokenExpiry;
    constructor(config?: MpesaServiceConfig);
    /**
     * Initialize the axios instance with base URL
     */
    private get baseUrl();
    /**
     * Connect to M-Pesa API
     * Authenticates and establishes connection
     */
    connect(): Promise<boolean>;
    /**
     * Disconnect from M-Pesa API
     */
    disconnect(): Promise<void>;
    /**
     * Check if currently connected
     */
    isConnected(): boolean;
    /**
     * Authenticate with M-Pesa API
     */
    authenticate(config: ServiceConfig): Promise<boolean>;
    /**
     * Get OAuth access token from M-Pesa
     */
    private getAccessToken;
    /**
     * Ensure valid access token is available
     */
    private ensureValidToken;
    /**
     * Test connection to M-Pesa
     */
    testConnection(config: ServiceConfig): Promise<boolean>;
    /**
     * Initiate STK Push payment request
     */
    initiateStkPush(request: MpesaStkPushRequest): Promise<MpesaStkPushResponse>;
    /**
     * Register C2B URLs
     */
    registerC2BUrls(request: MpesaC2BRequest): Promise<any>;
    /**
     * Initiate B2C payment
     */
    initiateB2C(request: MpesaB2CRequest): Promise<any>;
    /**
     * Query STK Push transaction status
     */
    queryStkPushStatus(checkoutRequestId: string): Promise<any>;
    /**
     * Sync data with M-Pesa (placeholder for future implementation)
     */
    syncData(request: SyncRequest): Promise<SyncResult>;
    /**
     * Handle M-Pesa webhook
     */
    handleWebhook(payload: any): Promise<WebhookResult>;
    /**
     * Get health status of M-Pesa integration
     */
    getHealthStatus(): Promise<HealthStatus>;
    /**
     * Generate timestamp in YYYYMMDDHHmmss format
     */
    private generateTimestamp;
    /**
     * Generate password for STK Push
     */
    private generatePassword;
}
export default MpesaService;
//# sourceMappingURL=index.d.ts.map