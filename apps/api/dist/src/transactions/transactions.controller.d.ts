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
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            createdByUserId: string;
            displayName: string;
            phoneNumber: string | null;
        } | null;
        lines: {
            id: string;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
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
        metadata: import("@prisma/client/runtime/library").JsonValue;
        reference: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        createdAt: Date;
        updatedAt: Date;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        entityId: string | null;
        createdByUserId: string;
        reversedTransactionId: string | null;
    }>;
    findAll(tenantId: string, req: any, status?: string, type?: string, entityId?: string, dateFrom?: string, dateTo?: string, search?: string, paymentStatus?: string): Promise<({
        entity: {
            id: string;
            displayName: string;
            phoneNumber: string | null;
        } | null;
        lines: {
            id: string;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
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
        metadata: import("@prisma/client/runtime/library").JsonValue;
        reference: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        createdAt: Date;
        updatedAt: Date;
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
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            createdByUserId: string;
            displayName: string;
            phoneNumber: string | null;
        } | null;
        lines: {
            id: string;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
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
                metadata: import("@prisma/client/runtime/library").JsonValue;
                amount: import("@prisma/client/runtime/library").Decimal;
                reference: string | null;
                currencyCode: string;
                createdAt: Date;
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
        metadata: import("@prisma/client/runtime/library").JsonValue;
        reference: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        createdAt: Date;
        updatedAt: Date;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        entityId: string | null;
        createdByUserId: string;
        reversedTransactionId: string | null;
    }>;
    findByEntity(entityId: string): Promise<({
        lines: {
            id: string;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
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
        metadata: import("@prisma/client/runtime/library").JsonValue;
        reference: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        createdAt: Date;
        updatedAt: Date;
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
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            createdByUserId: string;
            displayName: string;
            phoneNumber: string | null;
        } | null;
        lines: {
            id: string;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
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
        metadata: import("@prisma/client/runtime/library").JsonValue;
        reference: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        createdAt: Date;
        updatedAt: Date;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        entityId: string | null;
        createdByUserId: string;
        reversedTransactionId: string | null;
    }>;
    reverseTransaction(id: string, dto: ReverseTransactionDto): Promise<{
        lines: {
            id: string;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
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
        metadata: import("@prisma/client/runtime/library").JsonValue;
        reference: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        createdAt: Date;
        updatedAt: Date;
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
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            createdByUserId: string;
            displayName: string;
            phoneNumber: string | null;
        } | null;
        lines: {
            id: string;
            description: string | null;
            sku: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
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
        metadata: import("@prisma/client/runtime/library").JsonValue;
        reference: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currencyCode: string;
        createdAt: Date;
        updatedAt: Date;
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
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        createdByUserId: string;
        displayName: string;
        phoneNumber: string | null;
    }[]>;
    create(dto: any): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        createdByUserId: string;
        displayName: string;
        phoneNumber: string | null;
    }>;
    findOne(id: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        createdByUserId: string;
        displayName: string;
        phoneNumber: string | null;
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
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            createdByUserId: string;
            displayName: string;
            phoneNumber: string | null;
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
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            createdByUserId: string;
            displayName: string;
            phoneNumber: string | null;
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
                description: string | null;
                sku: string | null;
                quantity: import("@prisma/client/runtime/library").Decimal;
                metadata: import("@prisma/client/runtime/library").JsonValue;
                createdAt: Date;
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
            metadata: import("@prisma/client/runtime/library").JsonValue;
            reference: string | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            currencyCode: string;
            createdAt: Date;
            updatedAt: Date;
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
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        createdByUserId: string;
        displayName: string;
        phoneNumber: string | null;
    }[]>;
    addLinkedPhone(id: string, phone: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        createdByUserId: string;
        displayName: string;
        phoneNumber: string | null;
    }>;
    removeLinkedPhone(id: string, phone: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        createdByUserId: string;
        displayName: string;
        phoneNumber: string | null;
    }>;
}
