import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TxnType, TxnStatus, PaymentStatus } from '@project-bridge/database';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTransactionDto,
  CreateDoubleEntryTransactionDto,
  TransactionDto,
  TransactionReasonDto,
  EntityDto,
  AccountDto,
} from './dto/transaction.dto';
import { AccountsService } from './accounts.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private accountsService: AccountsService,
  ) {}

  async createDoubleEntry(
    tenantId: string,
    userId: string,
    createDoubleEntryDto: CreateDoubleEntryTransactionDto,
  ): Promise<{
    debitTransaction: TransactionDto;
    creditTransaction: TransactionDto;
    transactionPairId: string;
  }> {
    return await this.prisma.$transaction(async (tx) => {
      // Find or create debit and credit accounts
      const debitAccount = await this.findOrCreateAccount(
        tenantId,
        createDoubleEntryDto.debitAccountType,
        tx,
      );
      const creditAccount = await this.findOrCreateAccount(
        tenantId,
        createDoubleEntryDto.creditAccountType,
        tx,
      );

      // Generate transaction pair ID for linking
      const transactionPairId = `PAIR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const transactionDate = createDoubleEntryDto.date
        ? new Date(createDoubleEntryDto.date)
        : new Date();

      // Create debit transaction (schema: notes, metadata, type, status, paymentStatus; no party/what/method/insights)
      const debitTransaction = await tx.transaction.create({
        data: {
          tenantId,
          entityId: createDoubleEntryDto.entityId ?? undefined,
          amount: createDoubleEntryDto.amount,
          notes: createDoubleEntryDto.notes ?? 'Debit entry',
          type: TxnType.EXPENSE,
          status: TxnStatus.POSTED,
          paymentStatus: PaymentStatus.SETTLED,
          reference: createDoubleEntryDto.reference ?? undefined,
          date: transactionDate,
          createdByUserId: userId,
          metadata: {
            transactionPairId,
            entryType: 'DEBIT',
            linkedEntityType: createDoubleEntryDto.linkedEntityType,
            linkedEntityId: createDoubleEntryDto.linkedEntityId,
            containerId: createDoubleEntryDto.containerId,
            balanceBefore:
              (debitAccount.metadata as Record<string, unknown>)?.balance || 0,
            balanceAfter:
              Number(
                (debitAccount.metadata as Record<string, unknown>)?.balance ||
                  0,
              ) + createDoubleEntryDto.amount,
          } as object,
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

      // Create credit transaction
      const creditTransaction = await tx.transaction.create({
        data: {
          tenantId,
          entityId: createDoubleEntryDto.entityId ?? undefined,
          amount: createDoubleEntryDto.amount,
          notes: createDoubleEntryDto.notes ?? 'Credit entry',
          type: TxnType.RETAIL,
          status: TxnStatus.POSTED,
          paymentStatus: PaymentStatus.SETTLED,
          reference: createDoubleEntryDto.reference ?? undefined,
          date: transactionDate,
          createdByUserId: userId,
          metadata: {
            transactionPairId,
            entryType: 'CREDIT',
            linkedEntityType: createDoubleEntryDto.linkedEntityType,
            linkedEntityId: createDoubleEntryDto.linkedEntityId,
            containerId: createDoubleEntryDto.containerId,
            balanceBefore:
              (creditAccount.metadata as Record<string, unknown>)?.balance || 0,
            balanceAfter:
              Number(
                (creditAccount.metadata as Record<string, unknown>)?.balance ||
                  0,
              ) - createDoubleEntryDto.amount,
          } as object,
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

      // Update account balances
      const newDebitBalance =
        (debitAccount.metadata?.balance || 0) + createDoubleEntryDto.amount;
      const newCreditBalance =
        (creditAccount.metadata?.balance || 0) - createDoubleEntryDto.amount;

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

      // Log audit event
      await this.logAuditEvent(
        tx,
        tenantId,
        userId,
        'CREATE',
        'TRANSACTION',
        debitTransaction.id,
        null,
        debitTransaction,
      );

      return {
        debitTransaction: await this.mapToDto(debitTransaction),
        creditTransaction: await this.mapToDto(creditTransaction),
        transactionPairId,
      };
    });
  }

  async reverseDoubleEntry(
    tenantId: string,
    userId: string,
    transactionPairId: string,
  ): Promise<{
    reversalDebitTransaction: TransactionDto;
    reversalCreditTransaction: TransactionDto;
  }> {
    return await this.prisma.$transaction(async (tx) => {
      // Find original transactions
      const originalTransactions = await tx.transaction.findMany({
        where: {
          tenantId,
        },
      });

      // Filter by metadata (transactionPairId) since we can't query JSON directly
      const filteredTransactions = originalTransactions.filter((t) => {
        const meta = t.metadata as Record<string, unknown>;
        return meta?.transactionPairId === transactionPairId;
      });

      if (filteredTransactions.length !== 2) {
        throw new NotFoundException('Original transaction pair not found');
      }

      const debitTransaction = filteredTransactions.find(
        (t) => (t.metadata as Record<string, unknown>)?.entryType === 'DEBIT',
      );
      const creditTransaction = filteredTransactions.find(
        (t) => (t.metadata as Record<string, unknown>)?.entryType === 'CREDIT',
      );

      if (!debitTransaction || !creditTransaction) {
        throw new NotFoundException(
          'Could not identify debit/credit transactions',
        );
      }

      // Create reversal transactions (swapped debit/credit)
      const reversalPairId = `REVERSAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const amount = Number(debitTransaction.amount);

      // Find the accounts involved
      const debitLine = await tx.transactionLine.findFirst({
        where: { transactionId: debitTransaction.id },
      });

      const creditLine = await tx.transactionLine.findFirst({
        where: { transactionId: creditTransaction.id },
      });

      if (!debitLine || !creditLine) {
        throw new NotFoundException('Original transaction lines not found');
      }

      const debitAccount = await tx.item.findFirst({
        where: { sku: debitLine.accountCode || '', itemType: 'ACCOUNT' },
      });

      const creditAccount = await tx.item.findFirst({
        where: { sku: creditLine.accountCode || '', itemType: 'ACCOUNT' },
      });

      if (!debitAccount || !creditAccount) {
        throw new NotFoundException('Accounts not found');
      }

      // Create reversal transactions
      const reversalDebitTransaction = await tx.transaction.create({
        data: {
          tenantId,
          entityId: debitTransaction.entityId ?? undefined,
          amount: amount,
          notes: `Reversal of ${debitTransaction.notes ?? 'debit'}`,
          type: TxnType.RETAIL,
          status: TxnStatus.POSTED,
          paymentStatus: PaymentStatus.SETTLED,
          reference: `REV_${debitTransaction.reference ?? ''}`,
          date: new Date(),
          createdByUserId: userId,
          reversedTransactionId: debitTransaction.id,
          metadata: {
            transactionPairId: reversalPairId,
            entryType: 'DEBIT',
            originalTransactionPairId: transactionPairId,
            balanceBefore:
              (debitAccount.metadata as Record<string, unknown>)?.balance || 0,
            balanceAfter:
              Number(
                (debitAccount.metadata as Record<string, unknown>)?.balance ||
                  0,
              ) - amount,
          } as object,
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
          type: TxnType.EXPENSE,
          status: TxnStatus.POSTED,
          paymentStatus: PaymentStatus.SETTLED,
          reference: `REV_${creditTransaction.reference ?? ''}`,
          date: new Date(),
          createdByUserId: userId,
          reversedTransactionId: creditTransaction.id,
          metadata: {
            transactionPairId: reversalPairId,
            entryType: 'CREDIT',
            originalTransactionPairId: transactionPairId,
            balanceBefore:
              (creditAccount.metadata as Record<string, unknown>)?.balance || 0,
            balanceAfter:
              Number(
                (creditAccount.metadata as Record<string, unknown>)?.balance ||
                  0,
              ) + amount,
          } as object,
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

      // Update account balances (reverse the original amounts)
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
        reversalCreditTransaction: await this.mapToDto(
          reversalCreditTransaction,
        ),
      };
    });
  }

  async findMany(
    tenantId: string,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      accountType?: string;
      entityType?: string;
      entityName?: string;
    },
  ): Promise<TransactionDto[]> {
    const where: any = { tenantId };

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
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

    return Promise.all(
      transactions.map((transaction) => this.mapToDto(transaction)),
    );
  }

  async findOne(tenantId: string, id: string): Promise<TransactionDto> {
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
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return this.mapToDto(transaction);
  }

  async getTransactionHistory(
    tenantId: string,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      accountType?: string;
      entityType?: string;
    },
  ): Promise<any[]> {
    const transactions = await this.findMany(tenantId, filters);

    // Group by transaction pairs
    const transactionPairs: { [key: string]: any[] } = {};

    transactions.forEach((transaction) => {
      const pairId = (transaction.metadata as any)?.transactionPairId;
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

  private async findOrCreateAccount(
    tenantId: string,
    accountType: string,
    tx: any,
  ): Promise<any> {
    let account = await tx.item.findFirst({
      where: {
        tenantId,
        itemType: 'ACCOUNT',
      },
    });

    // Filter by accountType in metadata (since we can't query JSON directly in Prisma)
    const accounts = await tx.item.findMany({
      where: {
        tenantId,
        itemType: 'ACCOUNT',
      },
    });

    account = accounts.find(
      (item) => item.metadata?.accountType === accountType,
    );

    if (!account) {
      // Create the account if it doesn't exist
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

  private async logAuditEvent(
    tx: any,
    tenantId: string,
    userId: string,
    action: string,
    tableName: string,
    recordId: string,
    oldData: any,
    newData: any,
  ): Promise<void> {
    // Use the Note model as a simple audit log
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

  private async mapToDto(transaction: any): Promise<TransactionDto> {
    const meta = (transaction.metadata || {}) as Record<string, unknown>;
    return {
      id: transaction.id,
      tenantId: transaction.tenantId,
      fromAccountId:
        meta?.entryType === 'DEBIT' ? 'DEBIT_ACCOUNT' : 'CREDIT_ACCOUNT',
      toAccountId:
        meta?.entryType === 'CREDIT' ? 'CREDIT_ACCOUNT' : 'DEBIT_ACCOUNT',
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
}
