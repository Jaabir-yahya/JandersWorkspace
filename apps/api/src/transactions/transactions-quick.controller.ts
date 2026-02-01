import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { QuickCaptureDto } from './dto/quick-capture.dto';

/**
 * Public quick-capture endpoint for manual-first (basic tier) users.
 * No JWT required; tenant identified by X-Tenant-Id header.
 */
@Controller('transactions')
export class TransactionsQuickController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('quick-capture')
  async quickCapture(
    @Headers('x-tenant-id') tenantId: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: QuickCaptureDto,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }

    const type =
      dto.type === 'sale' || dto.type === 'SALE'
        ? 'RETAIL'
        : dto.type === 'expense' || dto.type === 'EXPENSE'
          ? 'EXPENSE'
          : (dto.type as 'RETAIL' | 'SERVICE' | 'RENTAL' | 'EXPENSE');
    const currencyCode = dto.currency_code || 'KES';
    const method = dto.method
      ? (dto.method.toUpperCase().replace('MPESA', 'M-PESA') as
          | 'CASH'
          | 'M-PESA'
          | 'BANK_TRANSFER'
          | 'CARD'
          | 'CREDIT')
      : 'CASH';

    const manualUserId = await this.transactionsService.getOrCreateManualUserForTenant(tenantId);

    return this.transactionsService.create({
      tenant_id: tenantId,
      created_by_user_id: manualUserId,
      type,
      currency_code: currencyCode,
      reference: `quick-${Date.now()}`,
      entity_id: dto.entity_id || undefined,
      context: dto.note || undefined,
      tags: dto.tags || undefined,
      lines: [
        {
          description: dto.description,
          quantity: 1,
          unit_price: dto.amount,
          account_code: type === 'EXPENSE' ? '500-EXPENSE' : '200-SALES',
        },
      ],
      payment_records: [{ method, amount: dto.amount }],
    });
  }
}
