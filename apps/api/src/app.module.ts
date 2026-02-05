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
import { TenantsModule } from './tenants/tenants.module';
import { LedgerModule } from './ledger/ledger.module';
import { UniversalTruthModule } from './universal-truth/universal-truth.module';
import { SuppliesModule } from './supplies/supplies.module';
import { InvoiceModule } from './invoices/invoice.module';
import { PaymentModule } from './payments/payment.module';
import { ReportingModule } from './reporting/reporting.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 1000, // 1000 requests per minute (increased for development)
      },
      {
        name: 'strict',
        ttl: 60000, // 1 minute
        limit: 50, // 50 requests per minute (for auth endpoints - increased for dev)
      },
    ]),
    AuthModule,
    PrismaModule,
    TenantsModule,
    TransactionsModule,
    PaymentRecordsModule,
    AttachmentsModule,
    DashboardModule,
    IntegrationsModule,
    NairobiModule,
    HealthModule,
    LedgerModule,
    UniversalTruthModule,
    SuppliesModule,
    InvoiceModule,
    PaymentModule,
    ReportingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
