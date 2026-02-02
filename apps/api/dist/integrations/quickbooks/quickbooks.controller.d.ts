import { QuickBooksService } from './quickbooks.service';
import { SyncTransactionDto } from './dto/sync-transaction.dto';
import type { QuickBooksInvoice } from '../types/integration.types';
export declare class QuickBooksController {
    private readonly quickbooksService;
    constructor(quickbooksService: QuickBooksService);
    initiateAuth(req: any): Promise<{
        success: boolean;
        message: string;
        tenantId: any;
        authUrl: string;
    }>;
    handleAuthCallback(req: any, body: {
        code: string;
        realmId: string;
    }): Promise<{
        success: boolean;
        message: string;
        tenantId: any;
        realmId: string;
    }>;
    createInvoice(req: any, invoice: QuickBooksInvoice): Promise<{
        success: boolean;
        data: any;
        tenantId: any;
    }>;
    getInvoice(req: any, invoiceId: string): Promise<{
        success: boolean;
        data: QuickBooksInvoice | null;
        tenantId: any;
    }>;
    updateInvoice(req: any, invoiceId: string, invoice: Partial<QuickBooksInvoice>): Promise<{
        success: boolean;
        data: any;
        tenantId: any;
    }>;
    deleteInvoice(req: any, invoiceId: string): Promise<{
        success: boolean;
        tenantId: any;
    }>;
    syncTransaction(req: any, syncDto: SyncTransactionDto): Promise<{
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
