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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AccountsService = class AccountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, userId, createAccountDto) {
        const existing = await this.prisma.item.findFirst({
            where: {
                tenantId,
                name: createAccountDto.name,
                itemType: 'ACCOUNT',
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Account with name '${createAccountDto.name}' already exists`);
        }
        const item = await this.prisma.item.create({
            data: {
                tenantId,
                name: createAccountDto.name,
                sku: `ACC_${createAccountDto.type.toUpperCase()}_${Date.now()}`,
                itemType: 'ACCOUNT',
                quantity: createAccountDto.balance || 0,
                defaultPrice: 0,
                tags: '',
                metadata: {
                    accountType: createAccountDto.type,
                    currency: createAccountDto.currency || 'KES',
                    balance: createAccountDto.balance || 0,
                    ...createAccountDto.metadata,
                },
            },
        });
        return this.mapItemToAccountDto(item);
    }
    async findAll(tenantId) {
        const items = await this.prisma.item.findMany({
            where: {
                tenantId,
                itemType: 'ACCOUNT',
                isActive: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return items.map((item) => this.mapItemToAccountDto(item));
    }
    async findOne(tenantId, id) {
        const item = await this.prisma.item.findFirst({
            where: {
                id,
                tenantId,
                itemType: 'ACCOUNT',
            },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Account with ID ${id} not found`);
        }
        return this.mapItemToAccountDto(item);
    }
    async findByType(tenantId, type) {
        const items = await this.prisma.item.findMany({
            where: {
                tenantId,
                itemType: 'ACCOUNT',
                isActive: true,
                metadata: {
                    path: ['accountType'],
                    equals: type,
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
        return items.map((item) => this.mapItemToAccountDto(item));
    }
    async update(tenantId, id, updateAccountDto) {
        const existing = await this.prisma.item.findFirst({
            where: {
                id,
                tenantId,
                itemType: 'ACCOUNT',
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Account with ID ${id} not found`);
        }
        if (updateAccountDto.name && updateAccountDto.name !== existing.name) {
            const duplicate = await this.prisma.item.findFirst({
                where: {
                    tenantId,
                    name: updateAccountDto.name,
                    itemType: 'ACCOUNT',
                    id: { not: id },
                },
            });
            if (duplicate) {
                throw new common_1.ConflictException(`Account with name '${updateAccountDto.name}' already exists`);
            }
        }
        const updateData = {};
        if (updateAccountDto.name)
            updateData.name = updateAccountDto.name;
        if (updateAccountDto.balance !== undefined) {
            updateData.quantity = updateAccountDto.balance;
            updateData.metadata = {
                ...existing.metadata,
                balance: updateAccountDto.balance,
            };
        }
        if (updateAccountDto.metadata) {
            updateData.metadata = {
                ...existing.metadata,
                ...updateAccountDto.metadata,
            };
        }
        const item = await this.prisma.item.update({
            where: { id },
            data: updateData,
        });
        return this.mapItemToAccountDto(item);
    }
    async remove(tenantId, id) {
        const item = await this.prisma.item.findFirst({
            where: {
                id,
                tenantId,
                itemType: 'ACCOUNT',
            },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Account with ID ${id} not found`);
        }
        const hasTransactions = await this.prisma.transactionLine.findFirst({
            where: {
                accountCode: item.sku,
            },
        });
        if (hasTransactions) {
            throw new common_1.BadRequestException('Cannot delete account with existing transactions');
        }
        await this.prisma.item.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async getBalance(tenantId, id) {
        const item = await this.prisma.item.findFirst({
            where: {
                id,
                tenantId,
                itemType: 'ACCOUNT',
            },
            select: {
                metadata: true,
            },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Account with ID ${id} not found`);
        }
        const metadata = item.metadata;
        const balance = metadata?.balance || 0;
        return { balance: Number(balance) };
    }
    async getTrialBalance(tenantId) {
        const items = await this.prisma.item.findMany({
            where: {
                tenantId,
                itemType: 'ACCOUNT',
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                metadata: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        const trialBalance = items.reduce((acc, item) => {
            const metadata = item.metadata;
            const accountType = metadata?.accountType || 'UNKNOWN';
            const balance = Number(metadata?.balance || 0);
            if (!acc[accountType]) {
                acc[accountType] = {
                    accountType,
                    accounts: [],
                    totalDebit: 0,
                    totalCredit: 0,
                };
            }
            const debitTypes = ['CASH', 'BANK', 'INVENTORY', 'ASSET'];
            const isDebit = debitTypes.includes(accountType) || balance < 0;
            const accountEntry = {
                id: item.id,
                name: item.name,
                balance: Math.abs(balance),
                isDebitBalance: isDebit,
            };
            acc[accountType].accounts.push(accountEntry);
            if (isDebit) {
                acc[accountType].totalDebit += Math.abs(balance);
            }
            else {
                acc[accountType].totalCredit += balance;
            }
            return acc;
        }, {});
        return Object.values(trialBalance);
    }
    mapItemToAccountDto(item) {
        const metadata = item.metadata || {};
        return {
            id: item.id,
            tenantId: item.tenantId,
            name: item.name,
            type: metadata.accountType || 'UNKNOWN',
            balance: Number(metadata.balance || 0),
            currency: metadata.currency || 'KES',
            metadata: metadata,
            isActive: item.isActive,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map