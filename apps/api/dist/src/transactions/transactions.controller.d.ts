import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(dto: CreateTransactionDto): Promise<{
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
    findAll(tenantId: string, req: any, status?: string, type?: string, entityId?: string, dateFrom?: string, dateTo?: string, search?: string, paymentStatus?: string): Promise<({
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
    findOne(id: string): Promise<{
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
        paymentApplications: ({
            payment: {
                status: import("@prisma/client").$Enums.PaymentStatus;
                id: string;
                tenantId: string;
                createdAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue;
                amount: import("@prisma/client/runtime/library").Decimal;
                reference: string | null;
                currencyCode: string;
                createdByUserId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            transactionId: string;
            paymentId: string;
            appliedAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
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
    findByEntity(entityId: string): Promise<({
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
    postTransaction(id: string, dto: PostTransactionDto): Promise<{
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
    reverseTransaction(id: string, dto: ReverseTransactionDto): Promise<{
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
    updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto): Promise<{
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
    exportTransaction(id: string): Promise<import("./interfaces/universal-invoice.interface").UniversalInvoice>;
}
export declare class EntitiesController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findAll(tenantId: string, type?: string, search?: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdByUserId: string;
    }[]>;
    create(dto: any): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdByUserId: string;
    }>;
    findOne(id: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdByUserId: string;
    }>;
    getEntityHistory(id: string, tenantId: string): Promise<{
        entity: any;
        transactions: import("./transactions.service").EntityHistoryItem[];
        total_balance: number;
    }>;
    getEntityBalance(id: string, tenantId: string): Promise<{
        entity: {
            id: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.EntityType;
            createdAt: Date;
            phoneNumber: string | null;
            displayName: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdByUserId: string;
        };
        balance: {
            total_credit: number;
            total_debit: number;
            net_balance: number;
            transaction_count: number;
        };
    }>;
    getEntity360View(id: string, tenantId: string): Promise<{
        entity: {
            id: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.EntityType;
            createdAt: Date;
            phoneNumber: string | null;
            displayName: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdByUserId: string;
        };
        balance: {
            total_credit: number;
            total_debit: number;
            net_balance: number;
            transaction_count: number;
        };
        recent_transactions: ({
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
        })[];
        attachments: any[];
    }>;
    searchByPhone(phone: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdByUserId: string;
    }[]>;
    addLinkedPhone(id: string, phone: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdByUserId: string;
    }>;
    removeLinkedPhone(id: string, phone: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdByUserId: string;
    }>;
}
