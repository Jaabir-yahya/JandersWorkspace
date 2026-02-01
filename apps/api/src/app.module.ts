import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaymentRecordsModule } from './payment-records/payment-records.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';
import { NairobiModule } from './nairobi/nairobi.module';
import { TenantsController } from './tenants/tenants.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'strict',
        ttl: 60000, // 1 minute
        limit: 5, // 5 requests per minute (for auth endpoints)
      },
    ]),
    AuthModule,
    PrismaModule,
    TransactionsModule,
    PaymentRecordsModule,
    AttachmentsModule,
    DashboardModule,
    IntegrationsModule,
    NairobiModule,
    HealthModule,
  ],
  controllers: [AppController, TenantsController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
