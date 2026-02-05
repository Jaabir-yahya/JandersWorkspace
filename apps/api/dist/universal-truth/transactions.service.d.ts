import { PrismaService } from '../prisma/prisma.service';
export interface CreateTransactionDto {
    tenantId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    reasonId?: string;
    entityId?: string;
    notes?: string;
    reference?: string;
    createdById?: string;
}
export interface TransactionStreamOptions {
    fromDate?: string;
    toDate?: string;
    accountId?: string;
    entityId?: string;
    limit?: number;
}
export interface TransactionStreamDto {
    id: string;
    date: Date;
    amount: number;
    fromAccountName: string;
    toAccountName: string;
    reasonName: string;
    entityName?: string;
    notes?: string;
    reference?: string;
}
export declare class UniversalTransactionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createDoubleEntryTransaction(data: CreateTransactionDto): Promise<string>;
    getTransactionStream(tenantId: string, options?: TransactionStreamOptions): Promise<TransactionStreamDto[]>;
    reverseTransaction(transactionId: string, reason: string): Promise<string>;
    getTransaction(transactionId: string): Promise<any>;
}
