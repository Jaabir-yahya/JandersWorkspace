import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DashboardPublicController } from './dashboard-public.controller';
import { DashboardMobileController } from './dashboard-mobile.controller';

@Module({
  imports: [TenantsModule, TransactionsModule, PrismaModule],
  controllers: [
    DashboardPublicController,
    DashboardController,
    DashboardMobileController,
  ],
  providers: [DashboardService],
})
export class DashboardModule {}
