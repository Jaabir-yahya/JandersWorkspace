import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IntegrationType,
  TenantTier,
  TenantCountry,
  IntegrationConfig,
  SyncRequest,
  SyncResult,
  WebhookResult,
  MpesaConfig,
  MpesaStkPushRequest,
  MpesaStkPushResponse,
  MpesaC2BRequest,
  MpesaB2CRequest,
  IIntegrationService,
  HealthStatus,
  IntegrationError,
} from '../../types/integration.types';

@Injectable()
export class MpesaService implements IIntegrationService {
  name = 'M-Pesa Daraja API';
  type = IntegrationType.MPESA;
  country = TenantCountry.KENYA;
  tier = TenantTier.ADVANCED;

  private readonly logger = new Logger(MpesaService.name);
  private readonly sandboxUrl = 'https://sandbox.safaricom.co.ke';
  private readonly productionUrl = 'https://api.safaricom.co.ke';

  // Real credentials from environment variables
  private get consumerKey(): string {
    return this.configService.get<string>('MPESA_CONSUMER_KEY') || '';
  }

  private get consumerSecret(): string {
    return this.configService.get<string>('MPESA_CONSUMER_SECRET') || '';
  }

  private get passkey(): string {
    return this.configService.get<string>('MPESA_PASSKEY') || '';
  }

  private get environment(): 'sandbox' | 'production' {
    return (
      (this.configService.get<string>('MPESA_ENVIRONMENT') as
        | 'sandbox'
        | 'production') || 'sandbox'
    );
  }

  private get baseUrl(): string {
    return this.environment === 'production'
      ? this.productionUrl
      : this.sandboxUrl;
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async authenticate(config: IntegrationConfig): Promise<boolean> {
    try {
      this.logger.debug('Authenticating M-Pesa integration');

      // Use provided config or fall back to environment variables
      const mpesaConfig = config.config as MpesaConfig;
      const consumerKey = mpesaConfig.consumerKey || this.consumerKey;
      const consumerSecret = mpesaConfig.consumerSecret || this.consumerSecret;

      if (!consumerKey || !consumerSecret) {
        this.logger.error('Missing M-Pesa credentials');
        return false;
      }

      // Test authentication by getting an access token
      const token = await this.getAccessToken(consumerKey, consumerSecret);

      if (token) {
        this.logger.log('M-Pesa authentication successful');
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('M-Pesa authentication error:', error);
      return false;
    }
  }

  private async getAccessToken(
    consumerKey?: string,
    consumerSecret?: string,
  ): Promise<string | null> {
    try {
      const key = consumerKey || this.consumerKey;
      const secret = consumerSecret || this.consumerSecret;

      if (!key || !secret) {
        throw new Error('Missing M-Pesa credentials');
      }

      const auth = Buffer.from(`${key}:${secret}`).toString('base64');

      const response = await fetch(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          method: 'GET',
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('M-Pesa OAuth error:', error);
        return null;
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      this.logger.error('Failed to get M-Pesa access token:', error);
      return null;
    }
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    try {
      return await this.authenticate(config);
    } catch (error) {
      this.logger.error('M-Pesa connection test failed:', error);
      return false;
    }
  }

  async syncData(request: SyncRequest): Promise<SyncResult> {
    // M-Pesa doesn't provide direct transaction querying
    // Relies on webhooks for transaction updates
    return {
      success: true,
      processed: 0,
      errors: ['M-Pesa sync relies on webhooks'],
      lastSyncAt: new Date(),
    };
  }

  async handleWebhook(payload: any): Promise<WebhookResult> {
    try {
      // Store webhook event in database for persistence
      await this.persistWebhookEvent('mpesa', JSON.stringify(payload));

      // Handle STK Push callback
      if (payload.Body?.stkCallback) {
        return this.handleStkPushCallback(payload);
      }

      // Handle C2B payment
      if (payload.TransID) {
        return this.handleC2bCallback(payload);
      }

      return {
        success: false,
        status: 400,
        message: 'Unknown webhook payload structure',
      };
    } catch (error) {
      this.logger.error(
        `Webhook handling failed: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        status: 500,
        message: error.message,
      };
    }
  }

  /**
   * Persist webhook event to database for audit trail and retry logic
   */
  private async persistWebhookEvent(
    eventType: string,
    payload: string,
  ): Promise<void> {
    try {
      // Extract tenant ID from context (would need to be passed in request)
      const tenantId = 'default'; // TODO: Extract from authenticated user

      await this.prismaService.webhookEvent.create({
        data: {
          tenantId,
          source: 'MPESA',
          integrationType: 'MPESA',
          eventType: this.determineEventType(payload),
          payload: JSON.parse(payload),
          processed: false,
          retryCount: 0,
        },
      });

      this.logger.debug(`Webhook event persisted: ${eventType}`);
    } catch (error) {
      this.logger.error(`Failed to persist webhook event: ${error.message}`);
      // Don't throw - webhook processing should continue even if persistence fails
    }
  }

  /**
   * Determine event type from payload structure
   */
  private determineEventType(payload: any): string {
    if (payload.Body?.stkCallback) {
      return 'mpesa.stk_callback';
    }
    if (payload.TransID) {
      return 'mpesa.c2b_payment';
    }
    return 'mpesa.unknown';
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      // Basic health check
      const hasCredentials =
        this.configService.get('MPESA_CONSUMER_KEY') &&
        this.configService.get('MPESA_CONSUMER_SECRET');

      const responseTime = Date.now() - startTime;

      return {
        status: hasCredentials ? 'HEALTHY' : 'DEGRADED',
        lastCheck: new Date(),
        responseTime,
        errorMessage: hasCredentials ? undefined : 'Missing M-Pesa credentials',
      };
    } catch (error) {
      return {
        status: 'UNHEALTHY',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        errorMessage: error.message,
      };
    }
  }

  async initiateStkPush(
    config: IntegrationConfig,
    request: MpesaStkPushRequest,
    transactionId?: string,
  ): Promise<MpesaStkPushResponse> {
    try {
      this.logger.debug(`Initiating STK Push for transaction ${transactionId}`);

      const mpesaConfig = config.config as MpesaConfig;
      const shortcode =
        request.businessShortCode || mpesaConfig.shortcode || 174379; // Default sandbox shortcode
      const passkey = mpesaConfig.passkey || this.passkey;

      if (!passkey) {
        throw new IntegrationError(
          IntegrationType.MPESA,
          'MISSING_PASSKEY',
          'M-Pesa passkey is required',
        );
      }

      // Generate timestamp
      const timestamp = this.generateTimestamp();

      // Generate password
      const password = this.generatePassword(shortcode, passkey, timestamp);

      // Get access token
      const accessToken = await this.getAccessToken(
        mpesaConfig.consumerKey,
        mpesaConfig.consumerSecret,
      );

      if (!accessToken) {
        throw new IntegrationError(
          IntegrationType.MPESA,
          'AUTH_FAILED',
          'Failed to get M-Pesa access token',
        );
      }

      // Format phone number
      const phoneNumber = this.formatPhoneNumber(request.phoneNumber);

      // Build STK Push request
      const stkPayload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: request.transactionType || 'CustomerPayBillOnline',
        Amount: request.amount,
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: request.callBackURL,
        AccountReference: request.accountReference,
        TransactionDesc: request.transactionDesc || 'Payment',
      };

      // Make API call
      const response = await fetch(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(stkPayload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('STK Push error:', errorData);
        throw new IntegrationError(
          IntegrationType.MPESA,
          'STK_PUSH_FAILED',
          errorData.errorMessage || 'Failed to initiate STK Push',
          errorData,
        );
      }

      const data = await response.json();

      this.logger.log(
        `STK Push initiated: ${data.CheckoutRequestID} for ${request.amount} KES`,
      );

      return {
        MerchantRequestID: data.MerchantRequestID,
        CheckoutRequestID: data.CheckoutRequestID,
        ResponseCode: data.ResponseCode,
        ResponseDescription: data.ResponseDescription,
        CustomerMessage: data.CustomerMessage,
      };
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      this.logger.error('STK Push error:', error);
      throw new IntegrationError(
        IntegrationType.MPESA,
        'STK_PUSH_ERROR',
        error.message || 'Failed to initiate STK Push',
      );
    }
  }

  async registerC2bUrls(
    config: IntegrationConfig,
    request: MpesaC2BRequest,
  ): Promise<any> {
    try {
      this.logger.debug('Registering C2B URLs');

      const mpesaConfig = config.config as MpesaConfig;
      const accessToken = await this.getAccessToken(
        mpesaConfig.consumerKey,
        mpesaConfig.consumerSecret,
      );

      if (!accessToken) {
        throw new IntegrationError(
          IntegrationType.MPESA,
          'AUTH_FAILED',
          'Failed to get M-Pesa access token',
        );
      }

      const response = await fetch(`${this.baseUrl}/mpesa/c2b/v1/registerurl`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ShortCode: request.ShortCode,
          ResponseType: request.ResponseType,
          ConfirmationURL: request.ConfirmationURL,
          ValidationURL: request.ValidationURL,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('C2B URL registration error:', errorData);
        throw new IntegrationError(
          IntegrationType.MPESA,
          'C2B_REGISTER_FAILED',
          errorData.errorMessage || 'Failed to register C2B URLs',
          errorData,
        );
      }

      const data = await response.json();
      this.logger.log('C2B URLs registered successfully');

      return data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      this.logger.error('C2B registration error:', error);
      throw new IntegrationError(
        IntegrationType.MPESA,
        'C2B_REGISTER_ERROR',
        error.message || 'Failed to register C2B URLs',
      );
    }
  }

  async sendB2cPayment(
    config: IntegrationConfig,
    request: MpesaB2CRequest,
    transactionId?: string,
  ): Promise<any> {
    try {
      this.logger.debug(`Sending B2C payment for transaction ${transactionId}`);

      const mpesaConfig = config.config as MpesaConfig;
      const accessToken = await this.getAccessToken(
        mpesaConfig.consumerKey,
        mpesaConfig.consumerSecret,
      );

      if (!accessToken) {
        throw new IntegrationError(
          IntegrationType.MPESA,
          'AUTH_FAILED',
          'Failed to get M-Pesa access token',
        );
      }

      const response = await fetch(
        `${this.baseUrl}/mpesa/b2c/v1/paymentrequest`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            InitiatorName: request.InitiatorName,
            SecurityCredential: request.SecurityCredential,
            CommandID: request.CommandID,
            Amount: request.Amount,
            PartyA: request.PartyA,
            PartyB: this.formatPhoneNumber(request.PartyB.toString()),
            Remarks: request.Remarks,
            QueueTimeOutURL: request.QueueTimeOutURL,
            ResultURL: request.ResultURL,
            Occasion: request.Occasion,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('B2C payment error:', errorData);
        throw new IntegrationError(
          IntegrationType.MPESA,
          'B2C_PAYMENT_FAILED',
          errorData.errorMessage || 'Failed to send B2C payment',
          errorData,
        );
      }

      const data = await response.json();
      this.logger.log(`B2C payment initiated: ${data.ConversationID}`);

      return data;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      this.logger.error('B2C payment error:', error);
      throw new IntegrationError(
        IntegrationType.MPESA,
        'B2C_PAYMENT_ERROR',
        error.message || 'Failed to send B2C payment',
      );
    }
  }

  private generateTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private generatePassword(
    shortcode: number,
    passkey: string,
    timestamp: string,
  ): string {
    const data = `${shortcode}${passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }

    // If starts with +, remove it
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    // If doesn't start with 254, add it
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }

    return cleaned;
  }

  private handleStkPushCallback(payload: any): WebhookResult {
    const callback = payload.Body.stkCallback;
    const resultCode = callback.ResultCode;

    if (resultCode === 0) {
      // Success
      const callbackMetadata = callback.CallbackMetadata?.Item || [];
      const amount = callbackMetadata.find(
        (item: any) => item.Name === 'Amount',
      )?.Value;
      const mpesaReceiptNumber = callbackMetadata.find(
        (item: any) => item.Name === 'MpesaReceiptNumber',
      )?.Value;

      console.log(
        `STK Push successful: ${mpesaReceiptNumber} for ${amount} KES`,
      );

      return {
        success: true,
        status: 200,
        data: {
          merchantRequestID: callback.MerchantRequestID,
          checkoutRequestID: callback.CheckoutRequestID,
          amount,
          mpesaReceiptNumber,
        },
      };
    } else {
      // Failure
      console.error(
        `STK Push failed: ${callback.ResultDesc} (Code: ${resultCode})`,
      );

      return {
        success: false,
        status: 400,
        message: callback.ResultDesc,
        data: {
          merchantRequestID: callback.MerchantRequestID,
          checkoutRequestID: callback.CheckoutRequestID,
          resultCode,
          resultDesc: callback.ResultDesc,
        },
      };
    }
  }

  private handleC2bCallback(payload: any): WebhookResult {
    console.log(
      `C2B payment received: ${payload.TransID} for ${payload.TransAmount} KES`,
    );

    return {
      success: true,
      status: 200,
      data: {
        transactionId: payload.TransID,
        amount: payload.TransAmount,
        phoneNumber: payload.MSISDN,
        businessShortCode: payload.BusinessShortCode,
        transactionDate: payload.TransTime,
      },
    };
  }
}
