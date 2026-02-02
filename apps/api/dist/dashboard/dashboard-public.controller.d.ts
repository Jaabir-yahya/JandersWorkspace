import { TenantsService } from '../tenants/tenants.service';
import { DashboardService } from './dashboard.service';
export declare class DashboardPublicController {
    private readonly dashboardService;
    private readonly tenantsService;
    constructor(dashboardService: DashboardService, tenantsService: TenantsService);
    getStatsByTenant(tenantId: string, tenantKey: string | undefined): Promise<import("./dashboard.service").DashboardStats>;
}
