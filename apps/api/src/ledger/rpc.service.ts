import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TxnType, TxnStatus, PaymentStatus } from '@project-bridge/database';

type JsonRecord = Record<string, unknown>;

@Injectable()
export class RpcService {
  constructor(private prisma: PrismaService) {}

  // Stored procedure-like functions for double-entry accounting

  /**
   * Creates a double-entry transaction with proper balance updates
   */
  async createDoubleEntryTransaction(
    tenantId: string,
    userId: string,
    debitAccountType: string,
    creditAccountType: string,
    amount: number,
    description?: string,
    linkedEntityType?: string,
    linkedEntityId?: string,
    reference?: string,
    transactionDate?: Date,
  ): Promise<{
    debitTransactionId: string;
    creditTransactionId: string;
    transactionPairId: string;
    debitBalanceBefore: number;
    debitBalanceAfter: number;
    creditBalanceBefore: number;
    creditBalanceAfter: number;
  }> {
    return await this.prisma.$transaction(async (tx) => {
      const transactionPairId = `PAIR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const date = transactionDate || new Date();

      // Find or create accounts
      const debitAccount = await this.findOrCreateAccount(
        tx,
        tenantId,
        debitAccountType,
      );
      const creditAccount = await this.findOrCreateAccount(
        tx,
        tenantId,
        creditAccountType,
      );

      const debitBalanceBefore =
        ((debitAccount.metadata as JsonRecord)?.balance as
          | number
          | undefined) || 0;
      const creditBalanceBefore =
        ((creditAccount.metadata as JsonRecord)?.balance as
          | number
          | undefined) || 0;
      const debitBalanceAfter = debitBalanceBefore + amount;
      const creditBalanceAfter = creditBalanceBefore - amount;

      // Create debit transaction
      const debitTransaction = await tx.transaction.create({
        data: {
          tenantId,
          amount,
          notes: `Debit: ${debitAccountType} - ${description}`,
          type: TxnType.EXPENSE,
          status: TxnStatus.POSTED,
          paymentStatus: PaymentStatus.SETTLED,
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

      // Create credit transaction
      const creditTransaction = await tx.transaction.create({
        data: {
          tenantId,
          amount,
          notes: `Credit: ${creditAccountType} - ${description}`,
          type: TxnType.RETAIL,
          status: TxnStatus.POSTED,
          paymentStatus: PaymentStatus.SETTLED,
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

      // Update account balances atomically
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

  /**
   * Safely reverses a double-entry transaction
   */
  async reverseDoubleEntryTransaction(
    tenantId: string,
    userId: string,
    transactionPairId: string,
    reason?: string,
  ): Promise<{
    reversalDebitTransactionId: string;
    reversalCreditTransactionId: string;
    reversalTransactionPairId: string;
  }> {
    return await this.prisma.$transaction(async (tx) => {
      // Find original transactions
      const originalTransactions = await tx.transaction.findMany({
        where: { tenantId },
      });

      const filteredTransactions = originalTransactions.filter((t) => {
        const metadata = t.metadata as JsonRecord | null;
        return metadata?.transactionPairId === transactionPairId;
      });

      if (filteredTransactions.length !== 2) {
        throw new Error('Original transaction pair not found');
      }

      const debitTransaction = filteredTransactions.find(
        (t) => (t.metadata as JsonRecord)?.entryType === 'DEBIT',
      );
      const creditTransaction = filteredTransactions.find(
        (t) => (t.metadata as JsonRecord)?.entryType === 'CREDIT',
      );

      if (!debitTransaction || !creditTransaction) {
        throw new Error('Could not identify debit/credit transactions');
      }

      const amount = Number(debitTransaction.amount);
      const reversalPairId = `REVERSAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Find accounts involved
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

      const debitBalanceBefore =
        ((debitAccount.metadata as JsonRecord)?.balance as
          | number
          | undefined) || 0;
      const creditBalanceBefore =
        ((creditAccount.metadata as JsonRecord)?.balance as
          | number
          | undefined) || 0;
      const debitBalanceAfter = debitBalanceBefore - amount;
      const creditBalanceAfter = creditBalanceBefore + amount;

      // Create reversal transactions (swapped debit/credit)
      const reversalDebitTransaction = await tx.transaction.create({
        data: {
          tenantId,
          amount,
          notes: `Reversal Credit: ${creditAccount.name} - ${reason || 'Transaction reversal'}`,
          type: TxnType.RETAIL,
          status: TxnStatus.POSTED,
          paymentStatus: PaymentStatus.SETTLED,
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
          type: TxnType.EXPENSE,
          status: TxnStatus.POSTED,
          paymentStatus: PaymentStatus.SETTLED,
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

      // Update account balances
      await this.updateAccountBalance(tx, debitAccount.id, debitBalanceAfter);
      await this.updateAccountBalance(tx, creditAccount.id, creditBalanceAfter);

      return {
        reversalDebitTransactionId: reversalDebitTransaction.id,
        reversalCreditTransactionId: reversalCreditTransaction.id,
        reversalTransactionPairId: reversalPairId,
      };
    });
  }

  /**
   * Safely updates account balance with proper validation
   */
  async updateAccountBalance(
    tx: any,
    accountId: string,
    newBalance: number,
  ): Promise<void> {
    // Validate the balance change
    if (newBalance < 0 && Math.abs(newBalance) > 10000) {
      // Allow reasonable overdrafts
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

  /**
   * Gets trial balance with proper debit/credit calculations
   */
  async getTrialBalance(tenantId: string): Promise<{
    accounts: Array<{
      id: string;
      name: string;
      type: string;
      balance: number;
      balanceType: 'DEBIT' | 'CREDIT';
    }>;
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
  }> {
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
        balanceType:
          debitTypes.includes(accountType) || balance < 0
            ? ('DEBIT' as const)
            : ('CREDIT' as const),
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

  /**
   * Logs audit events for tracking changes
   */
  async logAuditEvent(
    tenantId: string,
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REVERSE',
    tableName: string,
    recordId: string,
    oldData?: any,
    newData?: any,
    description?: string,
  ): Promise<void> {
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

  /**
   * Validates double-entry transaction integrity
   */
  async validateDoubleEntryIntegrity(
    tenantId: string,
    transactionPairId: string,
  ): Promise<{
    isValid: boolean;
    errors: string[];
    transactions: any[];
  }> {
    const transactions = await this.prisma.transaction.findMany({
      where: { tenantId },
      include: { lines: true },
    });

    const filteredTransactions = transactions.filter((t) => {
      const metadata = t.metadata;
      return metadata?.transactionPairId === transactionPairId;
    });

    const errors: string[] = [];

    if (filteredTransactions.length !== 2) {
      errors.push(
        `Expected 2 transactions, found ${filteredTransactions.length}`,
      );
      return { isValid: false, errors, transactions: filteredTransactions };
    }

    const debitTransaction = filteredTransactions.find(
      (t) => t.metadata?.entryType === 'DEBIT',
    );
    const creditTransaction = filteredTransactions.find(
      (t) => t.metadata?.entryType === 'CREDIT',
    );

    if (!debitTransaction || !creditTransaction) {
      errors.push('Could not identify debit and credit transactions');
      return { isValid: false, errors, transactions: filteredTransactions };
    }

    if (Number(debitTransaction.amount) !== Number(creditTransaction.amount)) {
      errors.push('Debit and credit amounts do not match');
    }

    // Additional validation can be added here

    return {
      isValid: errors.length === 0,
      errors,
      transactions: filteredTransactions,
    };
  }

  private async findOrCreateAccount(
    tx: any,
    tenantId: string,
    accountType: string,
  ): Promise<any> {
    // Find existing account
    const accounts = await tx.item.findMany({
      where: {
        tenantId,
        itemType: 'ACCOUNT',
      },
    });

    let account = accounts.find(
      (item) => (item.metadata as JsonRecord)?.accountType === accountType,
    );

    if (!account) {
      // Create new account
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
}
