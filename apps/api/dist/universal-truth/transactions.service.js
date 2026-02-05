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
exports.UniversalTransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UniversalTransactionsService = class UniversalTransactionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createDoubleEntryTransaction(data) {
        if (!data.fromAccountId ||
            !data.toAccountId ||
            !data.amount ||
            data.amount <= 0) {
            throw new common_1.BadRequestException('From account, to account, and positive amount are required');
        }
        const result = await this.prisma.$queryRaw `
      SELECT * FROM create_double_entry_transaction(
        ${data.tenantId}::uuid,
        ${data.fromAccountId}::uuid,
        ${data.toAccountId}::uuid,
        ${data.amount}::decimal,
        ${data.reasonId || null}::uuid,
        ${data.entityId || null}::uuid,
        ${data.notes || null}::text,
        ${data.reference || null}::text,
        ${data.createdById || null}::uuid
      )
    `;
        const transactionData = result[0];
        if (transactionData?.p_error_message) {
            throw new common_1.BadRequestException(transactionData.p_error_message);
        }
        return transactionData?.p_transaction_id;
    }
    async getTransactionStream(tenantId, options = {}) {
        const result = (await this.prisma.$queryRaw `
      SELECT * FROM get_transaction_stream(
        ${tenantId}::uuid,
        ${options.fromDate || null}::date,
        ${options.toDate || null}::date,
        ${options.accountId || null}::uuid,
        ${options.entityId || null}::uuid,
        ${options.limit || 100}::int
      )
    `);
        return result.map((row) => ({
            id: String(row.id ?? ''),
            date: row.date instanceof Date ? row.date : new Date(String(row.date ?? '')),
            amount: Number(row.amount),
            fromAccountName: String(row.from_account_name ?? ''),
            toAccountName: String(row.to_account_name ?? ''),
            reasonName: String(row.reason_name ?? ''),
            entityName: row.entity_name != null ? String(row.entity_name) : undefined,
            notes: row.notes != null ? String(row.notes) : undefined,
            reference: row.reference != null ? String(row.reference) : undefined,
        }));
    }
    async reverseTransaction(transactionId, reason) {
        const result = (await this.prisma.$queryRaw `
      SELECT * FROM reverse_transaction(
        ${transactionId}::uuid,
        ${reason}::text
      )
    `);
        const reversalData = result[0];
        if (reversalData?.p_error_message) {
            throw new common_1.BadRequestException(String(reversalData.p_error_message));
        }
        return String(reversalData?.p_reversal_id ?? '');
    }
    async getTransaction(transactionId) {
        const transaction = (await this.prisma.$queryRaw `
      SELECT * FROM get_transaction_details(${transactionId}::uuid)
    `);
        if (!transaction || transaction.length === 0) {
            throw new common_1.BadRequestException('Transaction not found');
        }
        return transaction[0];
    }
};
exports.UniversalTransactionsService = UniversalTransactionsService;
exports.UniversalTransactionsService = UniversalTransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UniversalTransactionsService);
//# sourceMappingURL=transactions.service.js.map