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
import { XeroService } from './xero.service';
import type { XeroConfig, XeroInvoice } from '../types/integration.types';

@Controller('api/v1/integrations/xero')
export class XeroController {
  constructor(private readonly xeroService: XeroService) {}

  @Post('auth/initiate')
  @HttpCode(HttpStatus.OK)
  async initiateAuth(@Request() req: any) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Implement OAuth initiation
    // This would redirect to Xero OAuth flow

    return {
      success: true,
      message: 'OAuth flow initiated',
      tenantId,
      authUrl: 'https://login.xero.com/identity/connect/authorize',
    };
  }

  @Post('auth/callback')
  @HttpCode(HttpStatus.OK)
  async handleAuthCallback(
    @Request() req: any,
    @Body() body: { code: string },
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Exchange authorization code for access token

    return {
      success: true,
      message: 'Authentication successful',
      tenantId,
    };
  }

  @Post('invoices')
  @HttpCode(HttpStatus.CREATED)
  async createInvoice(
    @Request() req: any,
    @Body() invoice: XeroInvoice,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Xero config from tenant configuration
    const config: XeroConfig = {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      environment: 'development',
      tenantId: '',
      accessToken: '',
      refreshToken: '',
    };

    const result = await this.xeroService.createInvoice(config, invoice);

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Get('invoices/:id')
  async getInvoice(@Request() req: any, @Param('id') invoiceId: string) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Xero config from tenant configuration
    const config: XeroConfig = {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      environment: 'development',
      tenantId: '',
      accessToken: '',
      refreshToken: '',
    };

    const result = await this.xeroService.getInvoice(config, invoiceId);

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
    @Body() invoice: Partial<XeroInvoice>,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Xero config from tenant configuration
    const config: XeroConfig = {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      environment: 'development',
      tenantId: '',
      accessToken: '',
      refreshToken: '',
    };

    const result = await this.xeroService.updateInvoice(
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

    // TODO: Retrieve Xero config from tenant configuration
    const config: XeroConfig = {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      environment: 'development',
      tenantId: '',
      accessToken: '',
      refreshToken: '',
    };

    const result = await this.xeroService.deleteInvoice(config, invoiceId);

    return {
      success: result,
      tenantId,
    };
  }

  @Get('contacts')
  async getContacts(
    @Request() req: any,
    @Query('page') page: number = 1,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Xero config from tenant configuration
    const config: XeroConfig = {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      environment: 'development',
      tenantId: '',
      accessToken: '',
      refreshToken: '',
    };

    const result = await this.xeroService.getContacts(config, page);

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Post('contacts')
  @HttpCode(HttpStatus.CREATED)
  async createContact(
    @Request() req: any,
    @Body() contact: any,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Xero config from tenant configuration
    const config: XeroConfig = {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      environment: 'development',
      tenantId: '',
      accessToken: '',
      refreshToken: '',
    };

    const result = await this.xeroService.createContact(config, contact);

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

    const result = await this.xeroService.syncData({
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
    const result = await this.xeroService.handleWebhook(payload);
    return result;
  }

  @Post('token/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() req: any) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve Xero config from tenant configuration
    const config: XeroConfig = {
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      environment: 'development',
      tenantId: '',
      accessToken: '',
      refreshToken: '',
    };

    const result = await this.xeroService.refreshAccessToken(config);

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
    const health = await this.xeroService.getHealthStatus();
    return {
      service: this.xeroService.name,
      ...health,
    };
  }
}
