import { Module } from '@nestjs/common';
import { UniversalAccountsController } from './universal-truth.controller';
import { UniversalTransactionsController } from './universal-truth.controller';
import { UniversalAccountsService } from './accounts.service';
import { UniversalTransactionsService } from './transactions.service';

@Module({
  controllers: [UniversalAccountsController, UniversalTransactionsController],
  providers: [UniversalAccountsService, UniversalTransactionsService],
  exports: [UniversalAccountsService, UniversalTransactionsService],
})
export class UniversalTruthModule {}
