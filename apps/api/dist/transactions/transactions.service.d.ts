import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UniversalInvoice } from './interfaces/universal-invoice.interface';
import { Prisma } from '@prisma/client';
export interface TransactionFilters {
    status?: string;
    type?: string;
    entity_id?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    payment_status?: string;
}
export interface EntityHistoryItem {
    transaction_id: string;
    transaction_date: string;
    type: string;
    status: string;
    payment_status: string;
    total_amount: number;
    currency_code: string;
    reference: string;
    running_balance: number;
}
export declare class TransactionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOrCreateManualUserForTenant(tenantId: string): Promise<string>;
    create(dto: CreateTransactionDto): Promise<{
        entity: {
            id: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.EntityType;
            createdAt: Date;
            phoneNumber: string | null;
            displayName: string;
            metadata: Prisma.JsonValue;
            createdByUserId: string;
        } | null;
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            metadata: Prisma.JsonValue;
            sku: string | null;
            quantity: Prisma.Decimal;
            unitPrice: Prisma.Decimal;
            totalLineAmount: Prisma.Decimal;
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
        metadata: Prisma.JsonValue;
        reference: string | null;
        totalAmount: Prisma.Decimal;
        currencyCode: string;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        entityId: string | null;
        createdByUserId: string;
        reversedTransactionId: string | null;
    }>;
    findAll(tenantId: string, filters?: TransactionFilters): Promise<({
        entity: {
            id: string;
            phoneNumber: string | null;
            displayName: string;
        } | null;
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            metadata: Prisma.JsonValue;
            sku: string | null;
            quantity: Prisma.Decimal;
            unitPrice: Prisma.Decimal;
            totalLineAmount: Prisma.Decimal;
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
        metadata: Prisma.JsonValue;
        reference: string | null;
        totalAmount: Prisma.Decimal;
        currencyCode: string;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        entityId: string | null;
        createdByUserId: string;
        reversedTransactionId: string | null;
    })[]>;
    exportBulk(tenantId: string, filters?: TransactionFilters, format?: 'json' | 'csv', limit?: number): Promise<unknown[] | string>;
    findOne(id: string): Promise<{
        entity: {
            id: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.EntityType;
            createdAt: Date;
            phoneNumber: string | null;
            displayName: string;
            metadata: Prisma.JsonValue;
            createdByUserId: string;
        } | null;
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            metadata: Prisma.JsonValue;
            sku: string | null;
            quantity: Prisma.Decimal;
            unitPrice: Prisma.Decimal;
            totalLineAmount: Prisma.Decimal;
            accountCode: string;
            transactionId: string;
        }[];
        paymentApplications: ({
            payment: {
                status: import("@prisma/client").$Enums.PaymentStatus;
                id: string;
                tenantId: string;
                createdAt: Date;
                metadata: Prisma.JsonValue;
                amount: Prisma.Decimal;
                reference: string | null;
                currencyCode: string;
                createdByUserId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            transactionId: string;
            paymentId: string;
            appliedAmount: Prisma.Decimal;
        })[];
    } & {
        status: import("@prisma/client").$Enums.TxnStatus;
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.TxnType;
        createdAt: Date;
        updatedAt: Date;
        metadata: Prisma.JsonValue;
        reference: string | null;
        totalAmount: Prisma.Decimal;
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
            metadata: Prisma.JsonValue;
            sku: string | null;
            quantity: Prisma.Decimal;
            unitPrice: Prisma.Decimal;
            totalLineAmount: Prisma.Decimal;
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
        metadata: Prisma.JsonValue;
        reference: string | null;
        totalAmount: Prisma.Decimal;
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
            metadata: Prisma.JsonValue;
            createdByUserId: string;
        } | null;
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            metadata: Prisma.JsonValue;
            sku: string | null;
            quantity: Prisma.Decimal;
            unitPrice: Prisma.Decimal;
            totalLineAmount: Prisma.Decimal;
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
        metadata: Prisma.JsonValue;
        reference: string | null;
        totalAmount: Prisma.Decimal;
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
            metadata: Prisma.JsonValue;
            sku: string | null;
            quantity: Prisma.Decimal;
            unitPrice: Prisma.Decimal;
            totalLineAmount: Prisma.Decimal;
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
        metadata: Prisma.JsonValue;
        reference: string | null;
        totalAmount: Prisma.Decimal;
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
            metadata: Prisma.JsonValue;
            createdByUserId: string;
        } | null;
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            metadata: Prisma.JsonValue;
            sku: string | null;
            quantity: Prisma.Decimal;
            unitPrice: Prisma.Decimal;
            totalLineAmount: Prisma.Decimal;
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
        metadata: Prisma.JsonValue;
        reference: string | null;
        totalAmount: Prisma.Decimal;
        currencyCode: string;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        entityId: string | null;
        createdByUserId: string;
        reversedTransactionId: string | null;
    }>;
    getEntityHistory(entityId: string, tenantId: string): Promise<{
        entity: any;
        transactions: EntityHistoryItem[];
        total_balance: number;
    }>;
    standardizeTransaction(id: string): Promise<UniversalInvoice>;
    searchTransactions(tenantId: string, searchTerm: string, filters?: Omit<TransactionFilters, 'search'>): Promise<({
        entity: {
            id: string;
            phoneNumber: string | null;
            displayName: string;
        } | null;
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            metadata: Prisma.JsonValue;
            sku: string | null;
            quantity: Prisma.Decimal;
            unitPrice: Prisma.Decimal;
            totalLineAmount: Prisma.Decimal;
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
        metadata: Prisma.JsonValue;
        reference: string | null;
        totalAmount: Prisma.Decimal;
        currencyCode: string;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        entityId: string | null;
        createdByUserId: string;
        reversedTransactionId: string | null;
    })[]>;
    findAllEntities(tenantId: string, filters?: {
        type?: string;
        search?: string;
    }): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: Prisma.JsonValue;
        createdByUserId: string;
    }[]>;
    createEntity(dto: any): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: Prisma.JsonValue;
        createdByUserId: string;
    }>;
    findEntityById(id: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: Prisma.JsonValue;
        createdByUserId: string;
    }>;
    getEntityBalance(entityId: string, tenantId: string): Promise<{
        entity: {
            id: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.EntityType;
            createdAt: Date;
            phoneNumber: string | null;
            displayName: string;
            metadata: Prisma.JsonValue;
            createdByUserId: string;
        };
        balance: {
            total_credit: number;
            total_debit: number;
            net_balance: number;
            transaction_count: number;
        };
    }>;
    getEntity360View(entityId: string, tenantId: string): Promise<{
        entity: {
            id: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.EntityType;
            createdAt: Date;
            phoneNumber: string | null;
            displayName: string;
            metadata: Prisma.JsonValue;
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
                metadata: Prisma.JsonValue;
                sku: string | null;
                quantity: Prisma.Decimal;
                unitPrice: Prisma.Decimal;
                totalLineAmount: Prisma.Decimal;
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
            metadata: Prisma.JsonValue;
            reference: string | null;
            totalAmount: Prisma.Decimal;
            currencyCode: string;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            entityId: string | null;
            createdByUserId: string;
            reversedTransactionId: string | null;
        })[];
        attachments: any[];
    }>;
    searchEntitiesByPhone(phone: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: Prisma.JsonValue;
        createdByUserId: string;
    }[]>;
    addLinkedPhone(entityId: string, phone: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: Prisma.JsonValue;
        createdByUserId: string;
    }>;
    removeLinkedPhone(entityId: string, phone: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: Prisma.JsonValue;
        createdByUserId: string;
    }>;
}
