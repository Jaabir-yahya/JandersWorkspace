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
            phoneNumber: string | null;
            displayName: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            type: import(".prisma/client").$Enums.EntityType;
            createdByUserId: string;
        } | null;
        lines: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalLineAmount: import("@prisma/client/runtime/library").Decimal;
            accountCode: string;
            transactionId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TxnType;
        createdByUserId: string;
        entityId: string | null;
        reference: string | null;
        status: import(".prisma/client").$Enums.TxnStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        reversedTransactionId: string | null;
    }>;
    findAll(tenantId: string, status?: string, type?: string, entityId?: string, dateFrom?: string, dateTo?: string, search?: string, paymentStatus?: string): Promise<({
        entity: {
            phoneNumber: string | null;
            displayName: string;
        } | null;
        lines: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalLineAmount: import("@prisma/client/runtime/library").Decimal;
            accountCode: string;
            transactionId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TxnType;
        createdByUserId: string;
        entityId: string | null;
        reference: string | null;
        status: import(".prisma/client").$Enums.TxnStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        reversedTransactionId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        entity: {
            id: string;
            tenantId: string;
            phoneNumber: string | null;
            displayName: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            type: import(".prisma/client").$Enums.EntityType;
            createdByUserId: string;
        } | null;
        lines: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalLineAmount: import("@prisma/client/runtime/library").Decimal;
            accountCode: string;
            transactionId: string;
        }[];
        paymentApplications: ({
            payment: {
                id: string;
                tenantId: string;
                metadata: import("@prisma/client/runtime/library").JsonValue;
                createdAt: Date;
                createdByUserId: string;
                reference: string | null;
                status: import(".prisma/client").$Enums.PaymentStatus;
                currencyCode: string;
                amount: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            paymentId: string;
            transactionId: string;
            appliedAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        tenantId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TxnType;
        createdByUserId: string;
        entityId: string | null;
        reference: string | null;
        status: import(".prisma/client").$Enums.TxnStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        reversedTransactionId: string | null;
    }>;
    findByEntity(entityId: string): Promise<({
        lines: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalLineAmount: import("@prisma/client/runtime/library").Decimal;
            accountCode: string;
            transactionId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TxnType;
        createdByUserId: string;
        entityId: string | null;
        reference: string | null;
        status: import(".prisma/client").$Enums.TxnStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        reversedTransactionId: string | null;
    })[]>;
    postTransaction(id: string, dto: PostTransactionDto): Promise<{
        entity: {
            id: string;
            tenantId: string;
            phoneNumber: string | null;
            displayName: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            type: import(".prisma/client").$Enums.EntityType;
            createdByUserId: string;
        } | null;
        lines: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalLineAmount: import("@prisma/client/runtime/library").Decimal;
            accountCode: string;
            transactionId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TxnType;
        createdByUserId: string;
        entityId: string | null;
        reference: string | null;
        status: import(".prisma/client").$Enums.TxnStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        reversedTransactionId: string | null;
    }>;
    reverseTransaction(id: string, dto: ReverseTransactionDto): Promise<{
        lines: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalLineAmount: import("@prisma/client/runtime/library").Decimal;
            accountCode: string;
            transactionId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TxnType;
        createdByUserId: string;
        entityId: string | null;
        reference: string | null;
        status: import(".prisma/client").$Enums.TxnStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        reversedTransactionId: string | null;
    }>;
    updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto): Promise<{
        entity: {
            id: string;
            tenantId: string;
            phoneNumber: string | null;
            displayName: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            type: import(".prisma/client").$Enums.EntityType;
            createdByUserId: string;
        } | null;
        lines: {
            id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalLineAmount: import("@prisma/client/runtime/library").Decimal;
            accountCode: string;
            transactionId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TxnType;
        createdByUserId: string;
        entityId: string | null;
        reference: string | null;
        status: import(".prisma/client").$Enums.TxnStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
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
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import(".prisma/client").$Enums.EntityType;
        createdByUserId: string;
    }[]>;
    create(dto: any): Promise<{
        id: string;
        tenantId: string;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import(".prisma/client").$Enums.EntityType;
        createdByUserId: string;
    }>;
    findOne(id: string): Promise<{
        id: string;
        tenantId: string;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import(".prisma/client").$Enums.EntityType;
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
            phoneNumber: string | null;
            displayName: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            type: import(".prisma/client").$Enums.EntityType;
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
            phoneNumber: string | null;
            displayName: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            type: import(".prisma/client").$Enums.EntityType;
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
                metadata: import("@prisma/client/runtime/library").JsonValue;
                createdAt: Date;
                description: string | null;
                sku: string | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                totalLineAmount: import("@prisma/client/runtime/library").Decimal;
                accountCode: string;
                transactionId: string;
            }[];
        } & {
            id: string;
            tenantId: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            type: import(".prisma/client").$Enums.TxnType;
            createdByUserId: string;
            entityId: string | null;
            reference: string | null;
            status: import(".prisma/client").$Enums.TxnStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            currencyCode: string;
            reversedTransactionId: string | null;
        })[];
        attachments: any[];
    }>;
    searchByPhone(phone: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import(".prisma/client").$Enums.EntityType;
        createdByUserId: string;
    }[]>;
    addLinkedPhone(id: string, phone: string): Promise<{
        id: string;
        tenantId: string;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import(".prisma/client").$Enums.EntityType;
        createdByUserId: string;
    }>;
    removeLinkedPhone(id: string, phone: string): Promise<{
        id: string;
        tenantId: string;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import(".prisma/client").$Enums.EntityType;
        createdByUserId: string;
    }>;
}
