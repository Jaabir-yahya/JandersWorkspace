import {
  Controller,
  Get,
  Headers,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { DashboardService } from '../dashboard/dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Mobile-optimized dashboard endpoints for Bridge Perfect
 */
@Controller('dashboard/mobile')
export class DashboardMobileController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getMobileDashboard(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }

    // Find or create manual user for tenant
    let manualUser = await this.prisma.user.findFirst({
      where: {
        metadata: {
          path: ['manual_capture'],
          equals: true,
        },
      },
    });

    if (!manualUser) {
      // Create manual user if doesn't exist
      manualUser = await this.prisma.user.create({
        data: {
          email: `manual-${tenantId}@placeholder.local`,
          tenantId,
          displayName: 'Manual User',
          role: 'user',
          metadata: {
            manual_capture: true,
          },
        },
      });
    }

    const manualUserId = manualUser.id;

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await this.prisma.transaction.aggregate({
      where: {
        tenantId,
        createdByUserId: manualUserId,
        createdAt: {
          gte: today,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get recent transactions (last 10)
    const recentTransactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        createdByUserId: manualUserId,
      },
      include: {
        entity: {
          select: {
            id: true,
            name: true,
            phone: true,
            entityType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Get entity counts
    const entityCounts = await this.prisma.entity.groupBy({
      by: ['entityType'],
      where: {
        tenantId,
      },
      _count: {
        id: true,
      },
    });

    return {
      success: true,
      data: {
        today: {
          revenue: Number(stats._sum.amount) || 0,
          transactionCount: stats._count.id || 0,
        },
        entities: {
          total: entityCounts.reduce((sum, group) => sum + group._count.id, 0),
          byType: entityCounts.reduce((acc, group) => {
            acc[group.entityType] = group._count.id;
            return acc;
          }, {}),
        },
        recentTransactions: recentTransactions.map((tx) => ({
          id: tx.id,
          amount: Number(tx.amount),
          type: tx.type,
          status: tx.status,
          createdAt: tx.createdAt,
          entity: tx.entity,
        })),
      },
    };
  }
}
