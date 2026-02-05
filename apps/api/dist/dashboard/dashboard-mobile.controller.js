"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardMobileController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("../dashboard/dashboard.service");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardMobileController = class DashboardMobileController {
    dashboardService;
    prisma;
    constructor(dashboardService, prisma) {
        this.dashboardService = dashboardService;
        this.prisma = prisma;
    }
    async getMobileDashboard(tenantId) {
        if (!tenantId?.trim()) {
            throw new common_1.BadRequestException('X-Tenant-Id header is required');
        }
        let manualUser = await this.prisma.user.findFirst({
            where: {
                metadata: {
                    path: ['manual_capture'],
                    equals: true,
                },
            },
        });
        if (!manualUser) {
            manualUser = await this.prisma.user.create({
                data: {
                    email: `manual-${tenantId}@placeholder.local`,
                    tenantId,
                    displayName: 'Manual User',
                    role: 'user',
                    metadata: {
                        manual_capture: true,
                    },
                },
            });
        }
        const manualUserId = manualUser.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const stats = await this.prisma.transaction.aggregate({
            where: {
                tenantId,
                createdByUserId: manualUserId,
                createdAt: {
                    gte: today,
                },
            },
            _sum: {
                amount: true,
            },
            _count: {
                id: true,
            },
        });
        const recentTransactions = await this.prisma.transaction.findMany({
            where: {
                tenantId,
                createdByUserId: manualUserId,
            },
            include: {
                entity: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        entityType: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });
        const entityCounts = await this.prisma.entity.groupBy({
            by: ['entityType'],
            where: {
                tenantId,
            },
            _count: {
                id: true,
            },
        });
        return {
            success: true,
            data: {
                today: {
                    revenue: Number(stats._sum.amount) || 0,
                    transactionCount: stats._count.id || 0,
                },
                entities: {
                    total: entityCounts.reduce((sum, group) => sum + group._count.id, 0),
                    byType: entityCounts.reduce((acc, group) => {
                        acc[group.entityType] = group._count.id;
                        return acc;
                    }, {}),
                },
                recentTransactions: recentTransactions.map((tx) => ({
                    id: tx.id,
                    amount: Number(tx.amount),
                    type: tx.type,
                    status: tx.status,
                    createdAt: tx.createdAt,
                    entity: tx.entity,
                })),
            },
        };
    }
};
exports.DashboardMobileController = DashboardMobileController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardMobileController.prototype, "getMobileDashboard", null);
exports.DashboardMobileController = DashboardMobileController = __decorate([
    (0, common_1.Controller)('dashboard/mobile'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService,
        prisma_service_1.PrismaService])
], DashboardMobileController);
//# sourceMappingURL=dashboard-mobile.controller.js.map