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
exports.SuppliesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const transactions_service_1 = require("../universal-truth/transactions.service");
const accounts_service_1 = require("../universal-truth/accounts.service");
let SuppliesService = class SuppliesService {
    prisma;
    transactionsService;
    accountsService;
    constructor(prisma, transactionsService, accountsService) {
        this.prisma = prisma;
        this.transactionsService = transactionsService;
        this.accountsService = accountsService;
    }
    async createSupply(tenantId, userId, createSupplyDto) {
        const totalValue = createSupplyDto.quantity * createSupplyDto.unitPrice;
        const inventoryAccount = createSupplyDto.accountId
            ? await this.accountsService.getAccount(createSupplyDto.accountId, tenantId)
            : await this.getDefaultInventoryAccount(tenantId);
        const purchasesAccount = await this.getDefaultPurchasesAccount(tenantId);
        if (!inventoryAccount || !purchasesAccount) {
            throw new Error('Required accounts not available for supply transaction');
        }
        const transactionId = await this.transactionsService.createDoubleEntryTransaction({
            tenantId,
            fromAccountId: purchasesAccount.id,
            toAccountId: inventoryAccount.id,
            amount: totalValue,
            reasonId: 'SUPPLY_PURCHASE',
            entityId: createSupplyDto.supplierId,
            notes: `Supply purchase: ${createSupplyDto.name} (${createSupplyDto.quantity} ${createSupplyDto.unit} @ ${createSupplyDto.unitPrice})`,
            reference: `SUPPLY-${Date.now()}`,
            createdById: userId,
        });
        const supply = await this.prisma.note.create({
            data: {
                tenantId,
                content: createSupplyDto.description || `Supply: ${createSupplyDto.name}`,
                aboutType: 'SUPPLY',
                context: {
                    name: createSupplyDto.name,
                    description: createSupplyDto.description,
                    quantity: createSupplyDto.quantity,
                    unitPrice: createSupplyDto.unitPrice,
                    totalValue,
                    unit: createSupplyDto.unit,
                    supplierId: createSupplyDto.supplierId,
                    category: createSupplyDto.category,
                    accountId: createSupplyDto.accountId,
                    status: 'RECEIVED',
                    transactionId,
                },
            },
        });
        return this.mapNoteToSupply(supply);
    }
    async findAllSupplies(tenantId) {
        const supplies = await this.prisma.note.findMany({
            where: {
                tenantId,
                aboutType: 'SUPPLY',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return supplies.map((supply) => this.mapNoteToSupply(supply));
    }
    async findOneSupply(tenantId, id) {
        const supply = await this.prisma.note.findFirst({
            where: {
                tenantId,
                id,
                aboutType: 'SUPPLY',
            },
        });
        if (!supply) {
            throw new Error('Supply not found');
        }
        return this.mapNoteToSupply(supply);
    }
    async updateSupplyStatus(tenantId, id, status) {
        const supply = await this.prisma.note.update({
            where: {
                tenantId,
                id,
                aboutType: 'SUPPLY',
            },
            data: {
                context: {
                    status,
                },
            },
        });
        return this.mapNoteToSupply(supply);
    }
    async deleteSupply(tenantId, id) {
        const supply = await this.findOneSupply(tenantId, id);
        if (supply.transactionId) {
            await this.transactionsService.reverseTransaction(supply.transactionId, 'Supply cancelled/removed');
        }
        await this.prisma.note.delete({
            where: {
                tenantId,
                id,
                aboutType: 'SUPPLY',
            },
        });
    }
    async getDefaultInventoryAccount(tenantId) {
        let inventoryAccount = await this.prisma.account.findFirst({
            where: {
                tenantId,
                type: 'INVENTORY',
                isActive: true,
            },
        });
        if (!inventoryAccount) {
            const newInventoryAccountId = await this.accountsService.createAccount({
                tenantId,
                name: 'Inventory',
                type: 'INVENTORY',
                currency: 'KES',
                metadata: { isDefault: true },
            });
            inventoryAccount = await this.prisma.account.findUnique({
                where: { id: newInventoryAccountId },
            });
        }
        return inventoryAccount;
    }
    async getDefaultPurchasesAccount(tenantId) {
        let purchasesAccount = await this.prisma.account.findFirst({
            where: {
                tenantId,
                type: 'PURCHASES',
                isActive: true,
            },
        });
        if (!purchasesAccount) {
            const newPurchasesAccountId = await this.accountsService.createAccount({
                tenantId,
                name: 'Purchases',
                type: 'PURCHASES',
                currency: 'KES',
                metadata: { isDefault: true },
            });
            purchasesAccount = await this.prisma.account.findUnique({
                where: { id: newPurchasesAccountId },
            });
        }
        return purchasesAccount;
    }
    mapNoteToSupply(note) {
        const context = note.context || {};
        return {
            id: note.id,
            name: context.name || 'Unnamed Supply',
            description: note.content || context.description,
            quantity: context.quantity || 0,
            unitPrice: context.unitPrice || 0,
            totalValue: context.totalValue || 0,
            unit: context.unit || 'PCS',
            supplierId: context.supplierId,
            category: context.category,
            accountId: context.accountId,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            status: context.status || 'PENDING',
            transactionId: context.transactionId,
        };
    }
};
exports.SuppliesService = SuppliesService;
exports.SuppliesService = SuppliesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transactions_service_1.UniversalTransactionsService,
        accounts_service_1.UniversalAccountsService])
], SuppliesService);
//# sourceMappingURL=supplies.service.js.map