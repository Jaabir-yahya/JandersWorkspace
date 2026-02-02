import { ConfigService } from '@nestjs/config';
import { BaseIntegrationService } from '../common/base-integration.service';
import { IntegrationType, TenantTier, TenantCountry, IntegrationConfig, SyncRequest, SyncResult, WebhookResult, WhatsAppConfig, WhatsAppMessage, WhatsAppWebhookPayload } from '../types/integration.types';
export declare class WhatsAppService extends BaseIntegrationService {
    protected readonly configService: ConfigService;
    name: string;
    type: IntegrationType;
    country: TenantCountry;
    tier: TenantTier;
    private readonly apiVersion;
    private readonly baseUrl;
    private get phoneNumberId();
    private get accessToken();
    private get verifyToken();
    private get appSecret();
    constructor(configService: ConfigService);
    authenticate(config: IntegrationConfig): Promise<boolean>;
    syncData(request: SyncRequest): Promise<SyncResult>;
    handleWebhook(payload: WhatsAppWebhookPayload): Promise<WebhookResult>;
    sendMessage(config: WhatsAppConfig, message: WhatsAppMessage): Promise<any>;
    sendTemplateMessage(config: WhatsAppConfig, to: string, templateName: string, languageCode?: string, components?: any[]): Promise<any>;
    verifyWebhookToken(token: string, challenge: string, verifyToken?: string): Promise<string | null>;
    private processIncomingMessage;
    protected performHealthCheck(): Promise<boolean>;
}
