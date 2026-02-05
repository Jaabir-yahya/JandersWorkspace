"use strict";
/**
 * Xero Integration Service
 * Handles Xero Accounting API integration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XeroService = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
class XeroService {
    constructor(config) {
        this.name = 'Xero Accounting';
        this.type = types_1.IntegrationType.XERO;
        this.country = types_1.TenantCountry.UK;
        this.tier = types_1.TenantTier.ADVANCED;
        this.baseUrl = 'https://api.xero.com/api.xro/2.0';
        this.identityUrl = 'https://api.xero.com/connections';
        this.tokenUrl = 'https://identity.xero.com/connect/token';
        this.config = null;
        this.connected = false;
        this.axiosInstance = null;
        if (config) {
            this.config = config;
        }
    }
    /**
     * Connect to Xero API
     */
    async connect() {
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'CONFIG_MISSING', 'Configuration not set');
        }
        try {
            // Check if we need to refresh the token
            if (this.isTokenExpired()) {
                await this.refreshAccessToken();
            }
            this.axiosInstance = axios_1.default.create({
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
        }
        catch (error) {
            this.connected = false;
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'CONNECTION_FAILED', error instanceof Error ? error.message : 'Failed to connect to Xero', error);
        }
    }
    /**
     * Disconnect from Xero API
     */
    async disconnect() {
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
    isConnected() {
        return this.connected && !this.isTokenExpired();
    }
    /**
     * Check if the access token is expired
     */
    isTokenExpired() {
        if (!this.config?.config.expiresAt) {
            return true;
        }
        return new Date() >= this.config.config.expiresAt;
    }
    /**
     * Authenticate with Xero API
     */
    async authenticate(config) {
        const xeroConfig = config.config;
        if (!xeroConfig.clientId || !xeroConfig.clientSecret) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'AUTH_FAILED', 'Missing client ID or client secret');
        }
        if (!xeroConfig.accessToken) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'AUTH_FAILED', 'No access token available');
        }
        try {
            // Test the connection by getting tenant connections
            await this.getConnections();
            return true;
        }
        catch (error) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'AUTH_FAILED', error instanceof Error ? error.message : 'Authentication failed', error);
        }
    }
    /**
     * Refresh the access token using the refresh token
     */
    async refreshAccessToken() {
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'CONFIG_MISSING', 'Configuration not set');
        }
        const { clientId, clientSecret, refreshToken } = this.config.config;
        if (!refreshToken) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'AUTH_FAILED', 'No refresh token available');
        }
        const response = await axios_1.default.post(this.tokenUrl, new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        if (response.data) {
            this.config.config.accessToken = response.data.access_token;
            this.config.config.refreshToken = response.data.refresh_token;
            this.config.config.expiresAt = new Date(Date.now() + response.data.expires_in * 1000);
        }
    }
    /**
     * Test connection to Xero
     */
    async testConnection(config) {
        try {
            return await this.authenticate(config);
        }
        catch {
            return false;
        }
    }
    /**
     * Get Xero connections (tenants)
     */
    async getConnections() {
        if (!this.config?.config.accessToken) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
        }
        const response = await axios_1.default.get(this.identityUrl, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
            },
        });
        return response.data;
    }
    /**
     * Get all invoices
     */
    async getInvoices(params) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
        }
        if (!this.config?.config.tenantId) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
        }
        const response = await axios_1.default.get(`${this.baseUrl}/Invoices`, {
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
    async getInvoice(invoiceId) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
        }
        if (!this.config?.config.tenantId) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
        }
        const response = await axios_1.default.get(`${this.baseUrl}/Invoices/${invoiceId}`, {
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
    async createInvoice(invoice) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
        }
        if (!this.config?.config.tenantId) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
        }
        const response = await axios_1.default.put(`${this.baseUrl}/Invoices`, { Invoices: [invoice] }, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
                'Xero-tenant-id': this.config.config.tenantId,
            },
        });
        return response.data.Invoices?.[0];
    }
    /**
     * Update an existing invoice
     */
    async updateInvoice(invoice) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
        }
        if (!this.config?.config.tenantId) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
        }
        const response = await axios_1.default.post(`${this.baseUrl}/Invoices`, { Invoices: [invoice] }, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
                'Xero-tenant-id': this.config.config.tenantId,
            },
        });
        return response.data.Invoices?.[0];
    }
    /**
     * Get all contacts
     */
    async getContacts(params) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
        }
        if (!this.config?.config.tenantId) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
        }
        const response = await axios_1.default.get(`${this.baseUrl}/Contacts`, {
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
    async getPayments(params) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
        }
        if (!this.config?.config.tenantId) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
        }
        const response = await axios_1.default.get(`${this.baseUrl}/Payments`, {
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
    async getAccounts() {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
        }
        if (!this.config?.config.tenantId) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'CONFIG_MISSING', 'Xero tenant ID not set');
        }
        const response = await axios_1.default.get(`${this.baseUrl}/Accounts`, {
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
    async syncData(request) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.XERO, 'NOT_CONNECTED', 'Not connected to Xero');
        }
        const errors = [];
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
        }
        catch (error) {
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
    async handleWebhook(payload) {
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
        }
        catch (error) {
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
    async getHealthStatus() {
        const startTime = Date.now();
        try {
            const isHealthy = this.isConnected();
            const responseTime = Date.now() - startTime;
            return {
                status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
                lastCheck: new Date(),
                responseTime,
            };
        }
        catch (error) {
            return {
                status: 'UNHEALTHY',
                lastCheck: new Date(),
                responseTime: Date.now() - startTime,
                errorMessage: error instanceof Error ? error.message : 'Health check failed',
            };
        }
    }
}
exports.XeroService = XeroService;
exports.default = XeroService;
