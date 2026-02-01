import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Request,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { TenantConfigService } from '../integrations/tenant-config.service';
import { MpesaService } from '../integrations/kenya/mpesa/mpesa.service';
import {
  IntegrationType,
  TenantTier,
  IntegrationStatus,
} from '../integrations/types/integration.types';
import type {
  MpesaStkPushDto,
  MpesaC2BRequest,
  MpesaB2CRequest,
} from '../integrations/types/integration.types';

@Controller('api/v1/integrations')
@UseGuards(AuthGuard)
export class IntegrationsController {
  constructor(
    private readonly tenantConfigService: TenantConfigService,
    private readonly mpesaService: MpesaService,
  ) {}

  @Get('features')
  async getAvailableFeatures(@Request() req: any) {
    const tenantId = req.user?.tenantId || 'default';
    return this.tenantConfigService.getAvailableFeatures(tenantId);
  }

  @Get('tenant-features')
  async getTenantFeatures(@Request() req: any) {
    const tenantId = req.user?.tenantId || 'default';
    return this.tenantConfigService.getTenantFeatures(tenantId);
  }

  @Get('config')
  async getTenantConfig(@Request() req: any) {
    const tenantId = req.user?.tenantId || 'default';
    return this.tenantConfigService.getTenantConfig(tenantId);
  }

  @Put('tier')
  async upgradeTier(@Request() req: any, @Body('tier') tier: TenantTier) {
    const tenantId = req.user?.tenantId || 'default';
    return this.tenantConfigService.upgradeTier(tenantId, tier);
  }

  // M-Pesa Integration Endpoints
  @Post('mpesa/stk-push')
  async initiateStkPush(
    @Request() req: any,
    @Body() stkPushDto: MpesaStkPushDto,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // Check if tenant has access to M-Pesa
    await this.tenantConfigService.requireFeatureAccess(
      tenantId,
      'mpesa_integration',
    );

    // Get M-Pesa configuration from environment variables
    const mpesaConfig = {
      consumerKey: process.env.MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      passkey: process.env.MPESA_PASSKEY || '',
      shortcode: parseInt(process.env.MPESA_SHORTCODE || '0', 10),
      callbackUrl: process.env.MPESA_CALLBACK_URL || '',
      environment: process.env.MPESA_ENVIRONMENT || 'SANDBOX',
    };

    const request = {
      businessShortCode: mpesaConfig.shortcode,
      transactionType: 'CustomerPayBillOnline' as const,
      amount: stkPushDto.amount,
      phoneNumber: stkPushDto.phoneNumber,
      callBackURL: mpesaConfig.callbackUrl,
      accountReference: stkPushDto.accountReference,
      transactionDesc: stkPushDto.transactionDesc || 'Payment',
    };

    const config = {
      id: '1',
      tenantId,
      integrationType: IntegrationType.MPESA,
      config: mpesaConfig,
      isActive: true,
      syncStatus: IntegrationStatus.ACTIVE,
      errorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.mpesaService.initiateStkPush(
      config,
      request,
      stkPushDto.transactionId,
    );
  }

  @Post('mpesa/c2b/register')
  async registerC2bUrls(@Request() req: any, @Body() body: MpesaC2BRequest) {
    const tenantId = req.user?.tenantId || 'default';

    await this.tenantConfigService.requireFeatureAccess(tenantId, 'mpesa_c2b');

    const mpesaConfig = {
      consumerKey: process.env.MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      callbackUrl: process.env.MPESA_C2B_CALLBACK_URL || '',
      environment: process.env.MPESA_ENVIRONMENT || 'SANDBOX',
    };

    const config = {
      id: '1',
      tenantId,
      integrationType: IntegrationType.MPESA,
      config: mpesaConfig,
      isActive: true,
      syncStatus: IntegrationStatus.ACTIVE,
      errorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.mpesaService.registerC2bUrls(config, body);
  }

  @Post('mpesa/b2c')
  async sendB2cPayment(
    @Request() req: any,
    @Body() body: MpesaB2CRequest & { transactionId?: string },
  ) {
    const tenantId = req.user?.tenantId || 'default';

    await this.tenantConfigService.requireFeatureAccess(tenantId, 'mpesa_b2c');

    const mpesaConfig = {
      consumerKey: process.env.MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      passkey: process.env.MPESA_PASSKEY || '',
      shortcode: parseInt(process.env.MPESA_SHORTCODE || '0', 10),
      initiatorName: process.env.MPESA_INITIATOR_NAME || '',
      securityCredential: process.env.MPESA_SECURITY_CREDENTIAL || '',
      timeoutUrl: process.env.MPESA_B2C_TIMEOUT_URL || '',
      resultUrl: process.env.MPESA_B2C_RESULT_URL || '',
      environment: process.env.MPESA_ENVIRONMENT || 'SANDBOX',
    };

    const request: MpesaB2CRequest = {
      InitiatorName: mpesaConfig.initiatorName,
      SecurityCredential: mpesaConfig.securityCredential,
      CommandID: 'BusinessPayment',
      Amount: body.Amount,
      PartyA: mpesaConfig.shortcode,
      PartyB: body.PartyB,
      Remarks: body.Remarks,
      QueueTimeOutURL: mpesaConfig.timeoutUrl,
      ResultURL: mpesaConfig.resultUrl,
      Occasion: body.Occasion,
    };

    const config = {
      id: '1',
      tenantId,
      integrationType: IntegrationType.MPESA,
      config: mpesaConfig,
      isActive: true,
      syncStatus: IntegrationStatus.ACTIVE,
      errorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.mpesaService.sendB2cPayment(
      config,
      request,
      body.transactionId,
    );
  }

  @Post('mpesa/webhook')
  @HttpCode(HttpStatus.OK)
  async handleMpesaWebhook(@Body() payload: any) {
    return this.mpesaService.handleWebhook(payload);
  }

  // Integration Configuration Endpoints
  @Put(':integrationType/config')
  async updateIntegrationConfig(
    @Request() req: any,
    @Param('integrationType') integrationType: IntegrationType,
    @Body() config: any,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    await this.tenantConfigService.updateIntegrationConfig(
      tenantId,
      integrationType,
      config,
    );

    return { message: `${integrationType} configuration updated successfully` };
  }

  @Get(':integrationType/config')
  async getIntegrationConfig(
    @Request() req: any,
    @Param('integrationType') integrationType: IntegrationType,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    await this.tenantConfigService.requireFeatureAccess(
      tenantId,
      `${integrationType.toLowerCase()}_sync`,
    );

    return this.tenantConfigService.getIntegrationConfig(
      tenantId,
      integrationType,
    );
  }

  @Post(':integrationType/test')
  async testIntegration(
    @Request() req: any,
    @Param('integrationType') integrationType: IntegrationType,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    await this.tenantConfigService.requireFeatureAccess(
      tenantId,
      `${integrationType.toLowerCase()}_sync`,
    );

    const config = await this.tenantConfigService.getIntegrationConfig(
      tenantId,
      integrationType,
    );

    switch (integrationType) {
      case IntegrationType.MPESA: {
        const mpesaConfig = {
          id: '1',
          tenantId,
          integrationType: IntegrationType.MPESA,
          config: config || {},
          isActive: true,
          syncStatus: IntegrationStatus.ACTIVE,
          errorCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return this.mpesaService.testConnection(mpesaConfig);
      }
      default:
        // Integration temporarily disabled until Phase 4 implementation
        return {
          success: false,
          message: `${integrationType} integration is temporarily disabled. Will be available in Phase 4.`,
        };
    }
  }

  @Get(':integrationType/health')
  async getIntegrationHealth(
    @Request() req: any,
    @Param('integrationType') integrationType: IntegrationType,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    await this.tenantConfigService.requireFeatureAccess(
      tenantId,
      `${integrationType.toLowerCase()}_sync`,
    );

    switch (integrationType) {
      case IntegrationType.MPESA:
        return this.mpesaService.getHealthStatus();
      default:
        return {
          status: 'UNHEALTHY',
          errorMessage: 'Integration not supported',
        };
    }
  }
}
