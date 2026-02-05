import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  async getTrialBalance(tenantId: string): Promise<any> {
    // Get all account items
    const accountItems = await this.prisma.item.findMany({
      where: {
        tenantId,
        itemType: 'ACCOUNT',
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Group by account type and calculate balances
    const accounts = accountItems.map((item) => {
      const metadata = item.metadata;
      return {
        id: item.id,
        name: item.name,
        type: metadata?.accountType || 'UNKNOWN',
        balance: Number(metadata?.balance || 0),
        currency: metadata?.currency || 'KES',
      };
    });

    const debitTypes = [
      'CASH',
      'BANK',
      'INVENTORY',
      'ASSET',
      'ACCOUNTS_RECEIVABLE',
    ];

    const debits = accounts
      .filter((acc) => debitTypes.includes(acc.type) || acc.balance < 0)
      .map((acc) => ({
        ...acc,
        balance: Math.abs(acc.balance),
        type: 'DEBIT',
      }));

    const credits = accounts
      .filter((acc) => !debitTypes.includes(acc.type) && acc.balance >= 0)
      .map((acc) => ({
        ...acc,
        type: 'CREDIT',
      }));

    const totalDebits = debits.reduce((sum, acc) => sum + acc.balance, 0);
    const totalCredits = credits.reduce((sum, acc) => sum + acc.balance, 0);

    return {
      accounts: [...debits, ...credits],
      summary: {
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
      },
      generatedAt: new Date(),
    };
  }

  async getTransactionHistory(
    tenantId: string,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      accountType?: string;
      entityType?: string;
      entityId?: string;
      containerId?: string;
    },
  ): Promise<any> {
    const where: any = { tenantId };

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
    }
    if (filters?.entityId) where.entityId = filters.entityId;
    if (filters?.containerId) {
      where.metadata = { path: ['containerId'], equals: filters.containerId };
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

    // Group by transaction pairs
    const transactionPairs: { [key: string]: any[] } = {};

    transactions.forEach((transaction) => {
      const metadata = transaction.metadata as Record<string, unknown>;
      const pairId = metadata?.transactionPairId as string | undefined;
      if (pairId) {
        if (!transactionPairs[pairId]) {
          transactionPairs[pairId] = [];
        }
        transactionPairs[pairId].push({
          id: transaction.id,
          amount: Number(transaction.amount),
          date: transaction.date,
          party: transaction.entityId,
          entryType: metadata?.entryType,
          balanceBefore: metadata?.balanceBefore,
          balanceAfter: metadata?.balanceAfter,
          isReversal: metadata?.reversal || false,
          transactionPairId: pairId,
          containerId: metadata?.containerId,
        });
      }
    });

    return {
      transactions: Object.values(transactionPairs).map((pair) => ({
        transactionPairId: pair[0]?.transactionPairId,
        transactions: pair,
        date: pair[0]?.date,
        totalAmount: pair[0]?.amount,
        isReversal: pair[0]?.isReversal,
      })),
      summary: {
        totalTransactions: Object.keys(transactionPairs).length,
        totalAmount: Object.values(transactionPairs).reduce(
          (sum, pair) => sum + (pair[0]?.amount || 0),
          0,
        ),
      },
      filters,
      generatedAt: new Date(),
    };
  }

  async getInventoryReport(tenantId: string): Promise<any> {
    const inventoryItems = await this.prisma.item.findMany({
      where: {
        tenantId,
        itemType: 'INVENTORY',
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const items = inventoryItems.map((item) => {
      const metadata = item.metadata;
      return {
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: Number(item.quantity),
        unit: item.unit_of_measure || 'PCS',
        costPrice: Number(item.costPrice || 0),
        sellingPrice: Number(item.defaultPrice || 0),
        averagePrice: metadata?.averagePrice || Number(item.costPrice || 0),
        totalValue:
          metadata?.totalValue ||
          Number(item.quantity) * Number(item.costPrice || 0),
        lastStockUpdate: metadata?.lastStockUpdate,
        reorderPoint: Number(item.reorderPoint || 0),
        minStockLevel: Number(item.minQuantity || 0),
        maxStockLevel: Number(metadata?.maxQuantity || item.quantity || 0),
      };
    });

    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockItems = items.filter(
      (item) => item.quantity <= item.reorderPoint,
    );

    return {
      items,
      summary: {
        totalItems,
        totalQuantity,
        totalValue,
        lowStockItems: lowStockItems.length,
        averageValuePerItem: totalItems > 0 ? totalValue / totalItems : 0,
      },
      lowStockItems: lowStockItems.map((item) => ({
        id: item.id,
        name: item.name,
        currentQuantity: item.quantity,
        reorderPoint: item.reorderPoint,
        shortage: item.reorderPoint - item.quantity,
      })),
      generatedAt: new Date(),
    };
  }

  async getSalesReport(
    tenantId: string,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
    },
  ): Promise<any> {
    const where: any = {
      tenantId,
      type: 'RETAIL', // Sales transactions
    };

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
    }

    const salesTransactions = await this.prisma.transaction.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });

    const totalSales = salesTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0,
    );
    const totalTransactions = salesTransactions.length;
    const averageSaleAmount =
      totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Group by date for daily sales
    const dailySales = salesTransactions.reduce((acc, transaction) => {
      const dateKey = transaction.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          totalSales: 0,
          transactionCount: 0,
        };
      }
      acc[dateKey].totalSales += Number(transaction.amount);
      acc[dateKey].transactionCount += 1;
      return acc;
    }, {} as any);

    return {
      sales: salesTransactions.map((transaction) => ({
        id: transaction.id,
        amount: Number(transaction.amount),
        date: transaction.date,
        party: transaction.entityId,
        method: transaction.metadata?.method || 'unknown',
        status: transaction.status,
      })),
      summary: {
        totalSales,
        totalTransactions,
        averageSaleAmount,
      },
      dailySales: Object.values(dailySales).sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
      filters,
      generatedAt: new Date(),
    };
  }

  async getExpenseReport(
    tenantId: string,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
    },
  ): Promise<any> {
    const where: any = {
      tenantId,
      type: 'EXPENSE', // Expense transactions
    };

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
    }

    const expenseTransactions = await this.prisma.transaction.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });

    const totalExpenses = expenseTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0,
    );
    const totalTransactions = expenseTransactions.length;
    const averageExpenseAmount =
      totalTransactions > 0 ? totalExpenses / totalTransactions : 0;

    // Group by party/entity for expense breakdown
    const expenseByParty = expenseTransactions.reduce((acc, transaction) => {
      const party = transaction.entityId || 'Unknown';
      if (!acc[party]) {
        acc[party] = {
          party,
          totalAmount: 0,
          transactionCount: 0,
        };
      }
      acc[party].totalAmount += Number(transaction.amount);
      acc[party].transactionCount += 1;
      return acc;
    }, {} as any);

    return {
      expenses: expenseTransactions.map((transaction) => {
        const metadata = transaction.metadata;
        return {
          id: transaction.id,
          amount: Number(transaction.amount),
          date: transaction.date,
          party: transaction.entityId,
          what: metadata?.what || transaction.notes,
          method: metadata?.method || 'unknown',
        };
      }),
      summary: {
        totalExpenses,
        totalTransactions,
        averageExpenseAmount,
      },
      expenseByParty: Object.values(expenseByParty).sort(
        (a: any, b: any) => b.totalAmount - a.totalAmount,
      ),
      filters,
      generatedAt: new Date(),
    };
  }

  async getCashFlowReport(
    tenantId: string,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
    },
  ): Promise<any> {
    const where: any = { tenantId };

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate cash flow by date
    const cashFlowByDate = transactions.reduce((acc, transaction) => {
      const dateKey = transaction.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          inflow: 0,
          outflow: 0,
          netFlow: 0,
        };
      }

      const amount = Number(transaction.amount);
      if (transaction.type === 'RETAIL') {
        acc[dateKey].inflow += amount;
      } else if (transaction.type === 'EXPENSE') {
        acc[dateKey].outflow += amount;
      }
      acc[dateKey].netFlow = acc[dateKey].inflow - acc[dateKey].outflow;

      return acc;
    }, {} as any);

    const cashFlowData = Object.values(cashFlowByDate);
    const totalInflow = cashFlowData.reduce(
      (sum: number, day: any) => sum + (day.inflow || 0),
      0,
    );
    const totalOutflow = cashFlowData.reduce(
      (sum: number, day: any) => sum + (day.outflow || 0),
      0,
    );
    const netCashFlow = Number(totalInflow) - Number(totalOutflow);

    return {
      cashFlow: cashFlowData,
      summary: {
        totalInflow,
        totalOutflow,
        netCashFlow,
        averageDailyFlow:
          cashFlowData.length > 0 ? netCashFlow / cashFlowData.length : 0,
      },
      filters,
      generatedAt: new Date(),
    };
  }

  async exportData(
    tenantId: string,
    dataType:
      | 'transactions'
      | 'inventory'
      | 'supplies'
      | 'invoices'
      | 'payments',
    format: 'json' | 'csv' = 'json',
  ): Promise<any> {
    let data: any;

    switch (dataType) {
      case 'transactions':
        data = await this.getTransactionHistory(tenantId);
        break;
      case 'inventory':
        data = await this.getInventoryReport(tenantId);
        break;
      case 'supplies':
        // Get supplies from notes
        const supplies = await this.prisma.note.findMany({
          where: {
            tenantId,
            aboutType: 'SUPPLY',
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        data = { supplies };
        break;
      case 'invoices':
        // Get invoices from notes
        const invoices = await this.prisma.note.findMany({
          where: {
            tenantId,
            aboutType: 'INVOICE',
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        data = { invoices };
        break;
      case 'payments':
        const payments = await this.prisma.payment.findMany({
          where: {
            tenantId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        data = { payments };
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      return {
        data: this.convertToCSV(data),
        filename: `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv',
      };
    }

    return {
      data,
      filename: `${dataType}_export_${new Date().toISOString().split('T')[0]}.json`,
      mimeType: 'application/json',
    };
  }

  private convertToCSV(data: any): string {
    // Simplified CSV conversion - in production, you'd use a proper CSV library
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              return typeof value === 'string' && value.includes(',')
                ? `"${value}"`
                : value;
            })
            .join(','),
        ),
      ];
      return csvRows.join('\n');
    }
    return JSON.stringify(data, null, 2);
  }
}
