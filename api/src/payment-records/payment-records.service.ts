import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto';

export interface PaymentRecord {
  id: string;
  transaction_id: string;
  method: string;
  amount: number;
  reference?: string;
  paid_at?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

@Injectable()
export class PaymentRecordsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async create(dto: CreatePaymentRecordDto): Promise<PaymentRecord> {
    // First, verify the transaction exists and is in DRAFT status
    const { data: transaction, error: txnError } = await this.supabase
      .from('transactions')
      .select('id, status')
      .eq('id', dto.transaction_id)
      .single();

    if (txnError || !transaction) {
      throw new NotFoundException(`Transaction ${dto.transaction_id} not found`);
    }

    // Allow adding payments to both DRAFT and POSTED transactions
    // This enables recording payments after posting

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
      throw new BadRequestException(error.message);
    }

    // Update transaction payment_status based on total payments
    await this.updateTransactionPaymentStatus(dto.transaction_id);

    return data;
  }

  async findByTransactionId(transactionId: string): Promise<PaymentRecord[]> {
    const { data, error } = await this.supabase
      .from('payment_records')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data || [];
  }

  async delete(id: string): Promise<void> {
    // First, get the payment record to find the transaction
    const { data: payment, error: paymentError } = await this.supabase
      .from('payment_records')
      .select('transaction_id')
      .eq('id', id)
      .single();

    if (paymentError || !payment) {
      throw new NotFoundException(`Payment record ${id} not found`);
    }

    // Check if transaction is DRAFT (only allow deletion for DRAFT)
    const { data: transaction, error: txnError } = await this.supabase
      .from('transactions')
      .select('status')
      .eq('id', payment.transaction_id)
      .single();

    if (txnError || !transaction) {
      throw new NotFoundException('Associated transaction not found');
    }

    if (transaction.status !== 'DRAFT') {
      throw new BadRequestException('Cannot delete payment records for non-DRAFT transactions');
    }

    const { error } = await this.supabase
      .from('payment_records')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Update transaction payment_status
    await this.updateTransactionPaymentStatus(payment.transaction_id);
  }

  private async updateTransactionPaymentStatus(transactionId: string): Promise<void> {
    // Get transaction total amount
    const { data: transaction, error: txnError } = await this.supabase
      .from('transactions')
      .select('total_amount, status')
      .eq('id', transactionId)
      .single();

    if (txnError || !transaction) {
      return;
    }

    // Get total payments
    const { data: payments, error: paymentError } = await this.supabase
      .from('payment_records')
      .select('amount')
      .eq('transaction_id', transactionId);

    if (paymentError) {
      return;
    }

    const totalPaid = (payments || []).reduce((sum, p) => sum + p.amount, 0);
    const totalAmount = transaction.total_amount;

    let newStatus: string;
    if (totalPaid === 0) {
      newStatus = 'PENDING';
    } else if (totalPaid >= totalAmount) {
      newStatus = 'PAID';
    } else {
      newStatus = 'PARTIAL';
    }

    // Only update if transaction is not in CREDIT status with a due date
    // CREDIT status is special and should be preserved
    const { data: txnData } = await this.supabase
      .from('transactions')
      .select('payment_status, due_date')
      .eq('id', transactionId)
      .single();

    if (txnData?.payment_status === 'CREDIT' && txnData?.due_date) {
      // Keep CREDIT status, but we could track payment progress separately
      return;
    }

    await this.supabase
      .from('transactions')
      .update({ payment_status: newStatus })
      .eq('id', transactionId);
  }
}
