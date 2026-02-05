/**
 * WhatsApp Integration Service
 * Handles WhatsApp Business API integration for messaging
 */

import axios, { AxiosInstance } from 'axios';
import {
  IIntegrationService,
  ServiceConfig,
  IntegrationType,
  TenantCountry,
  TenantTier,
  SyncRequest,
  SyncResult,
  WebhookResult,
  HealthStatus,
  WhatsAppConfig,
  WhatsAppMessage,
  WhatsAppWebhookPayload,
  IntegrationError,
} from '../types';

export interface WhatsAppServiceConfig extends ServiceConfig {
  config: WhatsAppConfig;
}

export class WhatsAppService implements IIntegrationService {
  readonly name = 'WhatsApp Business API';
  readonly type = IntegrationType.WHATSAPP;
  readonly country = TenantCountry.KENYA;
  readonly tier = TenantTier.ADVANCED;

  private readonly defaultApiVersion = 'v18.0';
  private readonly defaultBaseUrl = 'https://graph.facebook.com';

  private config: WhatsAppServiceConfig | null = null;
  private connected = false;
  private axiosInstance: AxiosInstance | null = null;

  constructor(config?: WhatsAppServiceConfig) {
    if (config) {
      this.config = config;
    }
  }

  /**
   * Get the base URL for WhatsApp API
   */
  private get baseUrl(): string {
    if (!this.config) {
      throw new IntegrationError(IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
    }
    return this.config.config.baseUrl || this.defaultBaseUrl;
  }

  /**
   * Get the API version
   */
  private get apiVersion(): string {
    return this.config?.config.version || this.defaultApiVersion;
  }

  /**
   * Connect to WhatsApp Business API
   */
  async connect(): Promise<boolean> {
    if (!this.config) {
      throw new IntegrationError(IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
    }

    try {
      this.axiosInstance = axios.create({
        baseURL: `${this.baseUrl}/${this.apiVersion}`,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const authenticated = await this.authenticate(this.config);
      this.connected = authenticated;
      return authenticated;
    } catch (error) {
      this.connected = false;
      throw new IntegrationError(
        IntegrationType.WHATSAPP,
        'CONNECTION_FAILED',
        error instanceof Error ? error.message : 'Failed to connect to WhatsApp',
        error,
      );
    }
  }

  /**
   * Disconnect from WhatsApp API
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.axiosInstance = null;
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Authenticate with WhatsApp Business API
   */
  async authenticate(config: ServiceConfig): Promise<boolean> {
    const whatsappConfig = config.config as WhatsAppConfig;

    if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
      throw new IntegrationError(
        IntegrationType.WHATSAPP,
        'AUTH_FAILED',
        'Missing access token or phone number ID',
      );
    }

    try {
      // Test the connection by fetching phone number info
      const response = await axios.get(
        `${this.baseUrl}/${this.apiVersion}/${whatsappConfig.phoneNumberId}`,
        {
          headers: {
            Authorization: `Bearer ${whatsappConfig.accessToken}`,
          },
        },
      );

      if (response.data) {
        return true;
      }

      return false;
    } catch (error) {
      throw new IntegrationError(
        IntegrationType.WHATSAPP,
        'AUTH_FAILED',
        error instanceof Error ? error.message : 'Authentication failed',
        error,
      );
    }
  }

  /**
   * Test connection to WhatsApp
   */
  async testConnection(config: ServiceConfig): Promise<boolean> {
    try {
      return await this.authenticate(config);
    } catch {
      return false;
    }
  }

  /**
   * Send a text message
   */
  async sendTextMessage(to: string, message: string): Promise<any> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.WHATSAPP, 'NOT_CONNECTED', 'Not connected to WhatsApp');
    }

    if (!this.config) {
      throw new IntegrationError(IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
    }

    const payload: WhatsAppMessage = {
      messagingProduct: 'whatsapp',
      to,
      text: {
        body: message,
      },
    };

    return this.sendMessage(payload);
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    components?: any[],
  ): Promise<any> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.WHATSAPP, 'NOT_CONNECTED', 'Not connected to WhatsApp');
    }

    if (!this.config) {
      throw new IntegrationError(IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
    }

    const payload: WhatsAppMessage = {
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

    return this.sendMessage(payload);
  }

  /**
   * Send a message via WhatsApp API
   */
  private async sendMessage(message: WhatsAppMessage): Promise<any> {
    if (!this.config) {
      throw new IntegrationError(IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
    }

    const response = await axios.post(
      `${this.baseUrl}/${this.apiVersion}/${this.config.config.phoneNumberId}/messages`,
      message,
      {
        headers: {
          Authorization: `Bearer ${this.config.config.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  }

  /**
   * Get phone number information
   */
  async getPhoneNumberInfo(): Promise<any> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.WHATSAPP, 'NOT_CONNECTED', 'Not connected to WhatsApp');
    }

    if (!this.config) {
      throw new IntegrationError(IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
    }

    const response = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${this.config.config.phoneNumberId}`,
      {
        headers: {
          Authorization: `Bearer ${this.config.config.accessToken}`,
        },
      },
    );

    return response.data;
  }

  /**
   * Get message templates
   */
  async getMessageTemplates(): Promise<any> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.WHATSAPP, 'NOT_CONNECTED', 'Not connected to WhatsApp');
    }

    if (!this.config) {
      throw new IntegrationError(IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
    }

    const wabaId = await this.getWABAId();

    const response = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${wabaId}/message_templates`,
      {
        headers: {
          Authorization: `Bearer ${this.config.config.accessToken}`,
        },
      },
    );

    return response.data;
  }

  /**
   * Get WhatsApp Business Account ID
   */
  private async getWABAId(): Promise<string> {
    if (!this.config) {
      throw new IntegrationError(IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
    }

    const response = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${this.config.config.phoneNumberId}`,
      {
        headers: {
          Authorization: `Bearer ${this.config.config.accessToken}`,
        },
      },
    );

    return response.data.waba_id;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, appSecret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(payload, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex'),
    );
  }

  /**
   * Sync data with WhatsApp (placeholder for future implementation)
   * WhatsApp doesn't support traditional data sync
   */
  async syncData(request: SyncRequest): Promise<SyncResult> {
    // WhatsApp doesn't support traditional data sync
    // Messages are sent/received via API calls and webhooks
    return {
      success: true,
      processed: 0,
      errors: [],
      lastSyncAt: new Date(),
    };
  }

  /**
   * Handle WhatsApp webhook
   */
  async handleWebhook(payload: WhatsAppWebhookPayload): Promise<WebhookResult> {
    try {
      // Process WhatsApp webhook
      // This would typically handle incoming messages, status updates, etc.
      if (payload.object === 'whatsapp_business_account') {
        for (const entry of payload.entry) {
          for (const change of entry.changes) {
            // Process messages
            if (change.value.messages) {
              // Handle incoming messages
            }
          }
        }
      }

      return {
        success: true,
        status: 200,
        message: 'Webhook processed successfully',
        data: payload,
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : 'Webhook processing failed',
      };
    }
  }

  /**
   * Get health status of WhatsApp integration
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      const isHealthy = this.isConnected();
      const responseTime = Date.now() - startTime;

      return {
        status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
        lastCheck: new Date(),
        responseTime,
      };
    } catch (error) {
      return {
        status: 'UNHEALTHY',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }
}

// Import crypto for webhook signature verification
import * as crypto from 'crypto';

export default WhatsAppService;
