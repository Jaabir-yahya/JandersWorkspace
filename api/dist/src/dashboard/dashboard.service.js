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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(tenantId) {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const todayRevenue = await this.prisma.transaction.findMany({
            where: {
                tenantId,
                status: client_1.TxnStatus.POSTED,
                type: { in: [client_1.TxnType.RETAIL, client_1.TxnType.SERVICE, client_1.TxnType.RENTAL] },
                createdAt: { gte: startOfToday },
            },
            select: { totalAmount: true },
        });
        const weekRevenue = await this.prisma.transaction.findMany({
            where: {
                tenantId,
                status: client_1.TxnStatus.POSTED,
                type: { in: [client_1.TxnType.RETAIL, client_1.TxnType.SERVICE, client_1.TxnType.RENTAL] },
                createdAt: { gte: startOfWeek },
            },
            select: { totalAmount: true },
        });
        const monthRevenue = await this.prisma.transaction.findMany({
            where: {
                tenantId,
                status: client_1.TxnStatus.POSTED,
                type: { in: [client_1.TxnType.RETAIL, client_1.TxnType.SERVICE, client_1.TxnType.RENTAL] },
                createdAt: { gte: startOfMonth },
            },
            select: { totalAmount: true },
        });
        const todayCount = await this.prisma.transaction.count({
            where: {
                tenantId,
                status: client_1.TxnStatus.POSTED,
                createdAt: { gte: startOfToday },
            },
        });
        const weekCount = await this.prisma.transaction.count({
            where: {
                tenantId,
                status: client_1.TxnStatus.POSTED,
                createdAt: { gte: startOfWeek },
            },
        });
        const creditData = await this.prisma.transaction.findMany({
            where: {
                tenantId,
                status: client_1.TxnStatus.POSTED,
                type: { in: [client_1.TxnType.RETAIL, client_1.TxnType.SERVICE, client_1.TxnType.RENTAL] },
                paymentStatus: { in: [client_1.PaymentStatus.PENDING, client_1.PaymentStatus.PARTIAL] },
            },
            select: { totalAmount: true },
        });
        const debtData = await this.prisma.transaction.findMany({
            where: {
                tenantId,
                status: client_1.TxnStatus.POSTED,
                type: client_1.TxnType.EXPENSE,
                paymentStatus: { in: [client_1.PaymentStatus.PENDING, client_1.PaymentStatus.PARTIAL] },
            },
            select: { totalAmount: true },
        });
        const paymentData = await this.prisma.payment.findMany({
            where: { tenantId },
            select: {
                amount: true,
                metadata: true,
            },
        });
        const topCustomersRaw = await this.prisma.transaction.groupBy({
            by: ['entityId'],
            where: {
                tenantId,
                status: client_1.TxnStatus.POSTED,
            },
            _sum: {
                totalAmount: true,
            },
            _count: {
                id: true,
            },
            orderBy: {
                _sum: {
                    totalAmount: 'desc',
                },
            },
            take: 5,
        });
        const entityIds = topCustomersRaw.map(c => c.entityId).filter(Boolean);
        const entities = await this.prisma.entity.findMany({
            where: {
                id: { in: entityIds },
            },
            select: {
                id: true,
                displayName: true,
            },
        });
        const topCustomers = topCustomersRaw.map(customer => {
            const entity = entities.find(e => e.id === customer.entityId);
            return {
                entity_id: customer.entityId || '',
                display_name: entity?.displayName || 'Unknown',
                total_amount: Number(customer._sum.totalAmount) || 0,
                transaction_count: customer._count.id,
            };
        });
        const recentActivity = await this.prisma.transaction.findMany({
            where: { tenantId },
            select: {
                id: true,
                type: true,
                totalAmount: true,
                createdAt: true,
                reference: true,
                entity: {
                    select: {
                        displayName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });
        const paymentBreakdown = { cash: 0, mpesa: 0, bank: 0, credit: 0 };
        paymentData.forEach((payment) => {
            const metadata = payment.metadata;
            const method = metadata?.method?.toLowerCase() || 'unknown';
            const amount = Number(payment.amount);
            if (method === 'cash')
                paymentBreakdown.cash += amount;
            else if (method === 'm-pesa' || method === 'mpesa')
                paymentBreakdown.mpesa += amount;
            else if (method === 'bank_transfer' || method === 'bank')
                paymentBreakdown.bank += amount;
            else if (method === 'credit')
                paymentBreakdown.credit += amount;
        });
        const formattedActivity = recentActivity.map((txn) => ({
            id: txn.id,
            type: (txn.type === 'EXPENSE' ? 'transaction' : 'transaction'),
            description: `${txn.type} - ${txn.entity?.displayName || 'Unknown'}${txn.reference ? ` (${txn.reference})` : ''}`,
            amount: Number(txn.totalAmount),
            timestamp: txn.createdAt.toISOString(),
        }));
        return {
            total_revenue_today: todayRevenue.reduce((sum, t) => sum + Number(t.totalAmount), 0),
            total_revenue_week: weekRevenue.reduce((sum, t) => sum + Number(t.totalAmount), 0),
            total_revenue_month: monthRevenue.reduce((sum, t) => sum + Number(t.totalAmount), 0),
            transactions_today: todayCount,
            transactions_week: weekCount,
            outstanding_credit: creditData.reduce((sum, t) => sum + Number(t.totalAmount), 0),
            outstanding_debt: debtData.reduce((sum, t) => sum + Number(t.totalAmount), 0),
            payment_method_breakdown: paymentBreakdown,
            top_customers: topCustomers,
            recent_activity: formattedActivity,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map