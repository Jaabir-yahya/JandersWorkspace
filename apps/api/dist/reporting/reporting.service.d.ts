import { PrismaService } from '../prisma/prisma.service';
import { UniversalAccountsService } from '../universal-truth/accounts.service';
import { UniversalTransactionsService } from '../universal-truth/transactions.service';
export interface TrialBalanceDto {
    accountId: string;
    accountName: string;
    accountType: string;
    debit: number;
    credit: number;
    balance: number;
}
export interface FinancialSummaryDto {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    totalAssets: number;
    totalLiabilities: number;
    equity: number;
    period: {
        startDate: string;
        endDate: string;
    };
}
export interface BalanceSheetDto {
    assets: {
        cash: number;
        accountsReceivable: number;
        inventory: number;
        other: number;
    };
    liabilities: {
        accountsPayable: number;
        other: number;
    };
    equity: number;
}
export interface TransactionHistoryDto {
    id: string;
    date: string;
    amount: number;
    fromAccount: string;
    toAccount: string;
    reason: string;
    entity: string;
    reference: string;
    type: string;
}
export declare class ReportingService {
    private readonly prisma;
    private readonly accountsService;
    private readonly transactionsService;
    constructor(prisma: PrismaService, accountsService: UniversalAccountsService, transactionsService: UniversalTransactionsService);
    getTrialBalance(tenantId: string, options?: {
        asOfDate?: string;
        accountType?: string;
    }): Promise<TrialBalanceDto[]>;
    getFinancialSummary(tenantId: string, options?: {
        startDate?: string;
        endDate?: string;
    }): Promise<FinancialSummaryDto>;
    getBalanceSheet(tenantId: string, options?: {
        asOfDate?: string;
    }): Promise<BalanceSheetDto>;
    getTransactionHistory(tenantId: string, options?: {
        fromDate?: string;
        toDate?: string;
        accountId?: string;
        limit?: number;
    }): Promise<TransactionHistoryDto[]>;
    exportData(tenantId: string, dataType: 'trial_balance' | 'financial_summary' | 'balance_sheet' | 'transactions', format: 'json' | 'csv', options?: {
        fromDate?: string;
        toDate?: string;
    }): Promise<any>;
    private convertToCSV;
}
