import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
  Body,
} from '@nestjs/common';
import type { CreateAccountDto } from './accounts.service';
import type { CreateTransactionDto } from './transactions.service';
import { AuthGuard } from '../auth/auth.guard';
import { getAuthenticatedUser } from '../auth/auth.guard';
import {
  UniversalAccountsService,
  AccountBalanceDto,
} from './accounts.service';
import {
  UniversalTransactionsService,
  TransactionStreamDto,
} from './transactions.service';

@Controller('universal')
@UseGuards(AuthGuard) // Supabase JWT authentication for universal truth
export class UniversalAccountsController {
  constructor(private readonly accountsService: UniversalAccountsService) {}

  @Post('accounts')
  async createAccount(@Body() data: CreateAccountDto, @Request() req) {
    // Extract tenant from authenticated user
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    data.tenantId = user.tenantId;
    return await this.accountsService.createAccount(data);
  }

  @Get('accounts')
  async getAccounts(
    @Request() req,
    @Query('group') groupBy?: string,
  ): Promise<AccountBalanceDto[]> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return await this.accountsService.getBalances(user.tenantId, groupBy);
  }

  @Get('accounts/:id')
  async getAccount(
    @Param('id') id: string,
    @Request() req,
  ): Promise<AccountBalanceDto> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return await this.accountsService.getAccount(id, user.tenantId);
  }
}

@Controller('universal')
@UseGuards(AuthGuard)
export class UniversalTransactionsController {
  constructor(
    private readonly transactionsService: UniversalTransactionsService,
  ) {}

  @Post('transactions')
  async createTransaction(@Body() data: CreateTransactionDto, @Request() req) {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    data.tenantId = user.tenantId;
    data.createdById = user.id;

    const transactionId =
      await this.transactionsService.createDoubleEntryTransaction(data);

    return {
      id: transactionId,
      message: 'Double-entry transaction created successfully',
      amount: data.amount,
      fromAccount: data.fromAccountId,
      toAccount: data.toAccountId,
    };
  }

  @Get('transactions/stream')
  async getTransactionStream(
    @Request() req,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('accountId') accountId?: string,
    @Query('entityId') entityId?: string,
    @Query('limit') limit?: number,
  ): Promise<TransactionStreamDto[]> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return await this.transactionsService.getTransactionStream(user.tenantId, {
      fromDate,
      toDate,
      accountId,
      entityId,
      limit: limit || 100,
    });
  }

  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string, @Request() req) {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return await this.transactionsService.getTransaction(id);
  }

  @Post('transactions/:id/reverse')
  async reverseTransaction(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    const reversalId = await this.transactionsService.reverseTransaction(
      id,
      reason,
    );

    return {
      id: reversalId,
      message: 'Transaction reversed successfully',
      originalTransactionId: id,
      reversalReason: reason,
    };
  }
}
