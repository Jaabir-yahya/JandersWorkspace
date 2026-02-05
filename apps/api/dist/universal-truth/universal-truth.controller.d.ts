import type { CreateAccountDto } from './accounts.service';
import type { CreateTransactionDto } from './transactions.service';
import { UniversalAccountsService, AccountBalanceDto } from './accounts.service';
import { UniversalTransactionsService, TransactionStreamDto } from './transactions.service';
export declare class UniversalAccountsController {
    private readonly accountsService;
    constructor(accountsService: UniversalAccountsService);
    createAccount(data: CreateAccountDto, req: any): Promise<string>;
    getAccounts(req: any, groupBy?: string): Promise<AccountBalanceDto[]>;
    getAccount(id: string, req: any): Promise<AccountBalanceDto>;
}
export declare class UniversalTransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: UniversalTransactionsService);
    createTransaction(data: CreateTransactionDto, req: any): Promise<{
        id: string;
        message: string;
        amount: number;
        fromAccount: string;
        toAccount: string;
    }>;
    getTransactionStream(req: any, fromDate?: string, toDate?: string, accountId?: string, entityId?: string, limit?: number): Promise<TransactionStreamDto[]>;
    getTransaction(id: string, req: any): Promise<any>;
    reverseTransaction(id: string, reason: string, req: any): Promise<{
        id: string;
        message: string;
        originalTransactionId: string;
        reversalReason: string;
    }>;
}
