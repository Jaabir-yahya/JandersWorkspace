import { PrismaService } from '../prisma/prisma.service';
export declare class ReportingService {
    private prisma;
    constructor(prisma: PrismaService);
    getTrialBalance(tenantId: string): Promise<any>;
    getTransactionHistory(tenantId: string, filters?: {
        dateFrom?: string;
        dateTo?: string;
        accountType?: string;
        entityType?: string;
        entityId?: string;
        containerId?: string;
    }): Promise<any>;
    getInventoryReport(tenantId: string): Promise<any>;
    getSalesReport(tenantId: string, filters?: {
        dateFrom?: string;
        dateTo?: string;
    }): Promise<any>;
    getExpenseReport(tenantId: string, filters?: {
        dateFrom?: string;
        dateTo?: string;
    }): Promise<any>;
    getCashFlowReport(tenantId: string, filters?: {
        dateFrom?: string;
        dateTo?: string;
    }): Promise<any>;
    exportData(tenantId: string, dataType: 'transactions' | 'inventory' | 'supplies' | 'invoices' | 'payments', format?: 'json' | 'csv'): Promise<any>;
    private convertToCSV;
}
