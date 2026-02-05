import { RpcService } from './rpc.service';
export declare class RpcController {
    private readonly rpcService;
    constructor(rpcService: RpcService);
    createDoubleEntryTransaction(req: any, createDoubleEntryDto: {
        debitAccountType: string;
        creditAccountType: string;
        amount: number;
        description?: string;
        linkedEntityType?: string;
        linkedEntityId?: string;
        reference?: string;
        transactionDate?: string;
    }): Promise<{
        debitTransactionId: string;
        creditTransactionId: string;
        transactionPairId: string;
        debitBalanceBefore: number;
        debitBalanceAfter: number;
        creditBalanceBefore: number;
        creditBalanceAfter: number;
    }>;
    reverseDoubleEntryTransaction(req: any, reverseDto: {
        transactionPairId: string;
        reason?: string;
    }): Promise<{
        reversalDebitTransactionId: string;
        reversalCreditTransactionId: string;
        reversalTransactionPairId: string;
    }>;
    getTrialBalance(req: any): Promise<{
        accounts: Array<{
            id: string;
            name: string;
            type: string;
            balance: number;
            balanceType: "DEBIT" | "CREDIT";
        }>;
        totalDebits: number;
        totalCredits: number;
        isBalanced: boolean;
    }>;
    validateTransactionIntegrity(req: any, transactionPairId: string): Promise<{
        isValid: boolean;
        errors: string[];
        transactions: any[];
    }>;
    logAuditEvent(req: any, auditDto: {
        action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REVERSE';
        tableName: string;
        recordId: string;
        oldData?: any;
        newData?: any;
        description?: string;
    }): Promise<{
        success: boolean;
    }>;
}
