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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const universal_invoice_interface_1 = require("./interfaces/universal-invoice.interface");
const client_1 = require("@prisma/client");
let TransactionsService = class TransactionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const transaction = await this.prisma.$transaction(async (tx) => {
            const totalAmount = dto.lines.reduce((sum, line) => {
                return sum + (line.quantity * line.unit_price);
            }, 0);
            const txn = await tx.transaction.create({
                data: {
                    tenantId: dto.tenant_id,
                    entityId: dto.entity_id || null,
                    createdByUserId: dto.created_by_user_id,
                    type: dto.type,
                    currencyCode: dto.currency_code,
                    totalAmount: totalAmount,
                    status: client_1.TxnStatus.DRAFT,
                    paymentStatus: client_1.PaymentStatus.PENDING,
                    reference: dto.reference || null,
                    metadata: {
                        context: dto.context,
                        tags: dto.tags,
                    },
                    lines: {
                        create: dto.lines.map((line, index) => ({
                            description: line.description,
                            sku: line.sku || null,
                            quantity: line.quantity,
                            unitPrice: line.unit_price,
                            totalLineAmount: line.quantity * line.unit_price,
                            accountCode: line.account_code || '200-SALES',
                            metadata: (line.metadata || {}),
                        })),
                    },
                },
                include: {
                    lines: true,
                    entity: true,
                },
            });
            return txn;
        });
        return transaction;
    }
    async findAll(tenantId, filters) {
        const where = {
            tenantId,
        };
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.entity_id) {
            where.entityId = filters.entity_id;
        }
        if (filters?.payment_status) {
            where.paymentStatus = filters.payment_status;
        }
        if (filters?.date_from || filters?.date_to) {
            where.createdAt = {};
            if (filters.date_from) {
                where.createdAt.gte = new Date(filters.date_from);
            }
            if (filters.date_to) {
                where.createdAt.lte = new Date(filters.date_to);
            }
        }
        if (filters?.search) {
            where.OR = [
                { reference: { contains: filters.search, mode: 'insensitive' } },
                { entity: { displayName: { contains: filters.search, mode: 'insensitive' } } },
            ];
        }
        const transactions = await this.prisma.transaction.findMany({
            where,
            include: {
                entity: {
                    select: {
                        displayName: true,
                        phoneNumber: true,
                    },
                },
                lines: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return transactions;
    }
    async findOne(id) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: {
                entity: true,
                lines: true,
                paymentApplications: {
                    include: {
                        payment: true,
                    },
                },
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
        }
        return transaction;
    }
    async findByEntity(entityId) {
        const transactions = await this.prisma.transaction.findMany({
            where: { entityId },
            include: {
                lines: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return transactions;
    }
    async postTransaction(id, dto) {
        const transaction = await this.prisma.transaction.update({
            where: { id },
            data: {
                status: client_1.TxnStatus.POSTED,
            },
            include: {
                lines: true,
                entity: true,
            },
        });
        return transaction;
    }
    async reverseTransaction(id, dto) {
        const result = await this.prisma.$transaction(async (tx) => {
            const original = await tx.transaction.findUnique({
                where: { id },
                include: { lines: true },
            });
            if (!original) {
                throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
            }
            if (original.status !== client_1.TxnStatus.POSTED) {
                throw new common_1.BadRequestException('Only POSTED transactions can be reversed');
            }
            const reversal = await tx.transaction.create({
                data: {
                    tenantId: original.tenantId,
                    entityId: original.entityId,
                    createdByUserId: dto.created_by_user_id,
                    type: original.type,
                    currencyCode: original.currencyCode,
                    totalAmount: -original.totalAmount,
                    status: client_1.TxnStatus.REVERSED,
                    paymentStatus: original.paymentStatus,
                    reference: `REV-${original.reference || id}`,
                    reversedTransactionId: original.id,
                    metadata: {
                        reversal_reason: dto.reason,
                        original_reference: original.reference,
                    },
                    lines: {
                        create: original.lines.map((line) => ({
                            description: `REVERSAL: ${line.description}`,
                            sku: line.sku,
                            quantity: -line.quantity,
                            unitPrice: line.unitPrice,
                            totalLineAmount: -line.totalLineAmount,
                            accountCode: line.accountCode,
                            metadata: line.metadata,
                        })),
                    },
                },
                include: {
                    lines: true,
                },
            });
            return reversal;
        });
        return result;
    }
    async updatePaymentStatus(id, dto) {
        const transaction = await this.prisma.transaction.update({
            where: { id },
            data: {
                paymentStatus: dto.status,
            },
            include: {
                lines: true,
                entity: true,
            },
        });
        return transaction;
    }
    async getEntityHistory(entityId, tenantId) {
        const entity = await this.prisma.entity.findFirst({
            where: {
                id: entityId,
                tenantId,
            },
        });
        if (!entity) {
            throw new common_1.NotFoundException(`Entity with ID ${entityId} not found`);
        }
        const transactions = await this.prisma.transaction.findMany({
            where: {
                entityId,
                tenantId,
                status: { in: [client_1.TxnStatus.POSTED, client_1.TxnStatus.REVERSED] },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        let runningBalance = 0;
        const history = transactions.map((txn) => {
            const amount = Number(txn.totalAmount);
            runningBalance += amount;
            return {
                transaction_id: txn.id,
                transaction_date: txn.createdAt.toISOString(),
                type: txn.type,
                status: txn.status,
                payment_status: txn.paymentStatus,
                total_amount: amount,
                currency_code: txn.currencyCode,
                reference: txn.reference || '',
                running_balance: runningBalance,
            };
        });
        return {
            entity,
            transactions: history,
            total_balance: runningBalance,
        };
    }
    async standardizeTransaction(id) {
        const transaction = await this.findOne(id);
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
        }
        const entityName = transaction.entity?.displayName || 'Unknown';
        const defaultAccountCode = (0, universal_invoice_interface_1.getAccountCode)(transaction.type);
        const lineItems = transaction.lines?.map((line) => ({
            description: line.description,
            quantity: Number(line.quantity),
            unit_price: Number(line.unitPrice),
            account_code: line.accountCode || defaultAccountCode,
            sku: line.sku,
            line_total: Number(line.totalLineAmount),
        })) || [];
        const universalInvoice = {
            invoice_id: transaction.id,
            customer_name: entityName,
            customer_id: transaction.entityId,
            invoice_date: transaction.createdAt.toISOString(),
            currency: transaction.currencyCode,
            total_amount: Number(transaction.totalAmount),
            line_items: lineItems,
            tax_amount: 0,
            status: transaction.status,
            payment_status: transaction.paymentStatus,
            reference: transaction.reference || undefined,
            type: transaction.type,
            reversed_transaction_id: transaction.reversedTransactionId || undefined,
            metadata: transaction.metadata,
            created_at: transaction.createdAt.toISOString(),
        };
        return universalInvoice;
    }
    async searchTransactions(tenantId, searchTerm, filters) {
        const lineMatches = await this.prisma.transactionLine.findMany({
            where: {
                OR: [
                    { description: { contains: searchTerm, mode: 'insensitive' } },
                    { sku: { contains: searchTerm, mode: 'insensitive' } },
                ],
            },
            select: {
                transactionId: true,
            },
        });
        const transactionIdsFromLines = [...new Set(lineMatches.map(l => l.transactionId))];
        const where = {
            tenantId,
            OR: [
                { reference: { contains: searchTerm, mode: 'insensitive' } },
                { entity: { displayName: { contains: searchTerm, mode: 'insensitive' } } },
                { id: { in: transactionIdsFromLines } },
            ],
        };
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.entity_id) {
            where.entityId = filters.entity_id;
        }
        if (filters?.date_from || filters?.date_to) {
            where.createdAt = {};
            if (filters.date_from) {
                where.createdAt.gte = new Date(filters.date_from);
            }
            if (filters.date_to) {
                where.createdAt.lte = new Date(filters.date_to);
            }
        }
        const transactions = await this.prisma.transaction.findMany({
            where,
            include: {
                entity: {
                    select: {
                        displayName: true,
                        phoneNumber: true,
                    },
                },
                lines: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return transactions;
    }
    async findAllEntities(tenantId, filters) {
        const where = {
            tenantId,
        };
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.search) {
            where.OR = [
                { displayName: { contains: filters.search, mode: 'insensitive' } },
                { phoneNumber: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const entities = await this.prisma.entity.findMany({
            where,
            orderBy: {
                displayName: 'asc',
            },
        });
        return entities;
    }
    async createEntity(dto) {
        const entity = await this.prisma.entity.create({
            data: {
                tenantId: dto.tenant_id,
                type: dto.type,
                displayName: dto.display_name,
                phoneNumber: dto.phone_number || null,
                metadata: (dto.metadata || {}),
                createdByUserId: dto.created_by_user_id,
            },
        });
        return entity;
    }
    async findEntityById(id) {
        const entity = await this.prisma.entity.findUnique({
            where: { id },
        });
        if (!entity) {
            throw new common_1.NotFoundException(`Entity with ID ${id} not found`);
        }
        return entity;
    }
    async getEntityBalance(entityId, tenantId) {
        const entity = await this.findEntityById(entityId);
        if (entity.tenantId !== tenantId) {
            throw new common_1.NotFoundException(`Entity with ID ${entityId} not found`);
        }
        const transactions = await this.prisma.transaction.findMany({
            where: {
                entityId,
                status: client_1.TxnStatus.POSTED,
            },
            select: {
                totalAmount: true,
            },
        });
        const totalCredit = transactions
            .filter(t => Number(t.totalAmount) > 0)
            .reduce((sum, t) => sum + Number(t.totalAmount), 0);
        const totalDebit = transactions
            .filter(t => Number(t.totalAmount) < 0)
            .reduce((sum, t) => sum + Number(t.totalAmount), 0);
        const netBalance = totalCredit + totalDebit;
        const transactionCount = await this.prisma.transaction.count({
            where: {
                entityId,
                status: client_1.TxnStatus.POSTED,
            },
        });
        return {
            entity,
            balance: {
                total_credit: totalCredit,
                total_debit: Math.abs(totalDebit),
                net_balance: netBalance,
                transaction_count: transactionCount,
            },
        };
    }
    async getEntity360View(entityId, tenantId) {
        const { entity, balance } = await this.getEntityBalance(entityId, tenantId);
        const recentTransactions = await this.prisma.transaction.findMany({
            where: {
                entityId,
                status: client_1.TxnStatus.POSTED,
            },
            include: {
                lines: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });
        let attachments = [];
        try {
            attachments = await this.prisma.$queryRaw `
        SELECT * FROM attachments WHERE entity_id = ${entityId} ORDER BY uploaded_at DESC
      `;
        }
        catch (e) {
            attachments = [];
        }
        return {
            entity,
            balance,
            recent_transactions: recentTransactions,
            attachments,
        };
    }
    async searchEntitiesByPhone(phone, tenantId) {
        const entities = await this.prisma.entity.findMany({
            where: {
                tenantId,
                phoneNumber: {
                    contains: phone,
                },
            },
        });
        return entities;
    }
    async addLinkedPhone(entityId, phone) {
        const entity = await this.prisma.entity.findUnique({
            where: { id: entityId },
        });
        if (!entity) {
            throw new common_1.NotFoundException(`Entity with ID ${entityId} not found`);
        }
        const metadata = entity.metadata || {};
        const currentPhones = metadata.linked_phones || [];
        if (currentPhones.includes(phone)) {
            throw new common_1.BadRequestException('Phone number already linked to this entity');
        }
        const updatedEntity = await this.prisma.entity.update({
            where: { id: entityId },
            data: {
                metadata: {
                    ...metadata,
                    linked_phones: [...currentPhones, phone],
                },
            },
        });
        return updatedEntity;
    }
    async removeLinkedPhone(entityId, phone) {
        const entity = await this.prisma.entity.findUnique({
            where: { id: entityId },
        });
        if (!entity) {
            throw new common_1.NotFoundException(`Entity with ID ${entityId} not found`);
        }
        const metadata = entity.metadata || {};
        const currentPhones = metadata.linked_phones || [];
        const updatedPhones = currentPhones.filter((p) => p !== phone);
        const updatedEntity = await this.prisma.entity.update({
            where: { id: entityId },
            data: {
                metadata: {
                    ...metadata,
                    linked_phones: updatedPhones,
                },
            },
        });
        return updatedEntity;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map