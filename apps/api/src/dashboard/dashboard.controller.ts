import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Headers,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { TenantsService } from '../tenants/tenants.service';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly tenantsService: TenantsService,
  ) {}

  private async resolveTenant(
    req: any,
    queryTenantId: string,
    headerTenantId?: string,
  ): Promise<string> {
    const requested = (headerTenantId || queryTenantId)?.trim();
    if (!requested) throw new BadRequestException('tenant_id is required');
    const effective = await this.tenantsService.resolveEffectiveTenantId(
      req.user?.tenantId,
      requested,
      req.user?.email || '',
    );
    if (!effective)
      throw new ForbiddenException('Access denied: no access to this tenant');
    return effective;
  }

  @Get('stats')
  async getStats(
    @Query('tenant_id') tenantId: string,
    @Request() req: any,
    @Headers('x-tenant-id') xTenantId?: string,
  ) {
    const effective = await this.resolveTenant(req, tenantId, xTenantId);
    return this.dashboardService.getDashboardStats(effective);
  }

  @Get('metrics')
  async getMetrics(
    @Query('tenant_id') tenantId: string,
    @Request() req: any,
    @Headers('x-tenant-id') xTenantId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const effective = await this.resolveTenant(req, tenantId, xTenantId);
    return this.dashboardService.getMetrics(effective, startDate, endDate);
  }

  @Get('reconciliation')
  async getReconciliation(
    @Query('tenant_id') tenantId: string,
    @Request() req: any,
    @Headers('x-tenant-id') xTenantId?: string,
  ) {
    const effective = await this.resolveTenant(req, tenantId, xTenantId);
    return this.dashboardService.getReconciliationSummary(effective);
  }
}
