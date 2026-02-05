import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import {
  CreateTransactionDto,
  CreateDoubleEntryTransactionDto,
  TransactionDto,
} from './dto/transaction.dto';

@ApiTags('transactions')
@Controller('transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('double-entry')
  @ApiOperation({ summary: 'Create double-entry transaction' })
  @ApiResponse({
    status: 201,
    description: 'Double-entry transaction created successfully',
  })
  async createDoubleEntry(
    @Request() req,
    @Body() createDoubleEntryDto: CreateDoubleEntryTransactionDto,
  ) {
    return this.transactionsService.createDoubleEntry(
      req.user.tenantId,
      req.user.userId,
      createDoubleEntryDto,
    );
  }

  @Post(':transactionPairId/reverse')
  @ApiOperation({ summary: 'Reverse double-entry transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction reversed successfully',
  })
  async reverseDoubleEntry(
    @Request() req,
    @Param('transactionPairId') transactionPairId: string,
  ) {
    return this.transactionsService.reverseDoubleEntry(
      req.user.tenantId,
      req.user.userId,
      transactionPairId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({
    status: 200,
    description: 'List of all transactions',
    type: [TransactionDto],
  })
  async findAll(
    @Request() req,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('accountType') accountType?: string,
    @Query('entityType') entityType?: string,
    @Query('entityName') entityName?: string,
  ): Promise<TransactionDto[]> {
    return this.transactionsService.findMany(req.user.tenantId, {
      dateFrom,
      dateTo,
      accountType,
      entityType,
      entityName,
    });
  }

  @Get('history')
  @ApiOperation({ summary: 'Get transaction history grouped by pairs' })
  @ApiResponse({
    status: 200,
    description: 'Transaction history grouped by transaction pairs',
  })
  async getTransactionHistory(
    @Request() req,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('accountType') accountType?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.transactionsService.getTransactionHistory(req.user.tenantId, {
      dateFrom,
      dateTo,
      accountType,
      entityType,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction details',
    type: TransactionDto,
  })
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<TransactionDto> {
    return this.transactionsService.findOne(req.user.tenantId, id);
  }
}
