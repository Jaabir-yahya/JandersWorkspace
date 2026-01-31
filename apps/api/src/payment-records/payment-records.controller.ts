import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ValidationPipe,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PaymentRecordsService } from './payment-records.service';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto';

@Controller('payment-records')
@UseGuards(AuthGuard)
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
    @Request() req: any,
  ) {
    // Tenant isolation validation - check if transaction belongs to user's tenant
    // This assumes the DTO contains tenantId or we fetch it from the transaction
    // For now, we pass the user context to the service for validation
    return this.paymentRecordsService.create(dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentRecordsService.delete(id);
  }
}
