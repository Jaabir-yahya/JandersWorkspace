import { PrismaService } from '../prisma/prisma.service';
export interface DashboardStats {
    total_revenue_today: number;
    total_revenue_week: number;
    total_revenue_month: number;
    transactions_today: number;
    transactions_week: number;
    outstanding_credit: number;
    outstanding_debt: number;
    payment_method_breakdown: {
        cash: number;
        mpesa: number;
        bank: number;
        credit: number;
    };
    top_customers: Array<{
        entity_id: string;
        display_name: string;
        total_amount: number;
        transaction_count: number;
    }>;
    recent_activity: Array<{
        id: string;
        type: 'transaction' | 'payment' | 'entity' | 'reversal';
        description: string;
        amount?: number;
        timestamp: string;
    }>;
}
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(tenantId: string): Promise<DashboardStats>;
    getMetrics(tenantId: string, startDate?: string, endDate?: string): Promise<{
        total_transactions: number;
        total_amount: number;
        by_type: Record<string, number>;
        by_payment_method: {
            cash: number;
            mpesa: number;
            bank: number;
        };
        recent_transactions: {
            id: string;
            type: import("@prisma/client").$Enums.TxnType;
            amount: number;
            date: string;
        }[];
    }>;
    getReconciliationSummary(tenantId: string): Promise<{
        total_expected: number;
        total_received: number;
        variance: number;
        by_method: {
            cash: number;
            mpesa: number;
            bank: number;
        };
    }>;
}
