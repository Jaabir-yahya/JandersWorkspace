import { TransactionsService } from './transactions.service';
import { QuickCaptureDto } from './dto/quick-capture.dto';
export declare class TransactionsQuickController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    quickCapture(tenantId: string, dto: QuickCaptureDto): Promise<{
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
        transactionChannel: string | null;
        businessPurpose: string | null;
        customerSegment: string | null;
        marketDayType: string | null;
        locationGps: string | null;
        locationDescription: string | null;
        paymentConfirmedVia: string | null;
        businessNotes: string | null;
        systemTags: string;
        customTags: string;
        entityId: string | null;
        createdByUserId: string;
        reversedTransactionId: string | null;
    }>;
}
