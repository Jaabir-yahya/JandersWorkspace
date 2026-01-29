import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly svc: TransactionsService) {}

  @Post()
  async create(@Body() body: CreateTransactionDto) {
    return this.svc.create(body);
  }

  @Get()
  async list() {
    return this.svc.list();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @Post(':id/reverse')
  async reverse(@Param('id') id: string, @Body() body: any) {
    return this.svc.reverse(id, body);
  }
}
