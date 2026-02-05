import { PrismaService } from '../prisma/prisma.service';
export declare class RpcService {
    private prisma;
    constructor(prisma: PrismaService);
    createDoubleEntryTransaction(tenantId: string, userId: string, debitAccountType: string, creditAccountType: string, amount: number, description?: string, linkedEntityType?: string, linkedEntityId?: string, reference?: string, transactionDate?: Date): Promise<{
        debitTransactionId: string;
        creditTransactionId: string;
        transactionPairId: string;
        debitBalanceBefore: number;
        debitBalanceAfter: number;
        creditBalanceBefore: number;
        creditBalanceAfter: number;
    }>;
    reverseDoubleEntryTransaction(tenantId: string, userId: string, transactionPairId: string, reason?: string): Promise<{
        reversalDebitTransactionId: string;
        reversalCreditTransactionId: string;
        reversalTransactionPairId: string;
    }>;
    updateAccountBalance(tx: any, accountId: string, newBalance: number): Promise<void>;
    getTrialBalance(tenantId: string): Promise<{
        accounts: Array<{
            id: string;
            name: string;
            type: string;
            balance: number;
            balanceType: 'DEBIT' | 'CREDIT';
        }>;
        totalDebits: number;
        totalCredits: number;
        isBalanced: boolean;
    }>;
    logAuditEvent(tenantId: string, userId: string, action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REVERSE', tableName: string, recordId: string, oldData?: any, newData?: any, description?: string): Promise<void>;
    validateDoubleEntryIntegrity(tenantId: string, transactionPairId: string): Promise<{
        isValid: boolean;
        errors: string[];
        transactions: any[];
    }>;
    private findOrCreateAccount;
}
