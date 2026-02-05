import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateTransactionDto {
  tenantId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  reasonId?: string;
  entityId?: string;
  notes?: string;
  reference?: string;
  createdById?: string;
}

export interface TransactionStreamOptions {
  fromDate?: string;
  toDate?: string;
  accountId?: string;
  entityId?: string;
  limit?: number;
}

export interface TransactionStreamDto {
  id: string;
  date: Date;
  amount: number;
  fromAccountName: string;
  toAccountName: string;
  reasonName: string;
  entityName?: string;
  notes?: string;
  reference?: string;
}

@Injectable()
export class UniversalTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create double-entry transaction using stored procedure
   */
  async createDoubleEntryTransaction(
    data: CreateTransactionDto,
  ): Promise<string> {
    // Validate inputs
    if (
      !data.fromAccountId ||
      !data.toAccountId ||
      !data.amount ||
      data.amount <= 0
    ) {
      throw new BadRequestException(
        'From account, to account, and positive amount are required',
      );
    }

    // Use stored procedure for atomicity
    const result = await this.prisma.$queryRaw`
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

    const transactionData = (result as any)[0];
    if (transactionData?.p_error_message) {
      throw new BadRequestException(transactionData.p_error_message);
    }

    return transactionData?.p_transaction_id;
  }

  /**
   * Get transaction stream using stored procedure
   */
  async getTransactionStream(
    tenantId: string,
    options: TransactionStreamOptions = {},
  ): Promise<TransactionStreamDto[]> {
    const result = await this.prisma.$queryRaw`
      SELECT * FROM get_transaction_stream(
        ${tenantId}::uuid,
        ${options.fromDate || null}::date,
        ${options.toDate || null}::date,
        ${options.accountId || null}::uuid,
        ${options.entityId || null}::uuid,
        ${options.limit || 100}::int
      )
    `;

    const rows = result as Record<string, unknown>[];
    return rows.map(
      (row: Record<string, unknown>): TransactionStreamDto => ({
        id: String(row.id ?? ''),
        date:
          row.date instanceof Date
            ? row.date
            : new Date(String(row.date ?? '')),
        amount: Number(row.amount),
        fromAccountName: String(row.from_account_name ?? ''),
        toAccountName: String(row.to_account_name ?? ''),
        reasonName: String(row.reason_name ?? ''),
        entityName:
          row.entity_name != null ? String(row.entity_name) : undefined,
        notes: row.notes != null ? String(row.notes) : undefined,
        reference: row.reference != null ? String(row.reference) : undefined,
      }),
    );
  }

  /**
   * Reverse transaction using stored procedure
   */
  async reverseTransaction(
    transactionId: string,
    reason: string,
  ): Promise<string> {
    const result = await this.prisma.$queryRaw`
      SELECT * FROM reverse_transaction(
        ${transactionId}::uuid,
        ${reason}::text
      )
    `;

    const reversalRows = result as Record<string, unknown>[];
    const reversalData = reversalRows[0];
    if (reversalData?.p_error_message) {
      throw new BadRequestException(String(reversalData.p_error_message));
    }

    return String(reversalData?.p_reversal_id ?? '');
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<any> {
    const raw = await this.prisma.$queryRaw`
      SELECT * FROM get_transaction_details(${transactionId}::uuid)
    `;
    const transaction = raw as unknown[];

    if (!transaction || transaction.length === 0) {
      throw new BadRequestException('Transaction not found');
    }

    return transaction[0];
  }
}
