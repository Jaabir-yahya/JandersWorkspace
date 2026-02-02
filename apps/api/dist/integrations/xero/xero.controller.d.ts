import { XeroService } from './xero.service';
import type { XeroInvoice } from '../types/integration.types';
export declare class XeroController {
    private readonly xeroService;
    constructor(xeroService: XeroService);
    initiateAuth(req: any): Promise<{
        success: boolean;
        message: string;
        tenantId: any;
        authUrl: string;
    }>;
    handleAuthCallback(req: any, body: {
        code: string;
    }): Promise<{
        success: boolean;
        message: string;
        tenantId: any;
    }>;
    createInvoice(req: any, invoice: XeroInvoice): Promise<{
        success: boolean;
        data: any;
        tenantId: any;
    }>;
    getInvoice(req: any, invoiceId: string): Promise<{
        success: boolean;
        data: XeroInvoice | null;
        tenantId: any;
    }>;
    updateInvoice(req: any, invoiceId: string, invoice: Partial<XeroInvoice>): Promise<{
        success: boolean;
        data: any;
        tenantId: any;
    }>;
    deleteInvoice(req: any, invoiceId: string): Promise<{
        success: boolean;
        tenantId: any;
    }>;
    getContacts(req: any, page?: number): Promise<{
        success: boolean;
        data: any[];
        tenantId: any;
    }>;
    createContact(req: any, contact: any): Promise<{
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
    handleWebhook(payload: any): Promise<import("../types/integration.types").WebhookResult>;
    refreshToken(req: any): Promise<{
        success: boolean;
        data: {
            expiresAt: Date | undefined;
        };
        tenantId: any;
    }>;
    getHealthStatus(): Promise<{
        status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
        lastCheck: Date;
        responseTime?: number;
        errorMessage?: string;
        service: string;
    }>;
}
