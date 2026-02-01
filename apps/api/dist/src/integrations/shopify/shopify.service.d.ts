import { ConfigService } from '@nestjs/config';
import { BaseIntegrationService } from '../common/base-integration.service';
import { IntegrationType, TenantTier, TenantCountry, IntegrationConfig, SyncRequest, SyncResult, WebhookResult, ShopifyConfig, ShopifyOrder } from '../types/integration.types';
export declare class ShopifyService extends BaseIntegrationService {
    protected readonly configService: ConfigService;
    name: string;
    type: IntegrationType;
    country: TenantCountry;
    tier: TenantTier;
    constructor(configService: ConfigService);
    authenticate(config: IntegrationConfig): Promise<boolean>;
    syncData(request: SyncRequest): Promise<SyncResult>;
    handleWebhook(payload: any): Promise<WebhookResult>;
    getOrder(config: ShopifyConfig, orderId: number): Promise<ShopifyOrder | null>;
    getOrders(config: ShopifyConfig, options?: {
        status?: 'open' | 'closed' | 'cancelled' | 'any';
        financialStatus?: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';
        fulfillmentStatus?: 'shipped' | 'partial' | 'unshipped' | 'any';
        createdAtMin?: string;
        createdAtMax?: string;
        limit?: number;
        pageInfo?: string;
    }): Promise<{
        orders: ShopifyOrder[];
        nextPageInfo?: string;
    }>;
    createOrder(config: ShopifyConfig, order: Partial<ShopifyOrder>): Promise<any>;
    updateOrder(config: ShopifyConfig, orderId: number, order: Partial<ShopifyOrder>): Promise<any>;
    cancelOrder(config: ShopifyConfig, orderId: number, options?: {
        amount?: number;
        currency?: string;
        reason?: 'customer' | 'inventory' | 'fraud' | 'declined' | 'other';
        email?: boolean;
        refund?: boolean;
    }): Promise<any>;
    getProducts(config: ShopifyConfig, options?: {
        limit?: number;
        pageInfo?: string;
        ids?: string;
        collectionId?: number;
        productType?: string;
        vendor?: string;
    }): Promise<{
        products: any[];
        nextPageInfo?: string;
    }>;
    getCustomer(config: ShopifyConfig, customerId: number): Promise<any | null>;
    createCustomer(config: ShopifyConfig, customer: any): Promise<any>;
    syncTransactionToOrder(config: ShopifyConfig, transaction: any): Promise<any>;
    verifyWebhook(config: ShopifyConfig, hmac: string, rawBody: string): Promise<boolean>;
    private transformToShopifyOrder;
    protected performHealthCheck(): Promise<boolean>;
}
