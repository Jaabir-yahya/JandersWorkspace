import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentRecordsService } from './payment-records.service';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto';

@Controller('payment-records')
export class PaymentRecordsController {
  constructor(private readonly paymentRecordsService: PaymentRecordsService) {}

  @Get('transaction/:transactionId')
  findByTransaction(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ) {
    return this.paymentRecordsService.findByTransactionId(transactionId);
  }

  @Post()
  create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreatePaymentRecordDto,
  ) {
    return this.paymentRecordsService.create(dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentRecordsService.delete(id);
  }
}
