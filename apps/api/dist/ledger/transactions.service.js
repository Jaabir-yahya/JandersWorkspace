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
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const accounts_service_1 = require("./accounts.service");
let TransactionsService = class TransactionsService {
    prisma;
    accountsService;
    constructor(prisma, accountsService) {
        this.prisma = prisma;
        this.accountsService = accountsService;
    }
    async createDoubleEntry(tenantId, userId, createDoubleEntryDto) {
        return await this.prisma.$transaction(async (tx) => {
            const debitAccount = await this.findOrCreateAccount(tenantId, createDoubleEntryDto.debitAccountType, tx);
            const creditAccount = await this.findOrCreateAccount(tenantId, createDoubleEntryDto.creditAccountType, tx);
            const transactionPairId = `PAIR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const transactionDate = createDoubleEntryDto.date
                ? new Date(createDoubleEntryDto.date)
                : new Date();
            const debitTransaction = await tx.transaction.create({
                data: {
                    tenantId,
                    entityId: createDoubleEntryDto.entityId ?? undefined,
                    amount: createDoubleEntryDto.amount,
                    notes: createDoubleEntryDto.notes ?? 'Debit entry',
                    type: client_1.TxnType.EXPENSE,
                    status: client_1.TxnStatus.POSTED,
                    paymentStatus: client_1.PaymentStatus.SETTLED,
                    reference: createDoubleEntryDto.reference ?? undefined,
                    date: transactionDate,
                    createdByUserId: userId,
                    metadata: {
                        transactionPairId,
                        entryType: 'DEBIT',
                        linkedEntityType: createDoubleEntryDto.linkedEntityType,
                        linkedEntityId: createDoubleEntryDto.linkedEntityId,
                        containerId: createDoubleEntryDto.containerId,
                        balanceBefore: debitAccount.metadata?.balance || 0,
                        balanceAfter: Number(debitAccount.metadata?.balance ||
                            0) + createDoubleEntryDto.amount,
                    },
                    lines: {
                        create: {
                            description: `Debit: ${createDoubleEntryDto.debitAccountType}`,
                            quantity: 1,
                            unitPrice: createDoubleEntryDto.amount,
                            lineTotal: createDoubleEntryDto.amount,
                            totalLineAmount: createDoubleEntryDto.amount,
                            accountCode: debitAccount.sku,
                            metadata: {
                                entryType: 'DEBIT',
                                transactionPairId,
                            },
                        },
                    },
                },
            });
            const creditTransaction = await tx.transaction.create({
                data: {
                    tenantId,
                    entityId: createDoubleEntryDto.entityId ?? undefined,
                    amount: createDoubleEntryDto.amount,
                    notes: createDoubleEntryDto.notes ?? 'Credit entry',
                    type: client_1.TxnType.RETAIL,
                    status: client_1.TxnStatus.POSTED,
                    paymentStatus: client_1.PaymentStatus.SETTLED,
                    reference: createDoubleEntryDto.reference ?? undefined,
                    date: transactionDate,
                    createdByUserId: userId,
                    metadata: {
                        transactionPairId,
                        entryType: 'CREDIT',
                        linkedEntityType: createDoubleEntryDto.linkedEntityType,
                        linkedEntityId: createDoubleEntryDto.linkedEntityId,
                        containerId: createDoubleEntryDto.containerId,
                        balanceBefore: creditAccount.metadata?.balance || 0,
                        balanceAfter: Number(creditAccount.metadata?.balance ||
                            0) - createDoubleEntryDto.amount,
                    },
                    lines: {
                        create: {
                            description: `Credit: ${createDoubleEntryDto.creditAccountType}`,
                            quantity: 1,
                            unitPrice: createDoubleEntryDto.amount,
                            lineTotal: createDoubleEntryDto.amount,
                            totalLineAmount: createDoubleEntryDto.amount,
                            accountCode: creditAccount.sku,
                            metadata: {
                                entryType: 'CREDIT',
                                transactionPairId,
                            },
                        },
                    },
                },
            });
            const newDebitBalance = (debitAccount.metadata?.balance || 0) + createDoubleEntryDto.amount;
            const newCreditBalance = (creditAccount.metadata?.balance || 0) - createDoubleEntryDto.amount;
            await tx.item.update({
                where: { id: debitAccount.id },
                data: {
                    quantity: newDebitBalance,
                    metadata: {
                        ...debitAccount.metadata,
                        balance: newDebitBalance,
                    },
                },
            });
            await tx.item.update({
                where: { id: creditAccount.id },
                data: {
                    quantity: newCreditBalance,
                    metadata: {
                        ...creditAccount.metadata,
                        balance: newCreditBalance,
                    },
                },
            });
            await this.logAuditEvent(tx, tenantId, userId, 'CREATE', 'TRANSACTION', debitTransaction.id, null, debitTransaction);
            return {
                debitTransaction: await this.mapToDto(debitTransaction),
                creditTransaction: await this.mapToDto(creditTransaction),
                transactionPairId,
            };
        });
    }
    async reverseDoubleEntry(tenantId, userId, transactionPairId) {
        return await this.prisma.$transaction(async (tx) => {
            const originalTransactions = await tx.transaction.findMany({
                where: {
                    tenantId,
                },
            });
            const filteredTransactions = originalTransactions.filter((t) => {
                const meta = t.metadata;
                return meta?.transactionPairId === transactionPairId;
            });
            if (filteredTransactions.length !== 2) {
                throw new common_1.NotFoundException('Original transaction pair not found');
            }
            const debitTransaction = filteredTransactions.find((t) => t.metadata?.entryType === 'DEBIT');
            const creditTransaction = filteredTransactions.find((t) => t.metadata?.entryType === 'CREDIT');
            if (!debitTransaction || !creditTransaction) {
                throw new common_1.NotFoundException('Could not identify debit/credit transactions');
            }
            const reversalPairId = `REVERSAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const amount = Number(debitTransaction.amount);
            const debitLine = await tx.transactionLine.findFirst({
                where: { transactionId: debitTransaction.id },
            });
            const creditLine = await tx.transactionLine.findFirst({
                where: { transactionId: creditTransaction.id },
            });
            if (!debitLine || !creditLine) {
                throw new common_1.NotFoundException('Original transaction lines not found');
            }
            const debitAccount = await tx.item.findFirst({
                where: { sku: debitLine.accountCode || '', itemType: 'ACCOUNT' },
            });
            const creditAccount = await tx.item.findFirst({
                where: { sku: creditLine.accountCode || '', itemType: 'ACCOUNT' },
            });
            if (!debitAccount || !creditAccount) {
                throw new common_1.NotFoundException('Accounts not found');
            }
            const reversalDebitTransaction = await tx.transaction.create({
                data: {
                    tenantId,
                    entityId: debitTransaction.entityId ?? undefined,
                    amount: amount,
                    notes: `Reversal of ${debitTransaction.notes ?? 'debit'}`,
                    type: client_1.TxnType.RETAIL,
                    status: client_1.TxnStatus.POSTED,
                    paymentStatus: client_1.PaymentStatus.SETTLED,
                    reference: `REV_${debitTransaction.reference ?? ''}`,
                    date: new Date(),
                    createdByUserId: userId,
                    reversedTransactionId: debitTransaction.id,
                    metadata: {
                        transactionPairId: reversalPairId,
                        entryType: 'DEBIT',
                        originalTransactionPairId: transactionPairId,
                        balanceBefore: debitAccount.metadata?.balance || 0,
                        balanceAfter: Number(debitAccount.metadata?.balance ||
                            0) - amount,
                    },
                    lines: {
                        create: {
                            description: `Reversal Debit: ${creditAccount.name}`,
                            quantity: 1,
                            unitPrice: amount,
                            lineTotal: amount,
                            totalLineAmount: amount,
                            accountCode: creditAccount.sku,
                            metadata: {
                                entryType: 'DEBIT',
                                transactionPairId: reversalPairId,
                                reversal: true,
                            },
                        },
                    },
                },
            });
            const reversalCreditTransaction = await tx.transaction.create({
                data: {
                    tenantId,
                    entityId: creditTransaction.entityId ?? undefined,
                    amount: amount,
                    notes: `Reversal of ${creditTransaction.notes ?? 'credit'}`,
                    type: client_1.TxnType.EXPENSE,
                    status: client_1.TxnStatus.POSTED,
                    paymentStatus: client_1.PaymentStatus.SETTLED,
                    reference: `REV_${creditTransaction.reference ?? ''}`,
                    date: new Date(),
                    createdByUserId: userId,
                    reversedTransactionId: creditTransaction.id,
                    metadata: {
                        transactionPairId: reversalPairId,
                        entryType: 'CREDIT',
                        originalTransactionPairId: transactionPairId,
                        balanceBefore: creditAccount.metadata?.balance || 0,
                        balanceAfter: Number(creditAccount.metadata?.balance ||
                            0) + amount,
                    },
                    lines: {
                        create: {
                            description: `Reversal Credit: ${debitAccount.name}`,
                            quantity: 1,
                            unitPrice: amount,
                            lineTotal: amount,
                            totalLineAmount: amount,
                            accountCode: debitAccount.sku,
                            metadata: {
                                entryType: 'CREDIT',
                                transactionPairId: reversalPairId,
                                reversal: true,
                            },
                        },
                    },
                },
            });
            const newDebitBalance = (debitAccount.metadata?.balance || 0) - amount;
            const newCreditBalance = (creditAccount.metadata?.balance || 0) + amount;
            await tx.item.update({
                where: { id: debitAccount.id },
                data: {
                    quantity: newDebitBalance,
                    metadata: {
                        ...debitAccount.metadata,
                        balance: newDebitBalance,
                    },
                },
            });
            await tx.item.update({
                where: { id: creditAccount.id },
                data: {
                    quantity: newCreditBalance,
                    metadata: {
                        ...creditAccount.metadata,
                        balance: newCreditBalance,
                    },
                },
            });
            return {
                reversalDebitTransaction: await this.mapToDto(reversalDebitTransaction),
                reversalCreditTransaction: await this.mapToDto(reversalCreditTransaction),
            };
        });
    }
    async findMany(tenantId, filters) {
        const where = { tenantId };
        if (filters?.dateFrom || filters?.dateTo) {
            where.date = {};
            if (filters.dateFrom)
                where.date.gte = new Date(filters.dateFrom);
            if (filters.dateTo)
                where.date.lte = new Date(filters.dateTo);
        }
        if (filters?.entityName) {
            where.entity = {
                name: { contains: filters.entityName, mode: 'insensitive' },
            };
        }
        const transactions = await this.prisma.transaction.findMany({
            where,
            include: {
                lines: true,
            },
            orderBy: {
                date: 'desc',
            },
        });
        return Promise.all(transactions.map((transaction) => this.mapToDto(transaction)));
    }
    async findOne(tenantId, id) {
        const transaction = await this.prisma.transaction.findFirst({
            where: {
                id,
                tenantId,
            },
            include: {
                lines: true,
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
        }
        return this.mapToDto(transaction);
    }
    async getTransactionHistory(tenantId, filters) {
        const transactions = await this.findMany(tenantId, filters);
        const transactionPairs = {};
        transactions.forEach((transaction) => {
            const pairId = transaction.metadata?.transactionPairId;
            if (pairId) {
                if (!transactionPairs[pairId]) {
                    transactionPairs[pairId] = [];
                }
                transactionPairs[pairId].push(transaction);
            }
        });
        return Object.values(transactionPairs).map((pair) => ({
            transactionPairId: pair[0]?.metadata?.transactionPairId,
            transactions: pair,
            date: pair[0]?.date,
            totalAmount: pair[0]?.amount,
            isReversal: pair[0]?.metadata?.reversal || false,
        }));
    }
    async findOrCreateAccount(tenantId, accountType, tx) {
        let account = await tx.item.findFirst({
            where: {
                tenantId,
                itemType: 'ACCOUNT',
            },
        });
        const accounts = await tx.item.findMany({
            where: {
                tenantId,
                itemType: 'ACCOUNT',
            },
        });
        account = accounts.find((item) => item.metadata?.accountType === accountType);
        if (!account) {
            account = await tx.item.create({
                data: {
                    tenantId,
                    name: `${accountType} Account`,
                    sku: `ACC_${accountType.toUpperCase()}_${Date.now()}`,
                    itemType: 'ACCOUNT',
                    quantity: 0,
                    metadata: {
                        accountType,
                        currency: 'KES',
                        balance: 0,
                    },
                },
            });
        }
        return account;
    }
    async logAuditEvent(tx, tenantId, userId, action, tableName, recordId, oldData, newData) {
        await tx.note.create({
            data: {
                tenantId,
                content: `${action} ${tableName} ${recordId}`,
                aboutType: 'AUDIT',
                aboutId: recordId,
                context: {
                    action,
                    tableName,
                    userId,
                    oldData,
                    newData,
                },
            },
        });
    }
    async mapToDto(transaction) {
        const meta = (transaction.metadata || {});
        return {
            id: transaction.id,
            tenantId: transaction.tenantId,
            fromAccountId: meta?.entryType === 'DEBIT' ? 'DEBIT_ACCOUNT' : 'CREDIT_ACCOUNT',
            toAccountId: meta?.entryType === 'CREDIT' ? 'CREDIT_ACCOUNT' : 'DEBIT_ACCOUNT',
            amount: Number(transaction.amount),
            date: transaction.date,
            notes: transaction.notes ?? '',
            reference: transaction.reference,
            metadata: meta,
            reversalId: transaction.reversedTransactionId,
            createdByUserId: transaction.createdByUserId,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        };
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        accounts_service_1.AccountsService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map