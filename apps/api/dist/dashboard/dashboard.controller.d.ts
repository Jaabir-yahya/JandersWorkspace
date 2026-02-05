import { TenantsService } from '../tenants/tenants.service';
import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    private readonly tenantsService;
    constructor(dashboardService: DashboardService, tenantsService: TenantsService);
    private resolveTenant;
    getStats(tenantId: string, req: any, xTenantId?: string): Promise<import("./dashboard.service").DashboardStats>;
    getMetrics(tenantId: string, req: any, xTenantId?: string, startDate?: string, endDate?: string): Promise<{
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
    getReconciliation(tenantId: string, req: any, xTenantId?: string): Promise<{
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
