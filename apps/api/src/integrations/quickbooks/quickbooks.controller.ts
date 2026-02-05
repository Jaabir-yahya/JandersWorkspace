import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { QuickBooksService } from './quickbooks.service';
import { SyncTransactionDto } from './dto/sync-transaction.dto';
import type {
  QuickBooksConfig,
  QuickBooksInvoice,
} from '../types/integration.types';

@Controller('api/v1/integrations/quickbooks')
export class QuickBooksController {
  constructor(private readonly quickbooksService: QuickBooksService) {}

  @Post('auth/initiate')
  @HttpCode(HttpStatus.OK)
  async initiateAuth(@Request() req: any) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Implement OAuth initiation
    // This would redirect to QuickBooks OAuth flow

    return {
      success: true,
      message: 'OAuth flow initiated',
      tenantId,
      authUrl: 'https://appcenter.intuit.com/connect/oauth2',
    };
  }

  @Post('auth/callback')
  @HttpCode(HttpStatus.OK)
  async handleAuthCallback(
    @Request() req: any,
    @Body() body: { code: string; realmId: string },
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Exchange authorization code for access token

    return {
      success: true,
      message: 'Authentication successful',
      tenantId,
      realmId: body.realmId,
    };
  }

  @Post('invoices')
  @HttpCode(HttpStatus.CREATED)
  async createInvoice(@Request() req: any, @Body() invoice: QuickBooksInvoice) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve QuickBooks config from tenant configuration
    const config: QuickBooksConfig = {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      environment: 'sandbox',
      realmId: '',
      accessToken: '',
      refreshToken: '',
    };

    const result = await this.quickbooksService.createInvoice(config, invoice);

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Get('invoices/:id')
  async getInvoice(@Request() req: any, @Param('id') invoiceId: string) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve QuickBooks config from tenant configuration
    const config: QuickBooksConfig = {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      environment: 'sandbox',
      realmId: '',
      accessToken: '',
      refreshToken: '',
    };

    const result = await this.quickbooksService.getInvoice(config, invoiceId);

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Post('invoices/:id')
  @HttpCode(HttpStatus.OK)
  async updateInvoice(
    @Request() req: any,
    @Param('id') invoiceId: string,
    @Body() invoice: Partial<QuickBooksInvoice>,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve QuickBooks config from tenant configuration
    const config: QuickBooksConfig = {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      environment: 'sandbox',
      realmId: '',
      accessToken: '',
      refreshToken: '',
    };

    const result = await this.quickbooksService.updateInvoice(
      config,
      invoiceId,
      invoice,
    );

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Post('invoices/:id/delete')
  @HttpCode(HttpStatus.OK)
  async deleteInvoice(@Request() req: any, @Param('id') invoiceId: string) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve QuickBooks config from tenant configuration
    const config: QuickBooksConfig = {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      environment: 'sandbox',
      realmId: '',
      accessToken: '',
      refreshToken: '',
    };

    const result = await this.quickbooksService.deleteInvoice(
      config,
      invoiceId,
    );

    return {
      success: result,
      tenantId,
    };
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncTransaction(
    @Request() req: any,
    @Body() syncDto: SyncTransactionDto,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve QuickBooks config from tenant configuration
    const config: QuickBooksConfig = {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      environment: 'sandbox',
      realmId: '',
      accessToken: '',
      refreshToken: '',
    };

    const result = await this.quickbooksService.syncTransaction(
      config,
      syncDto.transaction,
    );

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Post('sync/bulk')
  @HttpCode(HttpStatus.OK)
  async syncBulk(
    @Request() req: any,
    @Body() body: { dataType: 'TRANSACTIONS' | 'ENTITIES' | 'PAYMENTS' },
  ) {
    const tenantId = req.user?.tenantId || 'default';

    const result = await this.quickbooksService.syncData({
      tenantId,
      type: 'OUTBOUND',
      dataType: body.dataType,
    });

    return {
      success: result.success,
      data: result,
      tenantId,
    };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    const result = await this.quickbooksService.handleWebhook(payload);
    return result;
  }

  @Post('token/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() req: any) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve QuickBooks config from tenant configuration
    const config: QuickBooksConfig = {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      environment: 'sandbox',
      realmId: '',
      accessToken: '',
      refreshToken: '',
    };

    const result = await this.quickbooksService.refreshAccessToken(config);

    return {
      success: true,
      data: {
        expiresAt: result.expiresAt,
      },
      tenantId,
    };
  }

  @Get('health')
  async getHealthStatus() {
    const health = await this.quickbooksService.getHealthStatus();
    return {
      service: this.quickbooksService.name,
      ...health,
    };
  }
}
