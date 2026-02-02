import type { Response } from 'express';
import { TenantsService } from '../tenants/tenants.service';
import { TransactionsService } from './transactions.service';
export declare class TransactionsPublicController {
    private readonly transactionsService;
    private readonly tenantsService;
    constructor(transactionsService: TransactionsService, tenantsService: TenantsService);
    export(tenantId: string, tenantKey: string | undefined, res: Response, format?: 'json' | 'csv', dateFrom?: string, dateTo?: string, type?: string, limit?: string): Promise<string | unknown[]>;
    listByTenant(tenantId: string, tenantKey: string | undefined, status?: string, type?: string, entityId?: string, dateFrom?: string, dateTo?: string, search?: string, paymentStatus?: string): Promise<({
        entity: {
            id: string;
            phoneNumber: string | null;
            displayName: string;
        } | null;
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalLineAmount: import("@prisma/client/runtime/library").Decimal;
            accountCode: string;
            transactionId: string;
        }[];
    } & {
        status: import("@prisma/client").$Enums.TxnStatus;
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.TxnType;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        reference: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        entityId: string | null;
        createdByUserId: string;
        reversedTransactionId: string | null;
    })[]>;
}
