import { PrismaService } from '../prisma/prisma.service';
import { CreateDoubleEntryTransactionDto, TransactionDto } from './dto/transaction.dto';
import { AccountsService } from './accounts.service';
export declare class TransactionsService {
    private prisma;
    private accountsService;
    constructor(prisma: PrismaService, accountsService: AccountsService);
    createDoubleEntry(tenantId: string, userId: string, createDoubleEntryDto: CreateDoubleEntryTransactionDto): Promise<{
        debitTransaction: TransactionDto;
        creditTransaction: TransactionDto;
        transactionPairId: string;
    }>;
    reverseDoubleEntry(tenantId: string, userId: string, transactionPairId: string): Promise<{
        reversalDebitTransaction: TransactionDto;
        reversalCreditTransaction: TransactionDto;
    }>;
    findMany(tenantId: string, filters?: {
        dateFrom?: string;
        dateTo?: string;
        accountType?: string;
        entityType?: string;
        entityName?: string;
    }): Promise<TransactionDto[]>;
    findOne(tenantId: string, id: string): Promise<TransactionDto>;
    getTransactionHistory(tenantId: string, filters?: {
        dateFrom?: string;
        dateTo?: string;
        accountType?: string;
        entityType?: string;
    }): Promise<any[]>;
    private findOrCreateAccount;
    private logAuditEvent;
    private mapToDto;
}
