import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TxnStatus, TxnType, PaymentStatus } from '@project-bridge/database';

export interface DashboardStats {
  total_revenue_today: number;
  total_revenue_week: number;
  total_revenue_month: number;
  transactions_today: number;
  transactions_week: number;
  outstanding_credit: number;
  outstanding_debt: number;
  payment_method_breakdown: {
    cash: number;
    mpesa: number;
    bank: number;
    credit: number;
  };
  top_customers: Array<{
    entity_id: string;
    display_name: string;
    total_amount: number;
    transaction_count: number;
  }>;
  recent_activity: Array<{
    id: string;
    type: 'transaction' | 'payment' | 'entity' | 'reversal';
    description: string;
    amount?: number;
    timestamp: string;
  }>;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(tenantId: string): Promise<DashboardStats> {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const startOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay(),
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Revenue today
    const todayRevenue = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: TxnStatus.POSTED,
        type: { in: [TxnType.RETAIL, TxnType.SERVICE, TxnType.RENTAL] },
        createdAt: { gte: startOfToday },
      },
      select: { amount: true },
    });

    // Revenue this week
    const weekRevenue = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: TxnStatus.POSTED,
        type: { in: [TxnType.RETAIL, TxnType.SERVICE, TxnType.RENTAL] },
        createdAt: { gte: startOfWeek },
      },
      select: { amount: true },
    });

    // Revenue this month
    const monthRevenue = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: TxnStatus.POSTED,
        type: { in: [TxnType.RETAIL, TxnType.SERVICE, TxnType.RENTAL] },
        createdAt: { gte: startOfMonth },
      },
      select: { amount: true },
    });

    // Transaction counts
    const todayCount = await this.prisma.transaction.count({
      where: {
        tenantId,
        status: TxnStatus.POSTED,
        createdAt: { gte: startOfToday },
      },
    });

    const weekCount = await this.prisma.transaction.count({
      where: {
        tenantId,
        status: TxnStatus.POSTED,
        createdAt: { gte: startOfWeek },
      },
    });

    // Outstanding credit (money owed to us) - pending payment status
    const creditData = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: TxnStatus.POSTED,
        type: { in: [TxnType.RETAIL, TxnType.SERVICE, TxnType.RENTAL] },
        paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
      },
      select: { amount: true },
    });

    // Outstanding debt (money we owe suppliers) - expense type with pending payment
    const debtData = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: TxnStatus.POSTED,
        type: TxnType.EXPENSE,
        paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
      },
      select: { amount: true },
    });

    // Payment method breakdown (from payments)
    const paymentData = await this.prisma.payment.findMany({
      where: { tenantId },
      select: {
        amount: true,
        metadata: true,
      },
    });

    // Get top customers with entity details in a single query using include
    const topTransactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: TxnStatus.POSTED,
        entityId: { not: null },
      },
      include: {
        entity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Aggregate by entity
    const entityMap = new Map<
      string,
      {
        entity_id: string;
        display_name: string;
        total_amount: number;
        transaction_count: number;
      }
    >();

    for (const txn of topTransactions) {
      if (!txn.entityId || !txn.entity) continue;

      const existing = entityMap.get(txn.entityId);
      if (existing) {
        existing.total_amount += Number(txn.amount);
        existing.transaction_count += 1;
      } else {
        entityMap.set(txn.entityId, {
          entity_id: txn.entityId,
          display_name: txn.entity.name || 'Unknown',
          total_amount: Number(txn.amount),
          transaction_count: 1,
        });
      }
    }

    const topCustomers = Array.from(entityMap.values())
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 5);

    // Recent activity - single query with entity include
    const recentActivity = await this.prisma.transaction.findMany({
      where: { tenantId },
      include: {
        entity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Calculate payment method breakdown
    const paymentBreakdown = { cash: 0, mpesa: 0, bank: 0, credit: 0 };
    paymentData.forEach((payment) => {
      const metadata = payment.metadata;
      const method = metadata?.method?.toLowerCase() || 'unknown';
      const amount = Number(payment.amount);
      if (method === 'cash') paymentBreakdown.cash += amount;
      else if (method === 'm-pesa' || method === 'mpesa')
        paymentBreakdown.mpesa += amount;
      else if (method === 'bank_transfer' || method === 'bank')
        paymentBreakdown.bank += amount;
      else if (method === 'credit') paymentBreakdown.credit += amount;
    });

    // Format recent activity
    const formattedActivity: DashboardStats['recent_activity'] =
      recentActivity.map((txn) => ({
        id: txn.id,
        type: (txn.type === 'EXPENSE' ? 'transaction' : 'transaction') as
          | 'transaction'
          | 'reversal',
        description: `${txn.type} - ${txn.entity?.name || 'Unknown'}${txn.reference ? ` (${txn.reference})` : ''}`,
        amount: Number(txn.amount),
        timestamp: txn.createdAt.toISOString(),
      }));

    return {
      total_revenue_today: todayRevenue.reduce(
        (sum, t) => sum + Number(t.amount),
        0,
      ),
      total_revenue_week: weekRevenue.reduce(
        (sum, t) => sum + Number(t.amount),
        0,
      ),
      total_revenue_month: monthRevenue.reduce(
        (sum, t) => sum + Number(t.amount),
        0,
      ),
      transactions_today: todayCount,
      transactions_week: weekCount,
      outstanding_credit: creditData.reduce(
        (sum, t) => sum + Number(t.amount),
        0,
      ),
      outstanding_debt: debtData.reduce((sum, t) => sum + Number(t.amount), 0),
      payment_method_breakdown: paymentBreakdown,
      top_customers: topCustomers,
      recent_activity: formattedActivity,
    };
  }

  async getMetrics(tenantId: string, startDate?: string, endDate?: string) {
    const dateFilter: any = { tenantId };

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    const [transactions, amount] = await Promise.all([
      this.prisma.transaction.findMany({
        where: dateFilter,
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.transaction.aggregate({
        where: dateFilter,
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const byType = transactions.reduce(
      (acc, txn) => {
        acc[txn.type] = (acc[txn.type] || 0) + Number(txn.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

    // For simplicity, return basic metrics
    return {
      total_transactions: amount._count.id || 0,
      total_amount: Number(amount._sum.amount || 0),
      by_type: byType,
      by_payment_method: { cash: 0, mpesa: 0, bank: 0 }, // Simplified
      recent_transactions: transactions.slice(-5).map((txn) => ({
        id: txn.id,
        type: txn.type,
        amount: Number(txn.amount),
        date: txn.createdAt.toISOString(),
      })),
    };
  }

  async getReconciliationSummary(tenantId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { tenantId },
      select: {
        amount: true,
        status: true,
      },
    });

    const totalExpected = transactions
      .filter((txn) => txn.status === TxnStatus.POSTED)
      .reduce((sum, txn) => sum + Number(txn.amount), 0);

    // Simplified reconciliation - in real scenario this would match with actual payments
    return {
      total_expected: totalExpected,
      total_received: totalExpected, // Assuming full payment for simplicity
      variance: 0,
      by_method: {
        cash: totalExpected * 0.6,
        mpesa: totalExpected * 0.4,
        bank: 0,
      },
    };
  }
}
