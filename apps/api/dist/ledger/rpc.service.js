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
exports.RpcService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let RpcService = class RpcService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createDoubleEntryTransaction(tenantId, userId, debitAccountType, creditAccountType, amount, description, linkedEntityType, linkedEntityId, reference, transactionDate) {
        return await this.prisma.$transaction(async (tx) => {
            const transactionPairId = `PAIR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const date = transactionDate || new Date();
            const debitAccount = await this.findOrCreateAccount(tx, tenantId, debitAccountType);
            const creditAccount = await this.findOrCreateAccount(tx, tenantId, creditAccountType);
            const debitBalanceBefore = debitAccount.metadata?.balance || 0;
            const creditBalanceBefore = creditAccount.metadata?.balance || 0;
            const debitBalanceAfter = debitBalanceBefore + amount;
            const creditBalanceAfter = creditBalanceBefore - amount;
            const debitTransaction = await tx.transaction.create({
                data: {
                    tenantId,
                    amount,
                    notes: `Debit: ${debitAccountType} - ${description}`,
                    type: client_1.TxnType.EXPENSE,
                    status: client_1.TxnStatus.POSTED,
                    paymentStatus: client_1.PaymentStatus.SETTLED,
                    reference,
                    date,
                    createdByUserId: userId,
                    metadata: {
                        transactionPairId,
                        entryType: 'DEBIT',
                        linkedEntityType,
                        linkedEntityId,
                        balanceBefore: debitBalanceBefore,
                        balanceAfter: debitBalanceAfter,
                        method: 'SYSTEM',
                    },
                    lines: {
                        create: {
                            description: `Debit: ${debitAccountType}`,
                            quantity: 1,
                            unitPrice: amount,
                            lineTotal: amount,
                            totalLineAmount: amount,
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
                    amount,
                    notes: `Credit: ${creditAccountType} - ${description}`,
                    type: client_1.TxnType.RETAIL,
                    status: client_1.TxnStatus.POSTED,
                    paymentStatus: client_1.PaymentStatus.SETTLED,
                    reference,
                    date,
                    createdByUserId: userId,
                    metadata: {
                        transactionPairId,
                        entryType: 'CREDIT',
                        linkedEntityType,
                        linkedEntityId,
                        balanceBefore: creditBalanceBefore,
                        balanceAfter: creditBalanceAfter,
                        method: 'SYSTEM',
                    },
                    lines: {
                        create: {
                            description: `Credit: ${creditAccountType}`,
                            quantity: 1,
                            unitPrice: amount,
                            lineTotal: amount,
                            totalLineAmount: amount,
                            accountCode: creditAccount.sku,
                            metadata: {
                                entryType: 'CREDIT',
                                transactionPairId,
                            },
                        },
                    },
                },
            });
            await this.updateAccountBalance(tx, debitAccount.id, debitBalanceAfter);
            await this.updateAccountBalance(tx, creditAccount.id, creditBalanceAfter);
            return {
                debitTransactionId: debitTransaction.id,
                creditTransactionId: creditTransaction.id,
                transactionPairId,
                debitBalanceBefore,
                debitBalanceAfter,
                creditBalanceBefore,
                creditBalanceAfter,
            };
        });
    }
    async reverseDoubleEntryTransaction(tenantId, userId, transactionPairId, reason) {
        return await this.prisma.$transaction(async (tx) => {
            const originalTransactions = await tx.transaction.findMany({
                where: { tenantId },
            });
            const filteredTransactions = originalTransactions.filter((t) => {
                const metadata = t.metadata;
                return metadata?.transactionPairId === transactionPairId;
            });
            if (filteredTransactions.length !== 2) {
                throw new Error('Original transaction pair not found');
            }
            const debitTransaction = filteredTransactions.find((t) => t.metadata?.entryType === 'DEBIT');
            const creditTransaction = filteredTransactions.find((t) => t.metadata?.entryType === 'CREDIT');
            if (!debitTransaction || !creditTransaction) {
                throw new Error('Could not identify debit/credit transactions');
            }
            const amount = Number(debitTransaction.amount);
            const reversalPairId = `REVERSAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const debitLine = await tx.transactionLine.findFirst({
                where: { transactionId: debitTransaction.id },
            });
            const creditLine = await tx.transactionLine.findFirst({
                where: { transactionId: creditTransaction.id },
            });
            if (!debitLine || !creditLine) {
                throw new Error('Original transaction lines not found');
            }
            const debitAccount = await tx.item.findFirst({
                where: { sku: debitLine.accountCode || '', itemType: 'ACCOUNT' },
            });
            const creditAccount = await tx.item.findFirst({
                where: { sku: creditLine.accountCode || '', itemType: 'ACCOUNT' },
            });
            if (!debitAccount || !creditAccount) {
                throw new Error('Accounts not found');
            }
            const debitBalanceBefore = debitAccount.metadata?.balance || 0;
            const creditBalanceBefore = creditAccount.metadata?.balance || 0;
            const debitBalanceAfter = debitBalanceBefore - amount;
            const creditBalanceAfter = creditBalanceBefore + amount;
            const reversalDebitTransaction = await tx.transaction.create({
                data: {
                    tenantId,
                    amount,
                    notes: `Reversal Credit: ${creditAccount.name} - ${reason || 'Transaction reversal'}`,
                    type: client_1.TxnType.RETAIL,
                    status: client_1.TxnStatus.POSTED,
                    paymentStatus: client_1.PaymentStatus.SETTLED,
                    reference: `REV_${debitTransaction.reference}`,
                    date: new Date(),
                    createdByUserId: userId,
                    reversedTransactionId: debitTransaction.id,
                    metadata: {
                        transactionPairId: reversalPairId,
                        entryType: 'DEBIT',
                        originalTransactionPairId: transactionPairId,
                        balanceBefore: debitBalanceBefore,
                        balanceAfter: debitBalanceAfter,
                        method: 'SYSTEM',
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
                    amount,
                    notes: `Reversal Debit: ${debitAccount.name} - ${reason || 'Transaction reversal'}`,
                    type: client_1.TxnType.EXPENSE,
                    status: client_1.TxnStatus.POSTED,
                    paymentStatus: client_1.PaymentStatus.SETTLED,
                    reference: `REV_${creditTransaction.reference}`,
                    date: new Date(),
                    createdByUserId: userId,
                    reversedTransactionId: creditTransaction.id,
                    metadata: {
                        transactionPairId: reversalPairId,
                        entryType: 'CREDIT',
                        originalTransactionPairId: transactionPairId,
                        balanceBefore: creditBalanceBefore,
                        balanceAfter: creditBalanceAfter,
                        method: 'SYSTEM',
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
            await this.updateAccountBalance(tx, debitAccount.id, debitBalanceAfter);
            await this.updateAccountBalance(tx, creditAccount.id, creditBalanceAfter);
            return {
                reversalDebitTransactionId: reversalDebitTransaction.id,
                reversalCreditTransactionId: reversalCreditTransaction.id,
                reversalTransactionPairId: reversalPairId,
            };
        });
    }
    async updateAccountBalance(tx, accountId, newBalance) {
        if (newBalance < 0 && Math.abs(newBalance) > 10000) {
            throw new Error(`Balance change too large: ${newBalance}`);
        }
        await tx.item.update({
            where: { id: accountId },
            data: {
                quantity: newBalance,
                metadata: {
                    balance: newBalance,
                    lastBalanceUpdate: new Date(),
                },
            },
        });
    }
    async getTrialBalance(tenantId) {
        const accountItems = await this.prisma.item.findMany({
            where: {
                tenantId,
                itemType: 'ACCOUNT',
                isActive: true,
            },
        });
        const debitTypes = [
            'CASH',
            'BANK',
            'INVENTORY',
            'ASSET',
            'ACCOUNTS_RECEIVABLE',
        ];
        const accounts = accountItems.map((item) => {
            const metadata = item.metadata;
            const balance = Number(metadata?.balance || 0);
            const accountType = metadata?.accountType || 'UNKNOWN';
            return {
                id: item.id,
                name: item.name,
                type: accountType,
                balance: Math.abs(balance),
                balanceType: debitTypes.includes(accountType) || balance < 0
                    ? 'DEBIT'
                    : 'CREDIT',
            };
        });
        const debits = accounts.filter((acc) => acc.balanceType === 'DEBIT');
        const credits = accounts.filter((acc) => acc.balanceType === 'CREDIT');
        const totalDebits = debits.reduce((sum, acc) => sum + acc.balance, 0);
        const totalCredits = credits.reduce((sum, acc) => sum + acc.balance, 0);
        const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
        return {
            accounts,
            totalDebits,
            totalCredits,
            isBalanced,
        };
    }
    async logAuditEvent(tenantId, userId, action, tableName, recordId, oldData, newData, description) {
        await this.prisma.note.create({
            data: {
                tenantId,
                content: description || `${action} ${tableName} ${recordId}`,
                aboutType: 'AUDIT',
                aboutId: recordId,
                context: {
                    action,
                    tableName,
                    userId,
                    oldData,
                    newData,
                    timestamp: new Date(),
                },
            },
        });
    }
    async validateDoubleEntryIntegrity(tenantId, transactionPairId) {
        const transactions = await this.prisma.transaction.findMany({
            where: { tenantId },
            include: { lines: true },
        });
        const filteredTransactions = transactions.filter((t) => {
            const metadata = t.metadata;
            return metadata?.transactionPairId === transactionPairId;
        });
        const errors = [];
        if (filteredTransactions.length !== 2) {
            errors.push(`Expected 2 transactions, found ${filteredTransactions.length}`);
            return { isValid: false, errors, transactions: filteredTransactions };
        }
        const debitTransaction = filteredTransactions.find((t) => t.metadata?.entryType === 'DEBIT');
        const creditTransaction = filteredTransactions.find((t) => t.metadata?.entryType === 'CREDIT');
        if (!debitTransaction || !creditTransaction) {
            errors.push('Could not identify debit and credit transactions');
            return { isValid: false, errors, transactions: filteredTransactions };
        }
        if (Number(debitTransaction.amount) !== Number(creditTransaction.amount)) {
            errors.push('Debit and credit amounts do not match');
        }
        return {
            isValid: errors.length === 0,
            errors,
            transactions: filteredTransactions,
        };
    }
    async findOrCreateAccount(tx, tenantId, accountType) {
        const accounts = await tx.item.findMany({
            where: {
                tenantId,
                itemType: 'ACCOUNT',
            },
        });
        let account = accounts.find((item) => item.metadata?.accountType === accountType);
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
};
exports.RpcService = RpcService;
exports.RpcService = RpcService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RpcService);
//# sourceMappingURL=rpc.service.js.map