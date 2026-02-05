/**
 * QuickBooks Integration Service
 * Handles QuickBooks Online API integration for accounting
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
  QuickBooksConfig,
  QuickBooksInvoice,
  IntegrationError,
} from '../types';

export interface QuickBooksServiceConfig extends ServiceConfig {
  config: QuickBooksConfig;
}

export class QuickBooksService implements IIntegrationService {
  readonly name = 'QuickBooks Online';
  readonly type = IntegrationType.QUICKBOOKS;
  readonly country = TenantCountry.USA;
  readonly tier = TenantTier.ADVANCED;

  private readonly sandboxUrl = 'https://sandbox-quickbooks.api.intuit.com';
  private readonly productionUrl = 'https://quickbooks.api.intuit.com';
  private readonly authUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

  private config: QuickBooksServiceConfig | null = null;
  private connected = false;
  private axiosInstance: AxiosInstance | null = null;

  constructor(config?: QuickBooksServiceConfig) {
    if (config) {
      this.config = config;
    }
  }

  /**
   * Get the base URL for QuickBooks API
   */
  private get baseUrl(): string {
    if (!this.config) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
    }
    return this.config.config.environment === 'production'
      ? this.productionUrl
      : this.sandboxUrl;
  }

  /**
   * Connect to QuickBooks API
   */
  async connect(): Promise<boolean> {
    if (!this.config) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
    }

    try {
      // Check if we need to refresh the token
      if (this.isTokenExpired()) {
        await this.refreshAccessToken();
      }

      this.axiosInstance = axios.create({
        baseURL: this.baseUrl,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      const authenticated = await this.authenticate(this.config);
      this.connected = authenticated;
      return authenticated;
    } catch (error) {
      this.connected = false;
      throw new IntegrationError(
        IntegrationType.QUICKBOOKS,
        'CONNECTION_FAILED',
        error instanceof Error ? error.message : 'Failed to connect to QuickBooks',
        error,
      );
    }
  }

  /**
   * Disconnect from QuickBooks API
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.axiosInstance = null;
    if (this.config) {
      this.config.config.accessToken = undefined;
      this.config.config.refreshToken = undefined;
      this.config.config.expiresAt = undefined;
    }
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected && !this.isTokenExpired();
  }

  /**
   * Check if the access token is expired
   */
  private isTokenExpired(): boolean {
    if (!this.config?.config.expiresAt) {
      return true;
    }
    return new Date() >= this.config.config.expiresAt;
  }

  /**
   * Authenticate with QuickBooks API
   */
  async authenticate(config: ServiceConfig): Promise<boolean> {
    const qbConfig = config.config as QuickBooksConfig;

    if (!qbConfig.clientId || !qbConfig.clientSecret) {
      throw new IntegrationError(
        IntegrationType.QUICKBOOKS,
        'AUTH_FAILED',
        'Missing client ID or client secret',
      );
    }

    if (!qbConfig.accessToken) {
      throw new IntegrationError(
        IntegrationType.QUICKBOOKS,
        'AUTH_FAILED',
        'No access token available',
      );
    }

    try {
      // Test the connection by making a simple API call
      await this.getCompanyInfo();
      return true;
    } catch (error) {
      throw new IntegrationError(
        IntegrationType.QUICKBOOKS,
        'AUTH_FAILED',
        error instanceof Error ? error.message : 'Authentication failed',
        error,
      );
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.config) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
    }

    const { clientId, clientSecret, refreshToken } = this.config.config;

    if (!refreshToken) {
      throw new IntegrationError(
        IntegrationType.QUICKBOOKS,
        'AUTH_FAILED',
        'No refresh token available',
      );
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios.post(
      this.authUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (response.data) {
      this.config.config.accessToken = response.data.access_token;
      this.config.config.refreshToken = response.data.refresh_token;
      this.config.config.expiresAt = new Date(Date.now() + response.data.expires_in * 1000);
    }
  }

  /**
   * Test connection to QuickBooks
   */
  async testConnection(config: ServiceConfig): Promise<boolean> {
    try {
      return await this.authenticate(config);
    } catch {
      return false;
    }
  }

  /**
   * Get company information
   */
  async getCompanyInfo(): Promise<any> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
    }

    if (!this.config) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
    }

    const response = await axios.get(
      `${this.baseUrl}/v3/company/${this.config.config.realmId}/companyinfo/${this.config.config.realmId}`,
      {
        headers: {
          Authorization: `Bearer ${this.config.config.accessToken}`,
        },
      },
    );

    return response.data;
  }

  /**
   * Get all invoices
   */
  async getInvoices(query?: string): Promise<QuickBooksInvoice[]> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
    }

    if (!this.config) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
    }

    const sqlQuery = query || 'SELECT * FROM Invoice';

    const response = await axios.get(
      `${this.baseUrl}/v3/company/${this.config.config.realmId}/query`,
      {
        headers: {
          Authorization: `Bearer ${this.config.config.accessToken}`,
        },
        params: {
          query: sqlQuery,
        },
      },
    );

    return response.data.QueryResponse?.Invoice || [];
  }

  /**
   * Get a single invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<QuickBooksInvoice> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
    }

    if (!this.config) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
    }

    const response = await axios.get(
      `${this.baseUrl}/v3/company/${this.config.config.realmId}/invoice/${invoiceId}`,
      {
        headers: {
          Authorization: `Bearer ${this.config.config.accessToken}`,
        },
      },
    );

    return response.data;
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoice: QuickBooksInvoice): Promise<QuickBooksInvoice> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
    }

    if (!this.config) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
    }

    const response = await axios.post(
      `${this.baseUrl}/v3/company/${this.config.config.realmId}/invoice`,
      invoice,
      {
        headers: {
          Authorization: `Bearer ${this.config.config.accessToken}`,
        },
      },
    );

    return response.data;
  }

  /**
   * Update an existing invoice
   */
  async updateInvoice(invoice: QuickBooksInvoice): Promise<QuickBooksInvoice> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
    }

    if (!this.config) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
    }

    const response = await axios.post(
      `${this.baseUrl}/v3/company/${this.config.config.realmId}/invoice`,
      invoice,
      {
        headers: {
          Authorization: `Bearer ${this.config.config.accessToken}`,
        },
      },
    );

    return response.data;
  }

  /**
   * Get all customers
   */
  async getCustomers(query?: string): Promise<any[]> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
    }

    if (!this.config) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
    }

    const sqlQuery = query || 'SELECT * FROM Customer';

    const response = await axios.get(
      `${this.baseUrl}/v3/company/${this.config.config.realmId}/query`,
      {
        headers: {
          Authorization: `Bearer ${this.config.config.accessToken}`,
        },
        params: {
          query: sqlQuery,
        },
      },
    );

    return response.data.QueryResponse?.Customer || [];
  }

  /**
   * Get all payments
   */
  async getPayments(query?: string): Promise<any[]> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
    }

    if (!this.config) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
    }

    const sqlQuery = query || 'SELECT * FROM Payment';

    const response = await axios.get(
      `${this.baseUrl}/v3/company/${this.config.config.realmId}/query`,
      {
        headers: {
          Authorization: `Bearer ${this.config.config.accessToken}`,
        },
        params: {
          query: sqlQuery,
        },
      },
    );

    return response.data.QueryResponse?.Payment || [];
  }

  /**
   * Sync data with QuickBooks
   */
  async syncData(request: SyncRequest): Promise<SyncResult> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
    }

    const errors: string[] = [];
    let processed = 0;

    try {
      switch (request.dataType) {
        case 'TRANSACTIONS':
          // Sync invoices and payments
          const invoices = await this.getInvoices();
          processed = invoices.length;
          break;

        case 'ENTITIES':
          // Sync customers
          const customers = await this.getCustomers();
          processed = customers.length;
          break;

        case 'PAYMENTS':
          // Sync payments
          const payments = await this.getPayments();
          processed = payments.length;
          break;

        default:
          errors.push(`Unsupported data type: ${request.dataType}`);
      }

      return {
        success: errors.length === 0,
        processed,
        errors,
        lastSyncAt: new Date(),
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Sync failed');
      return {
        success: false,
        processed,
        errors,
        lastSyncAt: new Date(),
      };
    }
  }

  /**
   * Handle QuickBooks webhook
   */
  async handleWebhook(payload: any): Promise<WebhookResult> {
    try {
      // Process QuickBooks webhook
      // QuickBooks webhooks notify about:
      // - Entity changes (customers, vendors, employees)
      // - Transaction changes (invoices, payments, etc.)

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
   * Get health status of QuickBooks integration
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

export default QuickBooksService;
