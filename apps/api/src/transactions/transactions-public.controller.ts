import {
  Controller,
  Get,
  Headers,
  Query,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { TenantsService } from '../tenants/tenants.service';
import { TransactionsService } from './transactions.service';

/**
 * Public read for manual users and bots: list transactions by tenant.
 * No JWT; tenant identified by X-Tenant-Id header only.
 */
@Controller('transactions')
export class TransactionsPublicController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly tenantsService: TenantsService,
  ) {}

  @Get('export')
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
      const filename = `transactions-${dateFrom ?? 'all'}-${dateTo ?? 'all'}.csv`.replace(/ /g, '-');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }
    return result;
  }

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
}
