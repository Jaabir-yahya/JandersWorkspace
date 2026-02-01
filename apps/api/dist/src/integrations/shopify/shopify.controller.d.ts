import { ShopifyService } from './shopify.service';
import type { ShopifyOrder } from '../types/integration.types';
export declare class ShopifyController {
    private readonly shopifyService;
    private readonly logger;
    constructor(shopifyService: ShopifyService);
    initiateInstall(req: any): Promise<{
        success: boolean;
        message: string;
        tenantId: any;
        installUrl: string;
    }>;
    handleAuthCallback(req: any, body: {
        shop: string;
        code: string;
    }): Promise<{
        success: boolean;
        message: string;
        tenantId: any;
        shop: string;
    }>;
    getOrders(req: any, query: {
        status?: 'open' | 'closed' | 'cancelled' | 'any';
        financial_status?: string;
        fulfillment_status?: string;
        created_at_min?: string;
        created_at_max?: string;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: {
            orders: ShopifyOrder[];
            nextPageInfo?: string;
        };
        tenantId: any;
    }>;
    getOrder(req: any, orderId: string): Promise<{
        success: boolean;
        data: ShopifyOrder | null;
        tenantId: any;
    }>;
    createOrder(req: any, order: Partial<ShopifyOrder>): Promise<{
        success: boolean;
        data: any;
        tenantId: any;
    }>;
    updateOrder(req: any, orderId: string, order: Partial<ShopifyOrder>): Promise<{
        success: boolean;
        data: any;
        tenantId: any;
    }>;
    cancelOrder(req: any, orderId: string, body: {
        amount?: number;
        currency?: string;
        reason?: 'customer' | 'inventory' | 'fraud' | 'declined' | 'other';
        email?: boolean;
        refund?: boolean;
    }): Promise<{
        success: boolean;
        data: any;
        tenantId: any;
    }>;
    getProducts(req: any, query: {
        limit?: number;
        collection_id?: number;
        product_type?: string;
        vendor?: string;
    }): Promise<{
        success: boolean;
        data: {
            products: any[];
            nextPageInfo?: string;
        };
        tenantId: any;
    }>;
    getCustomer(req: any, customerId: string): Promise<{
        success: boolean;
        data: any;
        tenantId: any;
    }>;
    createCustomer(req: any, customer: any): Promise<{
        success: boolean;
        data: any;
        tenantId: any;
    }>;
    syncBulk(req: any, body: {
        dataType: 'TRANSACTIONS' | 'ENTITIES' | 'PAYMENTS';
    }): Promise<{
        success: boolean;
        data: import("../types/integration.types").SyncResult;
        tenantId: any;
    }>;
    handleWebhook(payload: any, hmac: string, shopDomain: string, topic: string): Promise<import("../types/integration.types").WebhookResult>;
    getHealthStatus(): Promise<{
        status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
        lastCheck: Date;
        responseTime?: number;
        errorMessage?: string;
        service: string;
    }>;
}
