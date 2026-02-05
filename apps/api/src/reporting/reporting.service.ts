import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UniversalAccountsService } from '../universal-truth/accounts.service';
import { UniversalTransactionsService } from '../universal-truth/transactions.service';

export interface TrialBalanceDto {
  accountId: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface FinancialSummaryDto {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface BalanceSheetDto {
  assets: {
    cash: number;
    accountsReceivable: number;
    inventory: number;
    other: number;
  };
  liabilities: {
    accountsPayable: number;
    other: number;
  };
  equity: number;
}

export interface TransactionHistoryDto {
  id: string;
  date: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  reason: string;
  entity: string;
  reference: string;
  type: string;
}

@Injectable()
export class ReportingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsService: UniversalAccountsService,
    private readonly transactionsService: UniversalTransactionsService,
  ) {}

  /**
   * Get trial balance for tenant
   */
  async getTrialBalance(
    tenantId: string,
    options?: {
      asOfDate?: string;
      accountType?: string;
    },
  ): Promise<TrialBalanceDto[]> {
    // Get all accounts with their current balances
    const accounts = await this.prisma.account.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(options?.accountType && { type: options.accountType }),
      },
      orderBy: {
        type: 'asc',
        name: 'asc',
      },
    });

    // Build trial balance from Universal Truth transactions
    const trialBalance: TrialBalanceDto[] = [];

    for (const account of accounts) {
      const balance = Number(account.balance);

      // Determine if account normally has debit or credit balance
      const isDebitAccount = ['ASSETS', 'EXPENSES', 'COST_OF_SALES'].includes(
        account.type,
      );

      trialBalance.push({
        accountId: account.id,
        accountName: account.name,
        accountType: account.type,
        debit: isDebitAccount ? Math.abs(balance) : 0,
        credit: !isDebitAccount ? Math.abs(balance) : 0,
        balance,
      });
    }

    return trialBalance;
  }

  /**
   * Get financial summary for date range
   */
  async getFinancialSummary(
    tenantId: string,
    options?: {
      startDate?: string;
      endDate?: string;
    },
  ): Promise<FinancialSummaryDto> {
    const defaultEndDate =
      options?.endDate || new Date().toISOString().split('T')[0];
    const defaultStartDate =
      options?.startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    // Get transaction stream for the period
    const transactions = await this.transactionsService.getTransactionStream(
      tenantId,
      {
        fromDate: defaultStartDate,
        toDate: defaultEndDate,
        limit: 1000,
      },
    );

    // Calculate totals from transactions
    let totalRevenue = 0;
    let totalExpenses = 0;

    for (const tx of transactions) {
      if (
        tx.reasonName.includes('REVENUE') ||
        tx.reasonName.includes('SALES')
      ) {
        totalRevenue += tx.amount;
      } else if (
        tx.reasonName.includes('EXPENSE') ||
        tx.reasonName.includes('PURCHASE')
      ) {
        totalExpenses += tx.amount;
      }
    }

    // Get account balances for balance sheet
    const accounts = await this.prisma.account.findMany({
      where: {
        tenantId,
        isActive: true,
      },
    });

    let totalAssets = 0;
    let totalLiabilities = 0;

    for (const account of accounts) {
      const balance = Number(account.balance);
      if (['ASSETS', 'EXPENSES'].includes(account.type)) {
        totalAssets += balance;
      } else if (['LIABILITIES', 'EQUITY'].includes(account.type)) {
        totalLiabilities += balance;
      }
    }

    const netIncome = totalRevenue - totalExpenses;
    const equity = totalAssets - totalLiabilities;

    return {
      totalRevenue,
      totalExpenses,
      netIncome,
      totalAssets,
      totalLiabilities,
      equity,
      period: {
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      },
    };
  }

  /**
   * Get balance sheet
   */
  async getBalanceSheet(
    tenantId: string,
    options?: {
      asOfDate?: string;
    },
  ): Promise<BalanceSheetDto> {
    const accounts = await this.prisma.account.findMany({
      where: {
        tenantId,
        isActive: true,
      },
    });

    // Categorize accounts
    let cash = 0;
    let accountsReceivable = 0;
    let inventory = 0;
    let otherAssets = 0;
    let accountsPayable = 0;
    let otherLiabilities = 0;

    for (const account of accounts) {
      const balance = Number(account.balance);

      switch (account.type) {
        case 'CASH':
        case 'BANK':
          cash += balance;
          break;
        case 'RECEIVABLES':
          accountsReceivable += balance;
          break;
        case 'INVENTORY':
          inventory += balance;
          break;
        case 'LIABILITIES':
        case 'PAYABLES':
          accountsPayable += balance;
          break;
        default:
          if (['ASSETS', 'EXPENSES'].includes(account.type)) {
            otherAssets += balance;
          } else {
            otherLiabilities += balance;
          }
      }
    }

    const totalAssets = cash + accountsReceivable + inventory + otherAssets;
    const totalLiabilities = accountsPayable + otherLiabilities;
    const equity = totalAssets - totalLiabilities;

    return {
      assets: {
        cash,
        accountsReceivable,
        inventory,
        other: totalAssets - (cash + accountsReceivable + inventory),
      },
      liabilities: {
        accountsPayable,
        other: otherLiabilities,
      },
      equity,
    };
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    tenantId: string,
    options?: {
      fromDate?: string;
      toDate?: string;
      accountId?: string;
      limit?: number;
    },
  ): Promise<TransactionHistoryDto[]> {
    const transactions = await this.transactionsService.getTransactionStream(
      tenantId,
      options,
    );

    return transactions.map((tx) => ({
      id: tx.id,
      date: tx.date.toISOString(),
      amount: tx.amount,
      fromAccount: tx.fromAccountName,
      toAccount: tx.toAccountName,
      reason: tx.reasonName,
      entity: tx.entityName ?? '',
      reference: tx.reference ?? '',
      type: 'TRANSACTION',
    }));
  }

  /**
   * Export data to CSV or JSON
   */
  async exportData(
    tenantId: string,
    dataType:
      | 'trial_balance'
      | 'financial_summary'
      | 'balance_sheet'
      | 'transactions',
    format: 'json' | 'csv',
    options?: {
      fromDate?: string;
      toDate?: string;
    },
  ): Promise<any> {
    let data: any;

    switch (dataType) {
      case 'trial_balance':
        data = await this.getTrialBalance(
          tenantId,
          options
            ? {
                asOfDate: options.toDate ?? options.fromDate,
                accountType: undefined,
              }
            : undefined,
        );
        break;
      case 'financial_summary':
        data = await this.getFinancialSummary(
          tenantId,
          options
            ? { startDate: options.fromDate, endDate: options.toDate }
            : undefined,
        );
        break;
      case 'balance_sheet':
        data = await this.getBalanceSheet(
          tenantId,
          options
            ? { asOfDate: options.toDate ?? options.fromDate }
            : undefined,
        );
        break;
      case 'transactions':
        data = await this.getTransactionHistory(tenantId, options);
        break;
      default:
        throw new Error(`Unsupported export type: ${dataType}`);
    }

    if (format === 'csv') {
      // Convert to CSV format
      return this.convertToCSV(data);
    }

    return data;
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = data.map((row) =>
      headers.map((header) => `"${row[header] || ''}"`).join(','),
    );

    return [headers.join(','), ...csvRows].join('\n');
  }
}
