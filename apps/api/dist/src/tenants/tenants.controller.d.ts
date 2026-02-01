import { TenantConfigService } from '../integrations/tenant-config.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class TenantsController {
    private readonly tenantConfigService;
    private readonly prismaService;
    constructor(tenantConfigService: TenantConfigService, prismaService: PrismaService);
    getMyFeatures(req: any): Promise<Record<string, boolean>>;
    getMyConfig(req: any): Promise<import("../integrations/types/integration.types").TenantConfig>;
    createTenant(body: {
        name: string;
        slug: string;
        phoneNumber: string;
        email?: string;
        displayName: string;
    }, req: any): Promise<{
        tenant: {
            id: string;
            name: string;
            slug: string;
            tier: string;
            country: string;
        };
        user: {
            id: string;
            displayName: string | null;
            phoneNumber: string;
            role: string | null;
        };
        features: {
            manual_transactions: boolean;
            entity_management: boolean;
            payment_records: boolean;
            dashboard: boolean;
            mpesa_integration: boolean;
            whatsapp_integration: boolean;
            quickbooks_sync: boolean;
            xero_sync: boolean;
            shopify_sync: boolean;
            advanced_reporting: boolean;
        };
        message: string;
    }>;
    requestIntegration(body: {
        integrationType: string;
        reason: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        request: {
            tenantId: any;
            integrationType: string;
            reason: string;
            status: string;
            requestedAt: string;
        };
    }>;
    listTenants(req: any): Promise<{
        features: any;
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        tier: string;
        country: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getTenantBySlug(slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        tier: string;
        country: string;
        settings: {
            businessType: any;
            location: any;
            features: any;
        };
        features: any;
    }>;
}
