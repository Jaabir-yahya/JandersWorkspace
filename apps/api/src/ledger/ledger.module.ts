import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { TransactionsService } from './transactions.service';
import { BusinessService } from './business.service';
import { ReportingService } from './reporting.service';
import { RpcService } from './rpc.service';
import { AccountsController } from './accounts.controller';
import { TransactionsController } from './transactions.controller';
import { BusinessController } from './business.controller';
import { ReportingController } from './reporting.controller';
import { RpcController } from './rpc.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    AccountsController,
    TransactionsController,
    BusinessController,
    ReportingController,
    RpcController,
  ],
  providers: [
    AccountsService,
    TransactionsService,
    BusinessService,
    ReportingService,
    RpcService,
  ],
  exports: [
    AccountsService,
    TransactionsService,
    BusinessService,
    ReportingService,
    RpcService,
  ],
})
export class LedgerModule {}
