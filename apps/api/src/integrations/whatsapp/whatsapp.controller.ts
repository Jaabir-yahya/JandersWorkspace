import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
import { WebhookConfigDto } from './dto/webhook-config.dto';
import {
  WhatsAppConfig,
  WhatsAppMessage,
} from '../types/integration.types';

@Controller('api/v1/integrations/whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Request() req: any,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve WhatsApp config from tenant configuration
    const config: WhatsAppConfig = {
      phoneNumberId: '',
      accessToken: '',
      webhookVerifyToken: '',
      version: 'v18.0',
      baseUrl: 'https://graph.facebook.com',
    };

    const message: WhatsAppMessage = {
      messagingProduct: 'whatsapp',
      to: sendMessageDto.to,
      text: sendMessageDto.type === 'text' ? {
        body: sendMessageDto.content.body || '',
      } : undefined,
      template: sendMessageDto.type === 'template' ? {
        name: sendMessageDto.content.templateName || '',
        language: {
          code: sendMessageDto.content.templateData?.language || 'en',
        },
        components: sendMessageDto.content.templateData?.components,
      } : undefined,
    };

    const result = await this.whatsappService.sendMessage(config, message);
    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Post('send-template')
  @HttpCode(HttpStatus.OK)
  async sendTemplateMessage(
    @Request() req: any,
    @Body() body: {
      to: string;
      templateName: string;
      languageCode?: string;
      components?: any[];
    },
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Retrieve WhatsApp config from tenant configuration
    const config: WhatsAppConfig = {
      phoneNumberId: '',
      accessToken: '',
      webhookVerifyToken: '',
      version: 'v18.0',
      baseUrl: 'https://graph.facebook.com',
    };

    const result = await this.whatsappService.sendTemplateMessage(
      config,
      body.to,
      body.templateName,
      body.languageCode,
      body.components,
    );

    return {
      success: true,
      data: result,
      tenantId,
    };
  }

  @Get('webhook')
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    // TODO: Retrieve verify token from configuration
    const verifyToken = 'your-webhook-verify-token';

    if (mode === 'subscribe') {
      const result = await this.whatsappService.verifyWebhookToken(
        token,
        challenge,
        verifyToken,
      );

      if (result) {
        return challenge;
      }
    }

    return { success: false, message: 'Verification failed' };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    const result = await this.whatsappService.handleWebhook(payload);
    return result;
  }

  @Post('config')
  @HttpCode(HttpStatus.OK)
  async configureWebhook(
    @Request() req: any,
    @Body() configDto: WebhookConfigDto,
  ) {
    const tenantId = req.user?.tenantId || 'default';

    // TODO: Store webhook configuration
    // This would typically save to the database

    return {
      success: true,
      message: 'Webhook configuration saved',
      tenantId,
      config: configDto,
    };
  }

  @Get('health')
  async getHealthStatus() {
    const health = await this.whatsappService.getHealthStatus();
    return {
      service: this.whatsappService.name,
      ...health,
    };
  }
}
