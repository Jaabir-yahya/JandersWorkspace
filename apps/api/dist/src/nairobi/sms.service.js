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
exports.NairobiSmsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NairobiSmsService = class NairobiSmsService {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async generateDailySummary(tenantId) {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const transactions = await this.prismaService.transaction.findMany({
            where: {
                tenantId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                entity: true,
            },
        });
        const allTransactionIds = transactions.map((t) => t.id);
        const transactionLines = await this.prismaService.transactionLine.findMany({
            where: {
                transactionId: {
                    in: allTransactionIds,
                },
            },
            include: {
                transaction: true,
            },
        });
        const totalSales = transactionLines
            .filter((tl) => !transactions
            .find((t) => t.id === tl.transactionId)
            ?.type.includes('EXPENSE'))
            .reduce((sum, tl) => sum + Number(tl.totalLineAmount), 0);
        const totalExpenses = transactionLines
            .filter((tl) => transactions.find((t) => t.id === tl.transactionId)?.type ===
            'EXPENSE')
            .reduce((sum, tl) => sum + Number(tl.totalLineAmount), 0);
        const netProfit = totalSales - totalExpenses;
        const transactionCount = transactions.length;
        const tenant = await this.prismaService.tenant.findUnique({
            where: { id: tenantId },
        });
        const user = await this.prismaService.user.findFirst({
            where: { tenantId },
        });
        if (!tenant) {
            throw new Error(`Tenant ${tenantId} not found`);
        }
        const message = this.formatSmsMessage({
            businessName: tenant.name,
            totalSales,
            totalExpenses,
            netProfit,
            transactionCount,
            date: today.toLocaleDateString('en-KE'),
        });
        return {
            phoneNumber: user?.phoneNumber || '',
            message,
            type: 'daily',
        };
    }
    async sendSms(sms) {
        console.log(`Sending SMS to ${sms.phoneNumber}: ${sms.message}`);
        return true;
    }
    async sendDailySummaries() {
        const tenants = await this.prismaService.tenant.findMany({
            where: {
                isActive: true,
                tier: 'BASIC',
            },
        });
        for (const tenant of tenants) {
            try {
                const summary = await this.generateDailySummary(tenant.id);
                await this.sendSms(summary);
            }
            catch (error) {
                console.error(`Failed to send SMS to ${tenant.id}:`, error.message);
            }
        }
    }
    formatSmsMessage(data) {
        const currency = (amount) => `KES ${amount.toLocaleString()}`;
        return (`📊 ${data.businessName} (${data.date})\n` +
            `💰 Sales: ${currency(data.totalSales)}\n` +
            `💸 Expenses: ${currency(data.totalExpenses)}\n` +
            `📈 Profit: ${currency(data.netProfit)}\n` +
            `📝 Transactions: ${data.transactionCount}\n` +
            `Reply MENU for more options`);
    }
    async handleSmsCommand(phoneNumber, message) {
        const user = await this.prismaService.user.findFirst({
            where: { phoneNumber },
        });
        if (!user) {
            return 'Sorry, business not found. Please contact support.';
        }
        const tenant = await this.prismaService.tenant.findUnique({
            where: { id: user.tenantId },
        });
        if (!tenant) {
            return 'Sorry, business not found. Please contact support.';
        }
        const command = message.toUpperCase().trim();
        switch (command) {
            case 'MENU':
                return ('📋 COMMANDS:\n' +
                    "TODAY - Today's summary\n" +
                    "WEEK - This week's summary\n" +
                    'BALANCE - Current balance\n' +
                    'HELP - More help');
            case 'TODAY':
                const summary = await this.generateDailySummary(tenant.id);
                return summary.message;
            default:
                return 'Unknown command. Reply MENU for options.';
        }
    }
    async setupSmsWebhook() {
        return {
            url: `${process.env.API_BASE_URL}/api/v1/nairobi/sms/webhook`,
            method: 'POST',
        };
    }
};
exports.NairobiSmsService = NairobiSmsService;
exports.NairobiSmsService = NairobiSmsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NairobiSmsService);
//# sourceMappingURL=sms.service.js.map