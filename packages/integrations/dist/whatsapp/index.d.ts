/**
 * WhatsApp Integration Service
 * Handles WhatsApp Business API integration for messaging
 */
import { IIntegrationService, ServiceConfig, IntegrationType, TenantCountry, TenantTier, SyncRequest, SyncResult, WebhookResult, HealthStatus, WhatsAppConfig, WhatsAppWebhookPayload } from '../types';
export interface WhatsAppServiceConfig extends ServiceConfig {
    config: WhatsAppConfig;
}
export declare class WhatsAppService implements IIntegrationService {
    readonly name = "WhatsApp Business API";
    readonly type = IntegrationType.WHATSAPP;
    readonly country = TenantCountry.KENYA;
    readonly tier = TenantTier.ADVANCED;
    private readonly defaultApiVersion;
    private readonly defaultBaseUrl;
    private config;
    private connected;
    private axiosInstance;
    constructor(config?: WhatsAppServiceConfig);
    /**
     * Get the base URL for WhatsApp API
     */
    private get baseUrl();
    /**
     * Get the API version
     */
    private get apiVersion();
    /**
     * Connect to WhatsApp Business API
     */
    connect(): Promise<boolean>;
    /**
     * Disconnect from WhatsApp API
     */
    disconnect(): Promise<void>;
    /**
     * Check if currently connected
     */
    isConnected(): boolean;
    /**
     * Authenticate with WhatsApp Business API
     */
    authenticate(config: ServiceConfig): Promise<boolean>;
    /**
     * Test connection to WhatsApp
     */
    testConnection(config: ServiceConfig): Promise<boolean>;
    /**
     * Send a text message
     */
    sendTextMessage(to: string, message: string): Promise<any>;
    /**
     * Send a template message
     */
    sendTemplateMessage(to: string, templateName: string, languageCode: string, components?: any[]): Promise<any>;
    /**
     * Send a message via WhatsApp API
     */
    private sendMessage;
    /**
     * Get phone number information
     */
    getPhoneNumberInfo(): Promise<any>;
    /**
     * Get message templates
     */
    getMessageTemplates(): Promise<any>;
    /**
     * Get WhatsApp Business Account ID
     */
    private getWABAId;
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload: string, signature: string, appSecret: string): boolean;
    /**
     * Sync data with WhatsApp (placeholder for future implementation)
     * WhatsApp doesn't support traditional data sync
     */
    syncData(request: SyncRequest): Promise<SyncResult>;
    /**
     * Handle WhatsApp webhook
     */
    handleWebhook(payload: WhatsAppWebhookPayload): Promise<WebhookResult>;
    /**
     * Get health status of WhatsApp integration
     */
    getHealthStatus(): Promise<HealthStatus>;
}
export default WhatsAppService;
//# sourceMappingURL=index.d.ts.map