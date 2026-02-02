import { ConfigService } from '@nestjs/config';
import { BaseIntegrationService } from '../common/base-integration.service';
import { IntegrationType, TenantTier, TenantCountry, IntegrationConfig, SyncRequest, SyncResult, WebhookResult, QuickBooksConfig, QuickBooksInvoice } from '../types/integration.types';
export declare class QuickBooksService extends BaseIntegrationService {
    protected readonly configService: ConfigService;
    name: string;
    type: IntegrationType;
    country: TenantCountry;
    tier: TenantTier;
    constructor(configService: ConfigService);
    authenticate(config: IntegrationConfig): Promise<boolean>;
    syncData(request: SyncRequest): Promise<SyncResult>;
    handleWebhook(payload: any): Promise<WebhookResult>;
    createInvoice(config: QuickBooksConfig, invoice: QuickBooksInvoice): Promise<any>;
    getInvoice(config: QuickBooksConfig, invoiceId: string): Promise<QuickBooksInvoice | null>;
    updateInvoice(config: QuickBooksConfig, invoiceId: string, invoice: Partial<QuickBooksInvoice>): Promise<any>;
    deleteInvoice(config: QuickBooksConfig, invoiceId: string): Promise<boolean>;
    syncTransaction(config: QuickBooksConfig, transaction: any): Promise<any>;
    refreshAccessToken(config: QuickBooksConfig): Promise<QuickBooksConfig>;
    private transformToQuickBooksInvoice;
    protected performHealthCheck(): Promise<boolean>;
}
