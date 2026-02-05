import { PrismaService } from '../prisma/prisma.service';
export interface CreateAccountDto {
    tenantId: string;
    name: string;
    type: string;
    currency?: string;
    metadata?: Record<string, any>;
    createdById?: string;
}
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
export interface AccountBalanceDto {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
}
export declare class UniversalAccountsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createAccount(data: CreateAccountDto): Promise<string>;
    getBalances(tenantId: string, groupBy?: string): Promise<AccountBalanceDto[]>;
    getAccount(accountId: string, tenantId: string): Promise<AccountBalanceDto>;
    listAccounts(tenantId: string): Promise<AccountBalanceDto[]>;
}
