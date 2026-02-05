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
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const accounts_service_1 = require("../universal-truth/accounts.service");
const transactions_service_1 = require("../universal-truth/transactions.service");
let ReportingService = class ReportingService {
    prisma;
    accountsService;
    transactionsService;
    constructor(prisma, accountsService, transactionsService) {
        this.prisma = prisma;
        this.accountsService = accountsService;
        this.transactionsService = transactionsService;
    }
    async getTrialBalance(tenantId, options) {
        const accounts = await this.prisma.account.findMany({
            where: {
                tenantId,
                isActive: true,
                ...(options?.accountType && { type: options.accountType }),
            },
            orderBy: {
                type: 'asc',
                name: 'asc',
            },
        });
        const trialBalance = [];
        for (const account of accounts) {
            const balance = Number(account.balance);
            const isDebitAccount = ['ASSETS', 'EXPENSES', 'COST_OF_SALES'].includes(account.type);
            trialBalance.push({
                accountId: account.id,
                accountName: account.name,
                accountType: account.type,
                debit: isDebitAccount ? Math.abs(balance) : 0,
                credit: !isDebitAccount ? Math.abs(balance) : 0,
                balance,
            });
        }
        return trialBalance;
    }
    async getFinancialSummary(tenantId, options) {
        const defaultEndDate = options?.endDate || new Date().toISOString().split('T')[0];
        const defaultStartDate = options?.startDate ||
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];
        const transactions = await this.transactionsService.getTransactionStream(tenantId, {
            fromDate: defaultStartDate,
            toDate: defaultEndDate,
            limit: 1000,
        });
        let totalRevenue = 0;
        let totalExpenses = 0;
        for (const tx of transactions) {
            if (tx.reasonName.includes('REVENUE') ||
                tx.reasonName.includes('SALES')) {
                totalRevenue += tx.amount;
            }
            else if (tx.reasonName.includes('EXPENSE') ||
                tx.reasonName.includes('PURCHASE')) {
                totalExpenses += tx.amount;
            }
        }
        const accounts = await this.prisma.account.findMany({
            where: {
                tenantId,
                isActive: true,
            },
        });
        let totalAssets = 0;
        let totalLiabilities = 0;
        for (const account of accounts) {
            const balance = Number(account.balance);
            if (['ASSETS', 'EXPENSES'].includes(account.type)) {
                totalAssets += balance;
            }
            else if (['LIABILITIES', 'EQUITY'].includes(account.type)) {
                totalLiabilities += balance;
            }
        }
        const netIncome = totalRevenue - totalExpenses;
        const equity = totalAssets - totalLiabilities;
        return {
            totalRevenue,
            totalExpenses,
            netIncome,
            totalAssets,
            totalLiabilities,
            equity,
            period: {
                startDate: defaultStartDate,
                endDate: defaultEndDate,
            },
        };
    }
    async getBalanceSheet(tenantId, options) {
        const accounts = await this.prisma.account.findMany({
            where: {
                tenantId,
                isActive: true,
            },
        });
        let cash = 0;
        let accountsReceivable = 0;
        let inventory = 0;
        let otherAssets = 0;
        let accountsPayable = 0;
        let otherLiabilities = 0;
        for (const account of accounts) {
            const balance = Number(account.balance);
            switch (account.type) {
                case 'CASH':
                case 'BANK':
                    cash += balance;
                    break;
                case 'RECEIVABLES':
                    accountsReceivable += balance;
                    break;
                case 'INVENTORY':
                    inventory += balance;
                    break;
                case 'LIABILITIES':
                case 'PAYABLES':
                    accountsPayable += balance;
                    break;
                default:
                    if (['ASSETS', 'EXPENSES'].includes(account.type)) {
                        otherAssets += balance;
                    }
                    else {
                        otherLiabilities += balance;
                    }
            }
        }
        const totalAssets = cash + accountsReceivable + inventory + otherAssets;
        const totalLiabilities = accountsPayable + otherLiabilities;
        const equity = totalAssets - totalLiabilities;
        return {
            assets: {
                cash,
                accountsReceivable,
                inventory,
                other: totalAssets - (cash + accountsReceivable + inventory),
            },
            liabilities: {
                accountsPayable,
                other: otherLiabilities,
            },
            equity,
        };
    }
    async getTransactionHistory(tenantId, options) {
        const transactions = await this.transactionsService.getTransactionStream(tenantId, options);
        return transactions.map((tx) => ({
            id: tx.id,
            date: tx.date.toISOString(),
            amount: tx.amount,
            fromAccount: tx.fromAccountName,
            toAccount: tx.toAccountName,
            reason: tx.reasonName,
            entity: tx.entityName ?? '',
            reference: tx.reference ?? '',
            type: 'TRANSACTION',
        }));
    }
    async exportData(tenantId, dataType, format, options) {
        let data;
        switch (dataType) {
            case 'trial_balance':
                data = await this.getTrialBalance(tenantId, options
                    ? {
                        asOfDate: options.toDate ?? options.fromDate,
                        accountType: undefined,
                    }
                    : undefined);
                break;
            case 'financial_summary':
                data = await this.getFinancialSummary(tenantId, options
                    ? { startDate: options.fromDate, endDate: options.toDate }
                    : undefined);
                break;
            case 'balance_sheet':
                data = await this.getBalanceSheet(tenantId, options
                    ? { asOfDate: options.toDate ?? options.fromDate }
                    : undefined);
                break;
            case 'transactions':
                data = await this.getTransactionHistory(tenantId, options);
                break;
            default:
                throw new Error(`Unsupported export type: ${dataType}`);
        }
        if (format === 'csv') {
            return this.convertToCSV(data);
        }
        return data;
    }
    convertToCSV(data) {
        if (!data || data.length === 0) {
            return '';
        }
        const headers = Object.keys(data[0]);
        const csvRows = data.map((row) => headers.map((header) => `"${row[header] || ''}"`).join(','));
        return [headers.join(','), ...csvRows].join('\n');
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        accounts_service_1.UniversalAccountsService,
        transactions_service_1.UniversalTransactionsService])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map