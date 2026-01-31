import { Controller, Get, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(
    @Query('tenant_id') tenantId: string,
    @Request() req: any,
  ) {
    if (!tenantId) {
      throw new Error('tenant_id is required');
    }
    // Tenant isolation validation
    if (req.user?.tenantId && req.user.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied: tenant mismatch');
    }
    return this.dashboardService.getDashboardStats(tenantId);
  }

  @Get('metrics')
  getMetrics(
    @Query('tenant_id') tenantId: string,
    @Request() req: any,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    if (!tenantId) {
      throw new Error('tenant_id is required');
    }
    // Tenant isolation validation
    if (req.user?.tenantId && req.user.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied: tenant mismatch');
    }
    return this.dashboardService.getMetrics(tenantId, startDate, endDate);
  }

  @Get('reconciliation')
  getReconciliation(
    @Query('tenant_id') tenantId: string,
    @Request() req: any,
  ) {
    if (!tenantId) {
      throw new Error('tenant_id is required');
    }
    // Tenant isolation validation
    if (req.user?.tenantId && req.user.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied: tenant mismatch');
    }
    return this.dashboardService.getReconciliationSummary(tenantId);
  }
}
