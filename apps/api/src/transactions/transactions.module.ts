import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { TransactionsService } from './transactions.service';
import {
  TransactionsController,
  EntitiesController,
} from './transactions.controller';
import { TransactionsQuickController } from './transactions-quick.controller';

@Module({
  imports: [TenantsModule],
  controllers: [
    TransactionsQuickController,
    TransactionsController,
    EntitiesController,
  ],
  providers: [TransactionsService],
})
export class TransactionsModule {}
