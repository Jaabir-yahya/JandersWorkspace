import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TxnStatus, TxnType, PaymentStatus } from '@prisma/client';

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
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Revenue today
    const todayRevenue = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: TxnStatus.POSTED,
        type: { in: [TxnType.RETAIL, TxnType.SERVICE, TxnType.RENTAL] },
        createdAt: { gte: startOfToday },
      },
      select: { totalAmount: true },
    });

    // Revenue this week
    const weekRevenue = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: TxnStatus.POSTED,
        type: { in: [TxnType.RETAIL, TxnType.SERVICE, TxnType.RENTAL] },
        createdAt: { gte: startOfWeek },
      },
      select: { totalAmount: true },
    });

    // Revenue this month
    const monthRevenue = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: TxnStatus.POSTED,
        type: { in: [TxnType.RETAIL, TxnType.SERVICE, TxnType.RENTAL] },
        createdAt: { gte: startOfMonth },
      },
      select: { totalAmount: true },
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
      select: { totalAmount: true },
    });

    // Outstanding debt (money we owe suppliers) - expense type with pending payment
    const debtData = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: TxnStatus.POSTED,
        type: TxnType.EXPENSE,
        paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
      },
      select: { totalAmount: true },
    });

    // Payment method breakdown (from payments)
    const paymentData = await this.prisma.payment.findMany({
      where: { tenantId },
      select: {
        amount: true,
        metadata: true,
      },
    });

    // Top customers - aggregate using Prisma
    const topCustomersRaw = await this.prisma.transaction.groupBy({
      by: ['entityId'],
      where: {
        tenantId,
        status: TxnStatus.POSTED,
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 5,
    });

    // Get entity details for top customers
    const entityIds = topCustomersRaw.map(c => c.entityId).filter(Boolean) as string[];
    const entities = await this.prisma.entity.findMany({
      where: {
        id: { in: entityIds },
      },
      select: {
        id: true,
        displayName: true,
      },
    });

    const topCustomers = topCustomersRaw.map(customer => {
      const entity = entities.find(e => e.id === customer.entityId);
      return {
        entity_id: customer.entityId || '',
        display_name: entity?.displayName || 'Unknown',
        total_amount: Number(customer._sum.totalAmount) || 0,
        transaction_count: customer._count.id,
      };
    });

    // Recent activity
    const recentActivity = await this.prisma.transaction.findMany({
      where: { tenantId },
      select: {
        id: true,
        type: true,
        totalAmount: true,
        createdAt: true,
        reference: true,
        entity: {
          select: {
            displayName: true,
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
      const metadata = payment.metadata as any;
      const method = metadata?.method?.toLowerCase() || 'unknown';
      const amount = Number(payment.amount);
      if (method === 'cash') paymentBreakdown.cash += amount;
      else if (method === 'm-pesa' || method === 'mpesa') paymentBreakdown.mpesa += amount;
      else if (method === 'bank_transfer' || method === 'bank') paymentBreakdown.bank += amount;
      else if (method === 'credit') paymentBreakdown.credit += amount;
    });

    // Format recent activity
    const formattedActivity: DashboardStats['recent_activity'] = recentActivity.map((txn) => ({
      id: txn.id,
      type: (txn.type === 'EXPENSE' ? 'transaction' : 'transaction') as 'transaction' | 'reversal',
      description: `${txn.type} - ${txn.entity?.displayName || 'Unknown'}${txn.reference ? ` (${txn.reference})` : ''}`,
      amount: Number(txn.totalAmount),
      timestamp: txn.createdAt.toISOString(),
    }));

    return {
      total_revenue_today: todayRevenue.reduce((sum, t) => sum + Number(t.totalAmount), 0),
      total_revenue_week: weekRevenue.reduce((sum, t) => sum + Number(t.totalAmount), 0),
      total_revenue_month: monthRevenue.reduce((sum, t) => sum + Number(t.totalAmount), 0),
      transactions_today: todayCount,
      transactions_week: weekCount,
      outstanding_credit: creditData.reduce((sum, t) => sum + Number(t.totalAmount), 0),
      outstanding_debt: debtData.reduce((sum, t) => sum + Number(t.totalAmount), 0),
      payment_method_breakdown: paymentBreakdown,
      top_customers: topCustomers,
      recent_activity: formattedActivity,
    };
  }
}
