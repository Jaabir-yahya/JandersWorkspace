import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseIntegrationService } from '../common/base-integration.service';
import {
  IntegrationType,
  TenantTier,
  TenantCountry,
  IntegrationConfig,
  SyncRequest,
  SyncResult,
  WebhookResult,
  WhatsAppConfig,
  WhatsAppMessage,
  WhatsAppWebhookPayload,
  IntegrationError,
} from '../types/integration.types';

@Injectable()
export class WhatsAppService extends BaseIntegrationService {
  name = 'WhatsApp Business API';
  type = IntegrationType.WHATSAPP;
  country = TenantCountry.KENYA;
  tier = TenantTier.ADVANCED;

  private readonly apiVersion = 'v18.0';
  private readonly baseUrl = 'https://graph.facebook.com';

  // Real credentials from environment variables
  private get phoneNumberId(): string {
    return this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '';
  }

  private get accessToken(): string {
    return this.configService.get<string>('WHATSAPP_ACCESS_TOKEN') || '';
  }

  private get verifyToken(): string {
    return this.configService.get<string>('WHATSAPP_VERIFY_TOKEN') || '';
  }

  private get appSecret(): string {
    return this.configService.get<string>('WHATSAPP_APP_SECRET') || '';
  }

  constructor(protected readonly configService: ConfigService) {
    super(configService);
  }

  async authenticate(config: IntegrationConfig): Promise<boolean> {
    try {
      this.logger.debug('Authenticating WhatsApp integration');
      const whatsappConfig = config.config as WhatsAppConfig;

      // Use provided config or fall back to environment variables
      const token = whatsappConfig.accessToken || this.accessToken;
      const phoneId = whatsappConfig.phoneNumberId || this.phoneNumberId;

      // Validate required configuration
      if (!token || !phoneId) {
        this.logger.error('Missing required WhatsApp configuration');
        return false;
      }

      // Test the connection by fetching phone number info
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${phoneId}?access_token=${token}`,
      );

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('WhatsApp authentication failed:', error);
        return false;
      }

      const data = await response.json();
      this.logger.log(
        `WhatsApp authentication successful for phone: ${data.display_phone_number}`,
      );
      return true;
    } catch (error) {
      this.logger.error('WhatsApp authentication error:', error);
      return false;
    }
  }

  async syncData(request: SyncRequest): Promise<SyncResult> {
    try {
      this.logger.debug(`Starting WhatsApp sync for tenant: ${request.tenantId}`);
      
      // WhatsApp doesn't support traditional data sync
      // Messages are sent/received via API calls and webhooks
      
      return {
        success: true,
        processed: 0,
        errors: [],
        lastSyncAt: new Date(),
      };
    } catch (error) {
      this.logger.error('WhatsApp sync failed:', error);
      return {
        success: false,
        processed: 0,
        errors: [error.message],
        lastSyncAt: new Date(),
      };
    }
  }

  async handleWebhook(payload: WhatsAppWebhookPayload): Promise<WebhookResult> {
    try {
      this.logger.debug('Processing WhatsApp webhook');

      // Validate webhook payload structure
      if (!payload.object || payload.object !== 'whatsapp_business_account') {
        throw new Error('Invalid webhook payload');
      }

      // Process each entry in the webhook
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            for (const message of change.value.messages) {
              await this.processIncomingMessage(message);
            }
          }
        }
      }

      return {
        success: true,
        status: 200,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error('WhatsApp webhook processing failed:', error);
      return {
        success: false,
        status: 500,
        message: error.message,
      };
    }
  }

  async sendMessage(
    config: WhatsAppConfig,
    message: WhatsAppMessage,
  ): Promise<any> {
    try {
      this.logger.debug(`Sending WhatsApp message to: ${message.to}`);

      // Validate message
      if (!message.to) {
        throw new IntegrationError(
          IntegrationType.WHATSAPP,
          'INVALID_MESSAGE',
          'Recipient phone number is required',
        );
      }

      // Use provided config or fall back to environment variables
      const token = config.accessToken || this.accessToken;
      const phoneId = config.phoneNumberId || this.phoneNumberId;

      if (!token || !phoneId) {
        throw new IntegrationError(
          IntegrationType.WHATSAPP,
          'NOT_CONFIGURED',
          'WhatsApp is not properly configured',
        );
      }

      // Format phone number (remove + if present)
      const formattedPhone = message.to.replace(/^\+/, '');

      // Build the API request
      const url = `${this.baseUrl}/${this.apiVersion}/${phoneId}/messages`;
      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
      };

      // Add text or template
      if (message.text) {
        payload.type = 'text';
        payload.text = {
          body: message.text.body,
          preview_url: true,
        };
      } else if (message.template) {
        payload.type = 'template';
        payload.template = message.template;
      }

      // Make the API call
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('WhatsApp API error:', errorData);
        throw new IntegrationError(
          IntegrationType.WHATSAPP,
          'API_ERROR',
          errorData.error?.message || 'Failed to send WhatsApp message',
          errorData,
        );
      }

      const data = await response.json();

      this.logger.log(
        `WhatsApp message sent to: ${message.to}, ID: ${data.messages?.[0]?.id}`,
      );

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        timestamp: new Date(),
        recipient: data.contacts?.[0]?.wa_id,
      };
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      this.handleError(error, 'MESSAGE_SEND_FAILED');
    }
  }

  async sendTemplateMessage(
    config: WhatsAppConfig,
    to: string,
    templateName: string,
    languageCode: string = 'en',
    components?: any[],
  ): Promise<any> {
    try {
      this.logger.debug(`Sending template message: ${templateName} to: ${to}`);

      const message: WhatsAppMessage = {
        messagingProduct: 'whatsapp',
        to,
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components,
        },
      };

      return await this.sendMessage(config, message);
    } catch (error) {
      this.handleError(error, 'TEMPLATE_SEND_FAILED');
    }
  }

  async verifyWebhookToken(
    token: string,
    challenge: string,
    verifyToken?: string,
  ): Promise<string | null> {
    try {
      this.logger.debug('Verifying webhook token');

      // Use provided verify token or fall back to environment variable
      const expectedToken = verifyToken || this.verifyToken;

      if (!expectedToken) {
        this.logger.error('No verify token configured');
        return null;
      }

      if (token === expectedToken) {
        this.logger.log('Webhook verification successful');
        return challenge;
      }

      this.logger.warn('Webhook verification failed - token mismatch');
      return null;
    } catch (error) {
      this.logger.error('Webhook verification error:', error);
      return null;
    }
  }

  private async processIncomingMessage(message: any): Promise<void> {
    try {
      this.logger.debug(`Processing incoming message from: ${message.from}`);

      // TODO: Implement message processing logic
      // - Store message in database
      // - Trigger business logic (e.g., payment reminders)
      // - Send automated responses if configured

      if (message.text) {
        this.logger.log(`Received text message: ${message.text.body}`);
      }
    } catch (error) {
      this.logger.error('Failed to process incoming message:', error);
      throw error;
    }
  }

  protected async performHealthCheck(): Promise<boolean> {
    try {
      // TODO: Implement actual health check
      // This could involve checking WhatsApp API status
      // or validating the connection
      return true;
    } catch (error) {
      this.logger.error('WhatsApp health check failed:', error);
      return false;
    }
  }
}
