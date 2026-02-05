import { ReportingService } from './reporting.service';
import type { Response as ExpressResponse } from 'express';
export declare class ReportingController {
    private readonly reportingService;
    constructor(reportingService: ReportingService);
    getTrialBalance(req: any): Promise<any>;
    getTransactionHistory(req: any, dateFrom?: string, dateTo?: string, accountType?: string, entityType?: string, entityId?: string, containerId?: string): Promise<any>;
    getInventoryReport(req: any): Promise<any>;
    getSalesReport(req: any, dateFrom?: string, dateTo?: string): Promise<any>;
    getExpenseReport(req: any, dateFrom?: string, dateTo?: string): Promise<any>;
    getCashFlowReport(req: any, dateFrom?: string, dateTo?: string): Promise<any>;
    exportData(req: any, res: ExpressResponse, dataType: 'transactions' | 'inventory' | 'supplies' | 'invoices' | 'payments', format?: 'json' | 'csv'): Promise<void>;
    getDashboardKpis(req: any): Promise<{
        financial: {
            totalAssets: any;
            totalLiabilities: any;
            equity: number;
            monthlyRevenue: any;
            monthlyExpenses: any;
            netProfit: number;
            profitMargin: number;
        };
        operational: {
            totalInventoryItems: any;
            totalInventoryValue: any;
            lowStockItems: any;
            monthlyTransactions: any;
            averageTransactionValue: number;
        };
        cashFlow: {
            monthlyNetCash: number;
            cashFlowPerDay: number;
        };
        alerts: {
            lowStockAlert: boolean;
            profitAlert: boolean;
            cashFlowAlert: boolean;
        };
        generatedAt: Date;
    }>;
}
