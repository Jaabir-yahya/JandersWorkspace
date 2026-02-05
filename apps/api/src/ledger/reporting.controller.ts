import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Response,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import type { Response as ExpressResponse } from 'express';

@ApiTags('reporting')
@Controller('reporting')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('trial-balance')
  @ApiOperation({ summary: 'Get trial balance report' })
  @ApiResponse({ status: 200, description: 'Trial balance report' })
  async getTrialBalance(@Request() req) {
    return this.reportingService.getTrialBalance(req.user.tenantId);
  }

  @Get('transaction-history')
  @ApiOperation({ summary: 'Get transaction history (optional: filter by entity or container)' })
  @ApiResponse({ status: 200, description: 'Transaction history report' })
  async getTransactionHistory(
    @Request() req,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('accountType') accountType?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('containerId') containerId?: string,
  ) {
    return this.reportingService.getTransactionHistory(req.user.tenantId, {
      dateFrom,
      dateTo,
      accountType,
      entityType,
      entityId,
      containerId,
    });
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory report' })
  @ApiResponse({ status: 200, description: 'Inventory report' })
  async getInventoryReport(@Request() req) {
    return this.reportingService.getInventoryReport(req.user.tenantId);
  }

  @Get('sales')
  @ApiOperation({ summary: 'Get sales report' })
  @ApiResponse({ status: 200, description: 'Sales report' })
  async getSalesReport(
    @Request() req,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportingService.getSalesReport(req.user.tenantId, {
      dateFrom,
      dateTo,
    });
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Get expense report' })
  @ApiResponse({ status: 200, description: 'Expense report' })
  async getExpenseReport(
    @Request() req,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportingService.getExpenseReport(req.user.tenantId, {
      dateFrom,
      dateTo,
    });
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Get cash flow report' })
  @ApiResponse({ status: 200, description: 'Cash flow report' })
  async getCashFlowReport(
    @Request() req,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportingService.getCashFlowReport(req.user.tenantId, {
      dateFrom,
      dateTo,
    });
  }

  @Get('export/:dataType')
  @ApiOperation({ summary: 'Export data in JSON or CSV format' })
  @ApiResponse({ status: 200, description: 'Exported data' })
  async exportData(
    @Request() req,
    @Response() res: ExpressResponse,
    @Param('dataType')
    dataType:
      | 'transactions'
      | 'inventory'
      | 'supplies'
      | 'invoices'
      | 'payments',
    @Query('format') format: 'json' | 'csv' = 'json',
  ) {
    try {
      const exportResult = await this.reportingService.exportData(
        req.user.tenantId,
        dataType,
        format,
      );

      res.setHeader('Content-Type', exportResult.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${exportResult.filename}"`,
      );
      res.send(exportResult.data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  @Get('dashboard/kpis')
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  @ApiResponse({ status: 200, description: 'Dashboard KPIs' })
  async getDashboardKpis(@Request() req) {
    const tenantId = req.user.tenantId;

    // Get current month's data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      trialBalance,
      transactionHistory,
      inventoryReport,
      salesReport,
      expenseReport,
    ] = await Promise.all([
      this.reportingService.getTrialBalance(tenantId),
      this.reportingService.getTransactionHistory(tenantId, {
        dateFrom: startOfMonth.toISOString(),
        dateTo: endOfMonth.toISOString(),
      }),
      this.reportingService.getInventoryReport(tenantId),
      this.reportingService.getSalesReport(tenantId, {
        dateFrom: startOfMonth.toISOString(),
        dateTo: endOfMonth.toISOString(),
      }),
      this.reportingService.getExpenseReport(tenantId, {
        dateFrom: startOfMonth.toISOString(),
        dateTo: endOfMonth.toISOString(),
      }),
    ]);

    const totalAssets = trialBalance.summary.totalDebits;
    const totalLiabilities = trialBalance.summary.totalCredits;
    const monthlyRevenue = salesReport.summary.totalSales;
    const monthlyExpenses = expenseReport.summary.totalExpenses;
    const netProfit = monthlyRevenue - monthlyExpenses;
    const totalInventoryValue = inventoryReport.summary.totalValue;
    const lowStockItems = inventoryReport.summary.lowStockItems;
    const monthlyTransactions = transactionHistory.summary.totalTransactions;

    return {
      financial: {
        totalAssets,
        totalLiabilities,
        equity: totalAssets - totalLiabilities,
        monthlyRevenue,
        monthlyExpenses,
        netProfit,
        profitMargin:
          monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0,
      },
      operational: {
        totalInventoryItems: inventoryReport.summary.totalItems,
        totalInventoryValue,
        lowStockItems,
        monthlyTransactions,
        averageTransactionValue:
          monthlyTransactions > 0 ? monthlyRevenue / monthlyTransactions : 0,
      },
      cashFlow: {
        monthlyNetCash: netProfit,
        cashFlowPerDay: netProfit / new Date().getDate(),
      },
      alerts: {
        lowStockAlert: lowStockItems > 0,
        profitAlert: netProfit < 0,
        cashFlowAlert: netProfit < 0,
      },
      generatedAt: new Date(),
    };
  }
}
