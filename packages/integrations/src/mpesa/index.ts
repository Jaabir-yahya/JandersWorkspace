/**
 * M-Pesa Integration Service
 * Handles M-Pesa Daraja API integration for mobile money payments
 */

import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
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
  MpesaConfig,
  MpesaStkPushRequest,
  MpesaStkPushResponse,
  MpesaC2BRequest,
  MpesaB2CRequest,
  IntegrationError,
} from '../types';

export interface MpesaServiceConfig extends ServiceConfig {
  config: MpesaConfig;
}

export class MpesaService implements IIntegrationService {
  readonly name = 'M-Pesa Daraja API';
  readonly type = IntegrationType.MPESA;
  readonly country = TenantCountry.KENYA;
  readonly tier = TenantTier.ADVANCED;

  private readonly sandboxUrl = 'https://sandbox.safaricom.co.ke';
  private readonly productionUrl = 'https://api.safaricom.co.ke';

  private config: MpesaServiceConfig | null = null;
  private connected = false;
  private axiosInstance: AxiosInstance | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config?: MpesaServiceConfig) {
    if (config) {
      this.config = config;
    }
  }

  /**
   * Initialize the axios instance with base URL
   */
  private get baseUrl(): string {
    if (!this.config) {
      throw new IntegrationError(IntegrationType.MPESA, 'CONFIG_MISSING', 'Configuration not set');
    }
    return this.config.config.environment === 'PRODUCTION'
      ? this.productionUrl
      : this.sandboxUrl;
  }

  /**
   * Connect to M-Pesa API
   * Authenticates and establishes connection
   */
  async connect(): Promise<boolean> {
    if (!this.config) {
      throw new IntegrationError(IntegrationType.MPESA, 'CONFIG_MISSING', 'Configuration not set');
    }

    try {
      this.axiosInstance = axios.create({
        baseURL: this.baseUrl,
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
        IntegrationType.MPESA,
        'CONNECTION_FAILED',
        error instanceof Error ? error.message : 'Failed to connect to M-Pesa',
        error,
      );
    }
  }

  /**
   * Disconnect from M-Pesa API
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.axiosInstance = null;
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected && this.accessToken !== null;
  }

  /**
   * Authenticate with M-Pesa API
   */
  async authenticate(config: ServiceConfig): Promise<boolean> {
    const mpesaConfig = config.config as MpesaConfig;

    if (!mpesaConfig.consumerKey || !mpesaConfig.consumerSecret) {
      throw new IntegrationError(
        IntegrationType.MPESA,
        'AUTH_FAILED',
        'Missing consumer key or secret',
      );
    }

    try {
      const token = await this.getAccessToken(
        mpesaConfig.consumerKey,
        mpesaConfig.consumerSecret,
      );

      if (token) {
        this.accessToken = token;
        this.tokenExpiry = new Date(Date.now() + 3600 * 1000); // Token valid for 1 hour
        return true;
      }

      return false;
    } catch (error) {
      throw new IntegrationError(
        IntegrationType.MPESA,
        'AUTH_FAILED',
        error instanceof Error ? error.message : 'Authentication failed',
        error,
      );
    }
  }

  /**
   * Get OAuth access token from M-Pesa
   */
  private async getAccessToken(
    consumerKey: string,
    consumerSecret: string,
  ): Promise<string | null> {
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const response = await axios.get(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    if (response.data && response.data.access_token) {
      return response.data.access_token;
    }

    return null;
  }

  /**
   * Ensure valid access token is available
   */
  private async ensureValidToken(): Promise<string> {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      if (!this.config) {
        throw new IntegrationError(IntegrationType.MPESA, 'CONFIG_MISSING', 'Configuration not set');
      }
      await this.authenticate(this.config);
    }

    if (!this.accessToken) {
      throw new IntegrationError(IntegrationType.MPESA, 'AUTH_FAILED', 'Failed to obtain access token');
    }

    return this.accessToken;
  }

  /**
   * Test connection to M-Pesa
   */
  async testConnection(config: ServiceConfig): Promise<boolean> {
    try {
      return await this.authenticate(config);
    } catch {
      return false;
    }
  }

  /**
   * Initiate STK Push payment request
   */
  async initiateStkPush(request: MpesaStkPushRequest): Promise<MpesaStkPushResponse> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.MPESA, 'NOT_CONNECTED', 'Not connected to M-Pesa');
    }

    const token = await this.ensureValidToken();
    const timestamp = this.generateTimestamp();
      const password = this.generatePassword(
        request.businessShortCode,
        this.config!.config.passkey,
        timestamp,
      );

    const payload = {
      BusinessShortCode: request.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: request.transactionType,
      Amount: request.amount,
      PartyA: request.phoneNumber,
      PartyB: request.businessShortCode,
      PhoneNumber: request.phoneNumber,
      CallBackURL: request.callBackURL,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc,
    };

    const response = await axios.post(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  }

  /**
   * Register C2B URLs
   */
  async registerC2BUrls(request: MpesaC2BRequest): Promise<any> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.MPESA, 'NOT_CONNECTED', 'Not connected to M-Pesa');
    }

    const token = await this.ensureValidToken();

    const response = await axios.post(
      `${this.baseUrl}/mpesa/c2b/v1/registerurl`,
      request,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  }

  /**
   * Initiate B2C payment
   */
  async initiateB2C(request: MpesaB2CRequest): Promise<any> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.MPESA, 'NOT_CONNECTED', 'Not connected to M-Pesa');
    }

    const token = await this.ensureValidToken();

    const response = await axios.post(
      `${this.baseUrl}/mpesa/b2c/v1/paymentrequest`,
      request,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  }

  /**
   * Query STK Push transaction status
   */
  async queryStkPushStatus(checkoutRequestId: string): Promise<any> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.MPESA, 'NOT_CONNECTED', 'Not connected to M-Pesa');
    }

    const token = await this.ensureValidToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(
      this.config!.config.shortcode,
      this.config!.config.passkey,
      timestamp,
    );

    const payload = {
      BusinessShortCode: this.config!.config.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await axios.post(
      `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  }

  /**
   * Sync data with M-Pesa (placeholder for future implementation)
   */
  async syncData(request: SyncRequest): Promise<SyncResult> {
    // M-Pesa doesn't support traditional data sync
    // Transactions are processed in real-time via API calls
    return {
      success: true,
      processed: 0,
      errors: [],
      lastSyncAt: new Date(),
    };
  }

  /**
   * Handle M-Pesa webhook
   */
  async handleWebhook(payload: any): Promise<WebhookResult> {
    try {
      // Process M-Pesa callback
      // This would typically update transaction status in the database
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
   * Get health status of M-Pesa integration
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

  /**
   * Generate timestamp in YYYYMMDDHHmmss format
   */
  private generateTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  }

  /**
   * Generate password for STK Push
   */
  private generatePassword(shortcode: number, passkey: string, timestamp: string): string {
    const data = `${shortcode}${passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }
}

export default MpesaService;
