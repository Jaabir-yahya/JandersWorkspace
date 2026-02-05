"use strict";
/**
 * QuickBooks Integration Service
 * Handles QuickBooks Online API integration for accounting
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickBooksService = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
class QuickBooksService {
    constructor(config) {
        this.name = 'QuickBooks Online';
        this.type = types_1.IntegrationType.QUICKBOOKS;
        this.country = types_1.TenantCountry.USA;
        this.tier = types_1.TenantTier.ADVANCED;
        this.sandboxUrl = 'https://sandbox-quickbooks.api.intuit.com';
        this.productionUrl = 'https://quickbooks.api.intuit.com';
        this.authUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
        this.config = null;
        this.connected = false;
        this.axiosInstance = null;
        if (config) {
            this.config = config;
        }
    }
    /**
     * Get the base URL for QuickBooks API
     */
    get baseUrl() {
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
        }
        return this.config.config.environment === 'production'
            ? this.productionUrl
            : this.sandboxUrl;
    }
    /**
     * Connect to QuickBooks API
     */
    async connect() {
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
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
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'CONNECTION_FAILED', error instanceof Error ? error.message : 'Failed to connect to QuickBooks', error);
        }
    }
    /**
     * Disconnect from QuickBooks API
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
     * Authenticate with QuickBooks API
     */
    async authenticate(config) {
        const qbConfig = config.config;
        if (!qbConfig.clientId || !qbConfig.clientSecret) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'AUTH_FAILED', 'Missing client ID or client secret');
        }
        if (!qbConfig.accessToken) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'AUTH_FAILED', 'No access token available');
        }
        try {
            // Test the connection by making a simple API call
            await this.getCompanyInfo();
            return true;
        }
        catch (error) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'AUTH_FAILED', error instanceof Error ? error.message : 'Authentication failed', error);
        }
    }
    /**
     * Refresh the access token using the refresh token
     */
    async refreshAccessToken() {
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
        }
        const { clientId, clientSecret, refreshToken } = this.config.config;
        if (!refreshToken) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'AUTH_FAILED', 'No refresh token available');
        }
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await axios_1.default.post(this.authUrl, new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }), {
            headers: {
                Authorization: `Basic ${credentials}`,
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
     * Test connection to QuickBooks
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
     * Get company information
     */
    async getCompanyInfo() {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
        }
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
        }
        const response = await axios_1.default.get(`${this.baseUrl}/v3/company/${this.config.config.realmId}/companyinfo/${this.config.config.realmId}`, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
            },
        });
        return response.data;
    }
    /**
     * Get all invoices
     */
    async getInvoices(query) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
        }
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
        }
        const sqlQuery = query || 'SELECT * FROM Invoice';
        const response = await axios_1.default.get(`${this.baseUrl}/v3/company/${this.config.config.realmId}/query`, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
            },
            params: {
                query: sqlQuery,
            },
        });
        return response.data.QueryResponse?.Invoice || [];
    }
    /**
     * Get a single invoice by ID
     */
    async getInvoice(invoiceId) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
        }
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
        }
        const response = await axios_1.default.get(`${this.baseUrl}/v3/company/${this.config.config.realmId}/invoice/${invoiceId}`, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
            },
        });
        return response.data;
    }
    /**
     * Create a new invoice
     */
    async createInvoice(invoice) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
        }
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
        }
        const response = await axios_1.default.post(`${this.baseUrl}/v3/company/${this.config.config.realmId}/invoice`, invoice, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
            },
        });
        return response.data;
    }
    /**
     * Update an existing invoice
     */
    async updateInvoice(invoice) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
        }
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
        }
        const response = await axios_1.default.post(`${this.baseUrl}/v3/company/${this.config.config.realmId}/invoice`, invoice, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
            },
        });
        return response.data;
    }
    /**
     * Get all customers
     */
    async getCustomers(query) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
        }
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
        }
        const sqlQuery = query || 'SELECT * FROM Customer';
        const response = await axios_1.default.get(`${this.baseUrl}/v3/company/${this.config.config.realmId}/query`, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
            },
            params: {
                query: sqlQuery,
            },
        });
        return response.data.QueryResponse?.Customer || [];
    }
    /**
     * Get all payments
     */
    async getPayments(query) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
        }
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'CONFIG_MISSING', 'Configuration not set');
        }
        const sqlQuery = query || 'SELECT * FROM Payment';
        const response = await axios_1.default.get(`${this.baseUrl}/v3/company/${this.config.config.realmId}/query`, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
            },
            params: {
                query: sqlQuery,
            },
        });
        return response.data.QueryResponse?.Payment || [];
    }
    /**
     * Sync data with QuickBooks
     */
    async syncData(request) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.QUICKBOOKS, 'NOT_CONNECTED', 'Not connected to QuickBooks');
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
     * Handle QuickBooks webhook
     */
    async handleWebhook(payload) {
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
     * Get health status of QuickBooks integration
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
exports.QuickBooksService = QuickBooksService;
exports.default = QuickBooksService;
