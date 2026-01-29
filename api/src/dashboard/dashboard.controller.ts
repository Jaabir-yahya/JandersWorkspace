import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@Query('tenant_id') tenantId: string) {
    if (!tenantId) {
      throw new Error('tenant_id is required');
    }
    return this.dashboardService.getDashboardStats(tenantId);
  }
}
