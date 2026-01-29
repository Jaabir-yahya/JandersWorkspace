import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(dto);
  }

  @Get()
  findAll(
    @Query('tenant_id') tenantId: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('entity_id') entityId?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('search') search?: string,
    @Query('payment_status') paymentStatus?: string,
  ) {
    // If search term is provided, use search functionality
    if (search) {
      return this.transactionsService.searchTransactions(tenantId, search, {
        status,
        type,
        entity_id: entityId,
        date_from: dateFrom,
        date_to: dateTo,
        payment_status: paymentStatus,
      });
    }

    return this.transactionsService.findAll(tenantId, {
      status,
      type,
      entity_id: entityId,
      date_from: dateFrom,
      date_to: dateTo,
      payment_status: paymentStatus,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findOne(id);
  }

  @Get('entity/:entityId')
  findByEntity(@Param('entityId', ParseUUIDPipe) entityId: string) {
    return this.transactionsService.findByEntity(entityId);
  }

  /**
   * Post a transaction (DRAFT -> POSTED)
   * State Machine Transition
   */
  @Post(':id/post')
  postTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: PostTransactionDto,
  ) {
    return this.transactionsService.postTransaction(id, dto);
  }

  /**
   * Reverse a transaction (POSTED -> creates REVERSAL)
   * Creates a new transaction with negative amounts
   */
  @Post(':id/reverse')
  reverseTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: ReverseTransactionDto,
  ) {
    return this.transactionsService.reverseTransaction(id, dto);
  }

  /**
   * Update payment status
   * Used in the Reconciler view
   */
  @Patch(':id/payment_status')
  updatePaymentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: UpdatePaymentStatusDto,
  ) {
    return this.transactionsService.updatePaymentStatus(id, dto);
  }

  /**
   * Export transaction in Universal Invoice format (QBO/Kick compatible)
   */
  @Get(':id/export')
  async exportTransaction(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.standardizeTransaction(id);
  }
}

/**
 * Entity Controller
 * Handles entity-related operations including history
 */
@Controller('entities')
export class EntitiesController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Get entity history with running balance
   * The "Copper" feature
   */
  @Get(':id/history')
  getEntityHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenant_id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new Error('tenant_id is required');
    }
    return this.transactionsService.getEntityHistory(id, tenantId);
  }
}
