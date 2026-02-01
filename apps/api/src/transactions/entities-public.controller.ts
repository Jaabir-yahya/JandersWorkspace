import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  BadRequestException,
  NotFoundException,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateEntityPublicDto } from './dto/create-entity-public.dto';

/**
 * Public People (entities) API for manual tier.
 * No JWT; tenant from X-Tenant-Id. Enables list, create, get, history, balance.
 */
@Controller('entities')
export class EntitiesPublicController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async list(
    @Headers('x-tenant-id') tenantId: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }
    return this.transactionsService.findAllEntities(tenantId, { type, search });
  }

  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateEntityPublicDto,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }
    const manualUserId =
      await this.transactionsService.getOrCreateManualUserForTenant(tenantId);
    const entityType =
      dto.type === 'customer' || dto.type === 'CUSTOMER'
        ? 'CUSTOMER'
        : dto.type === 'supplier' || dto.type === 'SUPPLIER'
          ? 'SUPPLIER'
          : dto.type === 'both' || dto.type === 'BOTH'
            ? 'BOTH'
            : 'CUSTOMER';
    return this.transactionsService.createEntity({
      tenant_id: tenantId,
      created_by_user_id: manualUserId,
      display_name: dto.display_name,
      phone_number: dto.phone_number ?? undefined,
      type: entityType,
    });
  }

  @Get(':id')
  async getOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }
    const entity = await this.transactionsService.findEntityById(id);
    if (entity.tenantId !== tenantId) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  @Get(':id/history')
  async getHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }
    return this.transactionsService.getEntityHistory(id, tenantId);
  }

  @Get(':id/balance')
  async getBalance(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (!tenantId?.trim()) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }
    return this.transactionsService.getEntityBalance(id, tenantId);
  }
}
