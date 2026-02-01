/**
 * SMS Service for Nairobi manual users
 * Provides daily business summaries and alerts
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SmsSummary {
  phoneNumber: string;
  message: string;
  type: 'daily' | 'weekly' | 'alert';
}

@Injectable()
export class NairobiSmsService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Generate daily SMS summary for tenant
   */
  async generateDailySummary(tenantId: string): Promise<SmsSummary> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get today's transactions
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        entity: true,
      },
    });

    // Get transaction lines to calculate amounts
    const allTransactionIds = transactions.map((t) => t.id);
    const transactionLines = await this.prismaService.transactionLine.findMany({
      where: {
        transactionId: {
          in: allTransactionIds,
        },
      },
      include: {
        transaction: true,
      },
    });

    const totalSales = transactionLines
      .filter(
        (tl) =>
          !transactions
            .find((t) => t.id === tl.transactionId)
            ?.type.includes('EXPENSE'),
      )
      .reduce((sum, tl) => sum + Number(tl.totalLineAmount), 0);

    const totalExpenses = transactionLines
      .filter(
        (tl) =>
          transactions.find((t) => t.id === tl.transactionId)?.type ===
          'EXPENSE',
      )
      .reduce((sum, tl) => sum + Number(tl.totalLineAmount), 0);

    const netProfit = totalSales - totalExpenses;
    const transactionCount = transactions.length;

    // Get tenant info
    const tenant = await this.prismaService.tenant.findUnique({
      where: { id: tenantId },
    });

    // Get a user phone number for this tenant
    const user = await this.prismaService.user.findFirst({
      where: { tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Generate SMS message
    const message = this.formatSmsMessage({
      businessName: tenant.name,
      totalSales,
      totalExpenses,
      netProfit,
      transactionCount,
      date: today.toLocaleDateString('en-KE'),
    });

    return {
      phoneNumber: user?.phoneNumber || '',
      message,
      type: 'daily',
    };
  }

  /**
   * Send SMS via African provider (integration point)
   */
  async sendSms(sms: SmsSummary): Promise<boolean> {
    // TODO: Integrate with African SMS provider
    // Options: Twilio, Africa's Talking, Safaricom Bulk SMS
    console.log(`Sending SMS to ${sms.phoneNumber}: ${sms.message}`);

    // Mock implementation for now
    return true;
  }

  /**
   * Send daily summaries to all active tenants
   */
  async sendDailySummaries(): Promise<void> {
    const tenants = await this.prismaService.tenant.findMany({
      where: {
        isActive: true,
        // Only send to manual tier users initially
        tier: 'BASIC',
      },
    });

    for (const tenant of tenants) {
      try {
        const summary = await this.generateDailySummary(tenant.id);
        await this.sendSms(summary);
      } catch (error) {
        console.error(`Failed to send SMS to ${tenant.id}:`, error.message);
      }
    }
  }

  /**
   * Format SMS message for Nairobi users
   */
  private formatSmsMessage(data: {
    businessName: string;
    totalSales: number;
    totalExpenses: number;
    netProfit: number;
    transactionCount: number;
    date: string;
  }): string {
    const currency = (amount: number) => `KES ${amount.toLocaleString()}`;

    return (
      `📊 ${data.businessName} (${data.date})\n` +
      `💰 Sales: ${currency(data.totalSales)}\n` +
      `💸 Expenses: ${currency(data.totalExpenses)}\n` +
      `📈 Profit: ${currency(data.netProfit)}\n` +
      `📝 Transactions: ${data.transactionCount}\n` +
      `Reply MENU for more options`
    );
  }

  /**
   * Handle incoming SMS commands
   */
  async handleSmsCommand(
    phoneNumber: string,
    message: string,
  ): Promise<string> {
    // Find user by phone number first
    const user = await this.prismaService.user.findFirst({
      where: { phoneNumber },
    });

    if (!user) {
      return 'Sorry, business not found. Please contact support.';
    }

    const tenant = await this.prismaService.tenant.findUnique({
      where: { id: user.tenantId },
    });

    if (!tenant) {
      return 'Sorry, business not found. Please contact support.';
    }

    const command = message.toUpperCase().trim();

    switch (command) {
      case 'MENU':
        return (
          '📋 COMMANDS:\n' +
          "TODAY - Today's summary\n" +
          "WEEK - This week's summary\n" +
          'BALANCE - Current balance\n' +
          'HELP - More help'
        );

      case 'TODAY':
        const summary = await this.generateDailySummary(tenant.id);
        return summary.message;

      default:
        return 'Unknown command. Reply MENU for options.';
    }
  }

  /**
   * Set up SMS webhook for receiving messages
   */
  async setupSmsWebhook(): Promise<{ url: string; method: string }> {
    return {
      url: `${process.env.API_BASE_URL}/api/v1/nairobi/sms/webhook`,
      method: 'POST',
    };
  }
}
