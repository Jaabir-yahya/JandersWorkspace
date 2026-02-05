import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { AuthGuard, getAuthenticatedUser } from '../auth/auth.guard';
import { ReportingService } from './reporting.service';
import type {
  FinancialSummaryDto,
  BalanceSheetDto,
  TrialBalanceDto,
} from './reporting.service';

@Controller('reporting')
@UseGuards(AuthGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('trial-balance')
  @ApiOperation({ summary: 'Get trial balance' })
  async getTrialBalance(
    @Request() req,
    @Query('asOfDate') asOfDate?: string,
    @Query('accountType') accountType?: string,
  ): Promise<TrialBalanceDto[]> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.reportingService.getTrialBalance(user.tenantId, {
      asOfDate,
      accountType,
    });
  }

  @Get('financial-summary')
  @ApiOperation({ summary: 'Get financial summary' })
  async getFinancialSummary(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<FinancialSummaryDto> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.reportingService.getFinancialSummary(user.tenantId, {
      startDate,
      endDate,
    });
  }

  @Get('balance-sheet')
  @ApiOperation({ summary: 'Get balance sheet' })
  async getBalanceSheet(
    @Request() req,
    @Query('asOfDate') asOfDate?: string,
  ): Promise<BalanceSheetDto> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.reportingService.getBalanceSheet(user.tenantId, {
      asOfDate,
    });
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactionHistory(
    @Request() req,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('accountId') accountId?: string,
    @Query('limit') limit?: number,
  ): Promise<any[]> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.reportingService.getTransactionHistory(user.tenantId, {
      fromDate,
      toDate,
      accountId,
      limit: limit || 100,
    });
  }

  @Get('export')
  @ApiOperation({ summary: 'Export financial data' })
  async exportData(
    @Request() req,
    @Query('type')
    type:
      | 'transactions'
      | 'trial_balance'
      | 'financial_summary'
      | 'balance_sheet',
    @Res() res: any,
    @Query('format') format: 'json' | 'csv' = 'json',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<void> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    const data = await this.reportingService.exportData(
      user.tenantId,
      type,
      format,
      { fromDate, toDate },
    );

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${type}_${new Date().toISOString().split('T')[0]}.csv"`,
      );
      return res.send(data);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.json(data);
  }
}

// Helper decorator for Swagger documentation
function ApiOperation(options: { summary: string }) {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    // This is a placeholder for @ApiOperation decorator
    // In a real implementation, you would use @nestjs/swagger
  };
}
