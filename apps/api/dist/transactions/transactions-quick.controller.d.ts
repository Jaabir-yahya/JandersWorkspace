import { TransactionsService } from './transactions.service';
import { QuickCaptureDto } from './dto/quick-capture.dto';
export declare class TransactionsQuickController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    quickCapture(tenantId: string, dto: QuickCaptureDto): Promise<{
        entity: {
            id: string;
            email: string | null;
            tenantId: string;
            phone: string | null;
            createdAt: Date;
            name: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdByUserId: string;
            entityType: import("@prisma/client").$Enums.EntityType;
            business_registration: string | null;
            business_scale: string | null;
            registration_number: string | null;
            creditLimit: import("@prisma/client/runtime/library").Decimal | null;
            paymentTerms: number | null;
            trustScore: number | null;
            preferred_contact_method: string | null;
            language_preference: string | null;
            location_notes: string | null;
            systemTags: string;
            customTags: string;
            business_context: import("@prisma/client/runtime/library").JsonValue;
        } | null;
        lines: {
            id: string;
            createdAt: Date;
            description: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            lineTotal: import("@prisma/client/runtime/library").Decimal;
            totalLineAmount: import("@prisma/client/runtime/library").Decimal;
            accountCode: string | null;
            itemId: string | null;
            transactionId: string;
        }[];
    } & {
        status: import("@prisma/client").$Enums.TxnStatus;
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.TxnType;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        amount: import("@prisma/client/runtime/library").Decimal;
        reference: string | null;
        date: Date;
        currencyCode: string;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        system_tags: string | null;
        custom_tags: string | null;
        fromAccountId: string | null;
        toAccountId: string | null;
        reasonId: string | null;
        reversalId: string | null;
        entityId: string | null;
        createdByUserId: string;
        reversedTransactionId: string | null;
    }>;
}
