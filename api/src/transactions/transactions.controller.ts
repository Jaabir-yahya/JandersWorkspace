import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
    @Body(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))
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
   * List all entities for a tenant
   */
  @Get()
  findAll(
    @Query('tenant_id') tenantId: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    if (!tenantId) {
      throw new Error('tenant_id is required');
    }
    return this.transactionsService.findAllEntities(tenantId, { type, search });
  }

  /**
   * Create a new entity
   */
  @Post()
  create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: any,
  ) {
    return this.transactionsService.createEntity(dto);
  }

  /**
   * Get entity by ID
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findEntityById(id);
  }

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

  /**
   * Get entity with balance calculation
   */
  @Get(':id/balance')
  getEntityBalance(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenant_id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new Error('tenant_id is required');
    }
    return this.transactionsService.getEntityBalance(id, tenantId);
  }

  /**
   * Get entity 360 view (entity + balance + recent transactions + files)
   */
  @Get(':id/360-view')
  getEntity360View(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenant_id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new Error('tenant_id is required');
    }
    return this.transactionsService.getEntity360View(id, tenantId);
  }

  /**
   * Search entities by phone number
   */
  @Get('search')
  searchByPhone(
    @Query('phone') phone: string,
    @Query('tenant_id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new Error('tenant_id is required');
    }
    if (!phone) {
      throw new Error('phone query parameter is required');
    }
    return this.transactionsService.searchEntitiesByPhone(phone, tenantId);
  }

  /**
   * Add linked phone to entity
   */
  @Post(':id/linked-phones')
  addLinkedPhone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('phone') phone: string,
  ) {
    if (!phone) {
      throw new Error('phone is required');
    }
    return this.transactionsService.addLinkedPhone(id, phone);
  }

  /**
   * Remove linked phone from entity
   */
  @Delete(':id/linked-phones/:phone')
  removeLinkedPhone(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('phone') phone: string,
  ) {
    return this.transactionsService.removeLinkedPhone(id, phone);
  }
}
