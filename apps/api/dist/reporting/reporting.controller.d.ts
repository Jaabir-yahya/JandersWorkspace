import { ReportingService } from './reporting.service';
import type { FinancialSummaryDto, BalanceSheetDto, TrialBalanceDto } from './reporting.service';
export declare class ReportingController {
    private readonly reportingService;
    constructor(reportingService: ReportingService);
    getTrialBalance(req: any, asOfDate?: string, accountType?: string): Promise<TrialBalanceDto[]>;
    getFinancialSummary(req: any, startDate?: string, endDate?: string): Promise<FinancialSummaryDto>;
    getBalanceSheet(req: any, asOfDate?: string): Promise<BalanceSheetDto>;
    getTransactionHistory(req: any, fromDate?: string, toDate?: string, accountId?: string, limit?: number): Promise<any[]>;
    exportData(req: any, type: 'transactions' | 'trial_balance' | 'financial_summary' | 'balance_sheet', res: any, format?: 'json' | 'csv', fromDate?: string, toDate?: string): Promise<void>;
}
