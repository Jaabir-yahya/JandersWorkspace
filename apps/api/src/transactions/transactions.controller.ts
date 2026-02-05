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
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
  Res,
  Headers,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { TenantsService } from '../tenants/tenants.service';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly tenantsService: TenantsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))
    dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(dto);
  }

  private async resolveTenant(req: any, queryTenantId: string, headerTenantId?: string): Promise<string> {
    const requested = (headerTenantId || queryTenantId)?.trim();
    if (!requested) throw new BadRequestException('tenant_id is required');
    const effective = await this.tenantsService.resolveEffectiveTenantId(
      req.user?.tenantId,
      requested,
      req.user?.email || '',
    );
    if (!effective) throw new ForbiddenException('Access denied: no access to this tenant');
    return effective;
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query('tenant_id') tenantId: string,
    @Request() req: any,
    @Headers('x-tenant-id') xTenantId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('entity_id') entityId?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('search') search?: string,
    @Query('payment_status') paymentStatus?: string,
  ) {
    const effective = await this.resolveTenant(req, tenantId, xTenantId);

    if (search) {
      return this.transactionsService.searchTransactions(effective, search, {
        status,
        type,
        entity_id: entityId,
        date_from: dateFrom,
        date_to: dateTo,
        payment_status: paymentStatus,
      });
    }

    return this.transactionsService.findAll(effective, {
      status,
      type,
      entity_id: entityId,
      date_from: dateFrom,
      date_to: dateTo,
      payment_status: paymentStatus,
    });
  }

  /**
   * Public list for bots/manual users
   */
  @Get('list')
  async listByTenant(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-tenant-key') tenantKey: string | undefined,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('entity_id') entityId?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('search') search?: string,
    @Query('payment_status') paymentStatus?: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }
    await this.tenantsService.assertTenantKeyIfPresent(tenantId, tenantKey);

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
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findOne(id);
  }

  @Get('entity/:entityId')
  @UseGuards(AuthGuard)
  findByEntity(@Param('entityId', ParseUUIDPipe) entityId: string) {
    return this.transactionsService.findByEntity(entityId);
  }

  /**
   * Post a transaction (DRAFT -> POSTED)
   */
  @Post(':id/post')
  @UseGuards(AuthGuard)
  postTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: PostTransactionDto,
  ) {
    return this.transactionsService.postTransaction(id);
  }

  /**
   * Reverse a transaction (POSTED -> creates REVERSAL)
   */
  @Post(':id/reverse')
  @UseGuards(AuthGuard)
  reverseTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: ReverseTransactionDto,
  ) {
    return this.transactionsService.reverseTransaction(id, dto);
  }

  /**
   * Update payment status
   */
  @Patch(':id/payment_status')
  @UseGuards(AuthGuard)
  updatePaymentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: UpdatePaymentStatusDto,
  ) {
    return this.transactionsService.updatePaymentStatus(id, dto);
  }

  /**
   * Export multiple transactions (Public access)
   */
  @Get('export-bulk')
  async export(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-tenant-key') tenantKey: string | undefined,
    @Res({ passthrough: true }) res: Response,
    @Query('format') format: 'json' | 'csv' = 'json',
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }
    await this.tenantsService.assertTenantKeyIfPresent(tenantId, tenantKey);
    const lim = limit ? Math.min(parseInt(limit, 10) || 10000, 50000) : 10000;
    const result = await this.transactionsService.exportBulk(
      tenantId,
      { date_from: dateFrom, date_to: dateTo, type },
      format,
      lim,
    );

    if (format === 'csv' && typeof result === 'string') {
      const filename =
        `transactions-${dateFrom ?? 'all'}-${dateTo ?? 'all'}.csv`.replace(
          / /g,
          '-',
        );
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
    }
    return result;
  }

  /**
   * Export single transaction in Universal Invoice format
   */
  @Get(':id/export')
  @UseGuards(AuthGuard)
  async exportTransaction(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.standardizeTransaction(id);
  }
}

/**
 * Entity Controller
 * Handles entity-related operations including history.
 * Consolidates standard and public-like entity access.
 */
@Controller('entities')
export class EntitiesController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * List all entities for a tenant.
   * Pulls tenant_id from query params or authenticated user.
   */
  @Get()
  @UseGuards(AuthGuard)
  findAll(
    @Request() req: any,
    @Query('tenant_id') tenantId?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    const activeTenantId = tenantId || req.user?.tenantId;

    if (!activeTenantId) {
      throw new BadRequestException('tenant_id is required');
    }

    // Tenant isolation validation
    if (req.user?.tenantId && activeTenantId !== req.user.tenantId) {
      throw new ForbiddenException('Access denied: tenant mismatch');
    }

    return this.transactionsService.findAllEntities(activeTenantId, {
      type,
      search,
    });
  }

  /**
   * Create a new entity.
   */
  @Post()
  @UseGuards(AuthGuard)
  create(
    @Request() req: any,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: any,
  ) {
    // Ensure tenant_id is set from user if missing
    if (!dto.tenant_id && req.user?.tenantId) {
      dto.tenant_id = req.user.tenantId;
    }

    // Ensure created_by_user_id is set
    if (!dto.created_by_user_id && req.user?.id) {
      dto.created_by_user_id = req.user.id;
    }

    return this.transactionsService.createEntity(dto);
  }

  /**
   * Get entity by ID.
   */
  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenant_id') tenantId?: string,
  ) {
    const activeTenantId = tenantId || req.user?.tenantId;
    const entity = await this.transactionsService.findEntityById(id);

    if (activeTenantId && entity.tenantId !== activeTenantId) {
      throw new ForbiddenException('Access denied: tenant mismatch');
    }

    return entity;
  }

  /**
   * Get entity history with running balance.
   */
  @Get(':id/history')
  @UseGuards(AuthGuard)
  getEntityHistory(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenant_id') tenantId?: string,
  ) {
    const activeTenantId = tenantId || req.user?.tenantId;

    if (!activeTenantId) {
      throw new BadRequestException('tenant_id is required');
    }

    return this.transactionsService.getEntityHistory(id, activeTenantId);
  }

  /**
   * Get entity with balance calculation.
   */
  @Get(':id/balance')
  @UseGuards(AuthGuard)
  getEntityBalance(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenant_id') tenantId?: string,
  ) {
    const activeTenantId = tenantId || req.user?.tenantId;

    if (!activeTenantId) {
      throw new BadRequestException('tenant_id is required');
    }

    return this.transactionsService.getEntityBalance(id, activeTenantId);
  }

  /**
   * Get entity 360 view.
   */
  @Get(':id/360-view')
  @UseGuards(AuthGuard)
  getEntity360View(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenant_id') tenantId?: string,
  ) {
    const activeTenantId = tenantId || req.user?.tenantId;

    if (!activeTenantId) {
      throw new BadRequestException('tenant_id is required');
    }

    return this.transactionsService.getEntity360View(id, activeTenantId);
  }

  /**
   * Search entities by phone number.
   */
  @Get('search')
  @UseGuards(AuthGuard)
  searchByPhone(
    @Request() req: any,
    @Query('phone') phone: string,
    @Query('tenant_id') tenantId?: string,
  ) {
    const activeTenantId = tenantId || req.user?.tenantId;

    if (!activeTenantId) {
      throw new BadRequestException('tenant_id is required');
    }
    if (!phone) {
      throw new BadRequestException('phone query parameter is required');
    }

    return this.transactionsService.searchEntitiesByPhone(
      phone,
      activeTenantId,
    );
  }

  /**
   * Add linked phone to entity.
   */
  @Post(':id/linked-phones')
  @UseGuards(AuthGuard)
  addLinkedPhone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('phone') phone: string,
  ) {
    if (!phone) {
      throw new BadRequestException('phone is required');
    }
    return this.transactionsService.addLinkedPhone(id, phone);
  }

  /**
   * Remove linked phone from entity.
   */
  @Delete(':id/linked-phones/:phone')
  @UseGuards(AuthGuard)
  removeLinkedPhone(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('phone') phone: string,
  ) {
    return this.transactionsService.removeLinkedPhone(id, phone);
  }
}
