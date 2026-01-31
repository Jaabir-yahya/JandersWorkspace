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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRecordsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../supabase/supabase.module");
let PaymentRecordsService = class PaymentRecordsService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async create(dto) {
        const { data: transaction, error: txnError } = await this.supabase
            .from('transactions')
            .select('id, status')
            .eq('id', dto.transaction_id)
            .single();
        if (txnError || !transaction) {
            throw new common_1.NotFoundException(`Transaction ${dto.transaction_id} not found`);
        }
        const { data, error } = await this.supabase
            .from('payment_records')
            .insert({
            transaction_id: dto.transaction_id,
            method: dto.method,
            amount: dto.amount,
            reference: dto.reference || null,
            paid_at: dto.paid_at || new Date().toISOString(),
            metadata: {},
        })
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        await this.updateTransactionPaymentStatus(dto.transaction_id);
        return data;
    }
    async findByTransactionId(transactionId) {
        const { data, error } = await this.supabase
            .from('payment_records')
            .select('*')
            .eq('transaction_id', transactionId)
            .order('created_at', { ascending: false });
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data || [];
    }
    async delete(id) {
        const { data: payment, error: paymentError } = await this.supabase
            .from('payment_records')
            .select('transaction_id')
            .eq('id', id)
            .single();
        if (paymentError || !payment) {
            throw new common_1.NotFoundException(`Payment record ${id} not found`);
        }
        const { data: transaction, error: txnError } = await this.supabase
            .from('transactions')
            .select('status')
            .eq('id', payment.transaction_id)
            .single();
        if (txnError || !transaction) {
            throw new common_1.NotFoundException('Associated transaction not found');
        }
        if (transaction.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Cannot delete payment records for non-DRAFT transactions');
        }
        const { error } = await this.supabase
            .from('payment_records')
            .delete()
            .eq('id', id);
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        await this.updateTransactionPaymentStatus(payment.transaction_id);
    }
    async updateTransactionPaymentStatus(transactionId) {
        const { data: transaction, error: txnError } = await this.supabase
            .from('transactions')
            .select('total_amount, status')
            .eq('id', transactionId)
            .single();
        if (txnError || !transaction) {
            return;
        }
        const { data: payments, error: paymentError } = await this.supabase
            .from('payment_records')
            .select('amount')
            .eq('transaction_id', transactionId);
        if (paymentError) {
            return;
        }
        const totalPaid = (payments || []).reduce((sum, p) => sum + p.amount, 0);
        const totalAmount = transaction.total_amount;
        let newStatus;
        if (totalPaid === 0) {
            newStatus = 'PENDING';
        }
        else if (totalPaid >= totalAmount) {
            newStatus = 'PAID';
        }
        else {
            newStatus = 'PARTIAL';
        }
        const { data: txnData } = await this.supabase
            .from('transactions')
            .select('payment_status, due_date')
            .eq('id', transactionId)
            .single();
        if (txnData?.payment_status === 'CREDIT' && txnData?.due_date) {
            return;
        }
        await this.supabase
            .from('transactions')
            .update({ payment_status: newStatus })
            .eq('id', transactionId);
    }
};
exports.PaymentRecordsService = PaymentRecordsService;
exports.PaymentRecordsService = PaymentRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE_CLIENT)),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], PaymentRecordsService);
//# sourceMappingURL=payment-records.service.js.map