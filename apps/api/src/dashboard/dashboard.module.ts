import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DashboardPublicController } from './dashboard-public.controller';

@Module({
  imports: [TenantsModule],
  controllers: [DashboardPublicController, DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
