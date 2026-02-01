import { TransactionsService } from './transactions.service';
import { QuickCaptureDto } from './dto/quick-capture.dto';
export declare class TransactionsQuickController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    quickCapture(tenantId: string, dto: QuickCaptureDto): Promise<{
        entity: {
            id: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.EntityType;
            createdAt: Date;
            phoneNumber: string | null;
            displayName: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdByUserId: string;
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
    }>;
}
