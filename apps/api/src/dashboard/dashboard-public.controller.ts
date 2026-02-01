import { Controller, Get, Headers, BadRequestException } from '@nestjs/common';
import { TenantsService } from '../tenants/tenants.service';
import { DashboardService } from './dashboard.service';

/**
 * Public read for manual users and bots: dashboard stats by tenant.
 * No JWT; tenant identified by X-Tenant-Id header only. Optional X-Tenant-Key when tenant has API key set.
 */
@Controller('dashboard')
export class DashboardPublicController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly tenantsService: TenantsService,
  ) {}

  @Get('stats/public')
  async getStatsByTenant(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-tenant-key') tenantKey: string | undefined,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }
    await this.tenantsService.assertTenantKeyIfPresent(tenantId, tenantKey);
    return this.dashboardService.getDashboardStats(tenantId);
  }
}
