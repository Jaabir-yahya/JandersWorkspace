/**
 * Xero Integration Service
 * Handles Xero Accounting API integration
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
  XeroConfig,
  XeroInvoice,
  IntegrationError,
} from '../types';

export interface XeroServiceConfig extends ServiceConfig {
  config: XeroConfig;
}

export class XeroService implements IIntegrationService {
  readonly name = 'Xero Accounting';
  readonly type = IntegrationType.XERO;
  readonly country = TenantCountry.UK;
  readonly tier = TenantTier.ADVANCED;

  private readonly baseUrl = 'https://api.xero.com/api.xro/2.0';
  private readonly identityUrl = 'https://api.xero.com/connections';
  private readonly tokenUrl = 'https://identity.xero.com/connect/token';

  private config: XeroServiceConfig | null = null;
  private connected = false;
  private axiosInstance: AxiosInstance | null = null;

  constructor(config?: XeroServiceConfig) {
    if (config) {
      this.config = config;
    }
  }

  /**
   * Connect to Xero API
   */
  async connect(): Promise<boolean> {
    if (!this.config) {
      throw new IntegrationError(IntegrationType.XERO, 'CONFIG_MISSING', 'Configuration not set');
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
        IntegrationType.XERO,
        'CONNECTION_FAILED',
        error instanceof Error ? error.message : 'Failed to connect to Xero',
        error,
      );
    }
  }

  /**
   * Disconnect from Xero API
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
   * Authenticate with Xero API
   */
  async authenticate(config: ServiceConfig): Promise<boolean> {
    const xeroConfig = config.config as XeroConfig;

    if (!xeroConfig.clientId || !xeroConfig.clientSecret) {
      throw new IntegrationError(
        IntegrationType.XERO,
        'AUTH_FAILED',
        'Missing client ID or client secret',
      );
    }

    if (!xeroConfig.accessToken) {
      throw new IntegrationError(
        IntegrationType.XERO,
        'AUTH_FAILED',
        'No access token available',
      );
    }

    try {
      // Test the connection by getting tenant connections
      await this.getConnections();
      return true;
    } catch (error) {
      throw new IntegrationError(
        IntegrationType.XERO,
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
      throw new IntegrationError(IntegrationType.XERO, 'CONFIG_MISSING', 'Configuration not set');
    }

    const { clientId, clientSecret, refreshToken } = this.config.config;

    if (!refreshToken) {
      throw new IntegrationError(
        IntegrationType.XERO,
        'AUTH_FAILED',
        'No refresh token available',
      );
    }

    const response = await axios.post(
      this.tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
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
   * Test connection to Xero
   */
  async testConnection(config: ServiceConfig): Promise<boolean> {
    try {
      return await this.authenticate(config);
    } catch {
      return false;
    }
  }

  /**
   * Get Xero connections (tenants)
   */
  async getConnections(): Promise<any[]> {
    if (!this.config?.config.accessToken) {
      throw new IntegrationError(IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
    }

    const response = await axios.get(this.identityUrl, {
      headers: {
        Authorization: `Bearer ${this.config.config.accessToken}`,
      },
    });

    return response.data;
  }

  /**
   * Get all invoices
   */
  async getInvoices(params?: { where?: string; order?: string }): Promise<XeroInvoice[]> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
    }

    if (!this.config?.config.tenantId) {
      throw new IntegrationError(IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
    }

    const response = await axios.get(`${this.baseUrl}/Invoices`, {
      headers: {
        Authorization: `Bearer ${this.config.config.accessToken}`,
        'Xero-tenant-id': this.config.config.tenantId,
      },
      params,
    });

    return response.data.Invoices || [];
  }

  /**
   * Get a single invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<XeroInvoice> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
    }

    if (!this.config?.config.tenantId) {
      throw new IntegrationError(IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
    }

    const response = await axios.get(`${this.baseUrl}/Invoices/${invoiceId}`, {
      headers: {
        Authorization: `Bearer ${this.config.config.accessToken}`,
        'Xero-tenant-id': this.config.config.tenantId,
      },
    });

    return response.data.Invoices?.[0];
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoice: XeroInvoice): Promise<XeroInvoice> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
    }

    if (!this.config?.config.tenantId) {
      throw new IntegrationError(IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
    }

    const response = await axios.put(
      `${this.baseUrl}/Invoices`,
      { Invoices: [invoice] },
      {
        headers: {
          Authorization: `Bearer ${this.config.config.accessToken}`,
          'Xero-tenant-id': this.config.config.tenantId,
        },
      },
    );

    return response.data.Invoices?.[0];
  }

  /**
   * Update an existing invoice
   */
  async updateInvoice(invoice: XeroInvoice): Promise<XeroInvoice> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
    }

    if (!this.config?.config.tenantId) {
      throw new IntegrationError(IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
    }

    const response = await axios.post(
      `${this.baseUrl}/Invoices`,
      { Invoices: [invoice] },
      {
        headers: {
          Authorization: `Bearer ${this.config.config.accessToken}`,
          'Xero-tenant-id': this.config.config.tenantId,
        },
      },
    );

    return response.data.Invoices?.[0];
  }

  /**
   * Get all contacts
   */
  async getContacts(params?: { where?: string; order?: string }): Promise<any[]> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
    }

    if (!this.config?.config.tenantId) {
      throw new IntegrationError(IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
    }

    const response = await axios.get(`${this.baseUrl}/Contacts`, {
      headers: {
        Authorization: `Bearer ${this.config.config.accessToken}`,
        'Xero-tenant-id': this.config.config.tenantId,
      },
      params,
    });

    return response.data.Contacts || [];
  }

  /**
   * Get all payments
   */
  async getPayments(params?: { where?: string; order?: string }): Promise<any[]> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
    }

    if (!this.config?.config.tenantId) {
      throw new IntegrationError(IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
    }

    const response = await axios.get(`${this.baseUrl}/Payments`, {
      headers: {
        Authorization: `Bearer ${this.config.config.accessToken}`,
        'Xero-tenant-id': this.config.config.tenantId,
      },
      params,
    });

    return response.data.Payments || [];
  }

  /**
   * Get chart of accounts
   */
  async getAccounts(): Promise<any[]> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
    }

    if (!this.config?.config.tenantId) {
      throw new IntegrationError(IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
    }

    const response = await axios.get(`${this.baseUrl}/Accounts`, {
      headers: {
        Authorization: `Bearer ${this.config.config.accessToken}`,
        'Xero-tenant-id': this.config.config.tenantId,
      },
    });

    return response.data.Accounts || [];
  }

  /**
   * Sync data with Xero
   */
  async syncData(request: SyncRequest): Promise<SyncResult> {
    if (!this.isConnected()) {
      throw new IntegrationError(IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
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
          // Sync contacts
          const contacts = await this.getContacts();
          processed = contacts.length;
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
   * Handle Xero webhook
   */
  async handleWebhook(payload: any): Promise<WebhookResult> {
    try {
      // Process Xero webhook
      // Xero webhooks notify about:
      // - Contact changes
      // - Invoice changes
      // - Payment changes

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
   * Get health status of Xero integration
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

export default XeroService;
