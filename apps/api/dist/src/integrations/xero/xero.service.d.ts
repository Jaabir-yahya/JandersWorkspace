import { ConfigService } from '@nestjs/config';
import { BaseIntegrationService } from '../common/base-integration.service';
import { IntegrationType, TenantTier, TenantCountry, IntegrationConfig, SyncRequest, SyncResult, WebhookResult, XeroConfig, XeroInvoice } from '../types/integration.types';
export declare class XeroService extends BaseIntegrationService {
    protected readonly configService: ConfigService;
    name: string;
    type: IntegrationType;
    country: TenantCountry;
    tier: TenantTier;
    constructor(configService: ConfigService);
    authenticate(config: IntegrationConfig): Promise<boolean>;
    syncData(request: SyncRequest): Promise<SyncResult>;
    handleWebhook(payload: any): Promise<WebhookResult>;
    createInvoice(config: XeroConfig, invoice: XeroInvoice): Promise<any>;
    getInvoice(config: XeroConfig, invoiceId: string): Promise<XeroInvoice | null>;
    updateInvoice(config: XeroConfig, invoiceId: string, invoice: Partial<XeroInvoice>): Promise<any>;
    deleteInvoice(config: XeroConfig, invoiceId: string): Promise<boolean>;
    getContacts(config: XeroConfig, page?: number): Promise<any[]>;
    createContact(config: XeroConfig, contact: any): Promise<any>;
    refreshAccessToken(config: XeroConfig): Promise<XeroConfig>;
    protected performHealthCheck(): Promise<boolean>;
}
