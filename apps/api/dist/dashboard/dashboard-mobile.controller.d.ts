import { DashboardService } from '../dashboard/dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardMobileController {
    private readonly dashboardService;
    private readonly prisma;
    constructor(dashboardService: DashboardService, prisma: PrismaService);
    getMobileDashboard(tenantId: string): Promise<{
        success: boolean;
        data: {
            today: {
                revenue: number;
                transactionCount: number;
            };
            entities: {
                total: any;
                byType: {};
            };
            recentTransactions: {
                id: string;
                amount: number;
                type: import("@prisma/client").$Enums.TxnType;
                status: import("@prisma/client").$Enums.TxnStatus;
                createdAt: Date;
                entity: {
                    id: string;
                    phone: string | null;
                    name: string;
                    entityType: import("@prisma/client").$Enums.EntityType;
                } | null;
            }[];
        };
    }>;
}
