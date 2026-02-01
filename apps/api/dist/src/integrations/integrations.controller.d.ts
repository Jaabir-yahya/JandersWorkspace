import { TenantConfigService } from '../integrations/tenant-config.service';
import { MpesaService } from '../integrations/kenya/mpesa/mpesa.service';
import { IntegrationType, TenantTier } from '../integrations/types/integration.types';
import type { MpesaStkPushDto, MpesaC2BRequest, MpesaB2CRequest } from '../integrations/types/integration.types';
export declare class IntegrationsController {
    private readonly tenantConfigService;
    private readonly mpesaService;
    constructor(tenantConfigService: TenantConfigService, mpesaService: MpesaService);
    getAvailableFeatures(req: any): Promise<import("../integrations/types/integration.types").FeatureFlag[]>;
    getTenantFeatures(req: any): Promise<Record<string, boolean>>;
    getTenantConfig(req: any): Promise<import("../integrations/types/integration.types").TenantConfig>;
    upgradeTier(req: any, tier: TenantTier): Promise<import("../integrations/types/integration.types").TenantConfig>;
    initiateStkPush(req: any, stkPushDto: MpesaStkPushDto): Promise<import("../integrations/types/integration.types").MpesaStkPushResponse>;
    registerC2bUrls(req: any, body: MpesaC2BRequest): Promise<any>;
    sendB2cPayment(req: any, body: MpesaB2CRequest & {
        transactionId?: string;
    }): Promise<any>;
    handleMpesaWebhook(payload: any): Promise<import("../integrations/types/integration.types").WebhookResult>;
    updateIntegrationConfig(req: any, integrationType: IntegrationType, config: any): Promise<{
        message: string;
    }>;
    getIntegrationConfig(req: any, integrationType: IntegrationType): Promise<any>;
    testIntegration(req: any, integrationType: IntegrationType): Promise<boolean | {
        success: boolean;
        message: string;
    }>;
    getIntegrationHealth(req: any, integrationType: IntegrationType): Promise<import("../integrations/types/integration.types").HealthStatus | {
        status: string;
        errorMessage: string;
    }>;
}
