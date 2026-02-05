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
exports.UniversalAccountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UniversalAccountsService = class UniversalAccountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAccount(data) {
        if (!data.tenantId || !data.name || !data.type) {
            throw new common_1.BadRequestException('Tenant ID, name, and type are required');
        }
        const existingAccount = await this.prisma.account.findFirst({
            where: {
                tenantId: data.tenantId,
                name: { equals: data.name, mode: 'insensitive' },
            },
        });
        if (existingAccount) {
            throw new common_1.BadRequestException(`Account '${data.name}' already exists for this tenant`);
        }
        const result = await this.prisma.$queryRaw `
      SELECT * FROM create_account(
        ${data.tenantId}::uuid,
        ${data.name}::varchar,
        ${data.type}::varchar,
        ${data.currency || 'KES'}::varchar,
        ${data.createdById || null}::uuid
      )
    `;
        const accountData = result[0];
        if (accountData?.p_error_message) {
            throw new common_1.BadRequestException(accountData.p_error_message);
        }
        return accountData?.p_account_id;
    }
    async getBalances(tenantId, groupBy) {
        const result = await this.prisma.$queryRaw `
      SELECT * FROM get_tenant_balances(
        ${tenantId}::uuid,
        ${groupBy || null}::varchar
      )
    `;
        return result;
    }
    async getAccount(accountId, tenantId) {
        const account = await this.prisma.account.findFirst({
            where: {
                id: accountId,
                tenantId,
                isActive: true,
            },
        });
        if (!account) {
            throw new common_1.NotFoundException(`Account ${accountId} not found`);
        }
        return {
            id: account.id,
            name: account.name,
            type: account.type,
            balance: Number(account.balance),
            currency: account.currency,
        };
    }
    async listAccounts(tenantId) {
        const accounts = await this.prisma.account.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
        });
        return accounts.map((account) => ({
            id: account.id,
            name: account.name,
            type: account.type,
            balance: Number(account.balance),
            currency: account.currency,
        }));
    }
};
exports.UniversalAccountsService = UniversalAccountsService;
exports.UniversalAccountsService = UniversalAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UniversalAccountsService);
//# sourceMappingURL=accounts.service.js.map