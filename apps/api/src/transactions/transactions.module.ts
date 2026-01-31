import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import {
  TransactionsController,
  EntitiesController,
} from './transactions.controller';

@Module({
  controllers: [TransactionsController, EntitiesController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
