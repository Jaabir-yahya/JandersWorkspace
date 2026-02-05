"use strict";
/**
 * M-Pesa Integration Service
 * Handles M-Pesa Daraja API integration for mobile money payments
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaService = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
class MpesaService {
    constructor(config) {
        this.name = 'M-Pesa Daraja API';
        this.type = types_1.IntegrationType.MPESA;
        this.country = types_1.TenantCountry.KENYA;
        this.tier = types_1.TenantTier.ADVANCED;
        this.sandboxUrl = 'https://sandbox.safaricom.co.ke';
        this.productionUrl = 'https://api.safaricom.co.ke';
        this.config = null;
        this.connected = false;
        this.axiosInstance = null;
        this.accessToken = null;
        this.tokenExpiry = null;
        if (config) {
            this.config = config;
        }
    }
    /**
     * Initialize the axios instance with base URL
     */
    get baseUrl() {
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.MPESA, 'CONFIG_MISSING', 'Configuration not set');
        }
        return this.config.config.environment === 'PRODUCTION'
            ? this.productionUrl
            : this.sandboxUrl;
    }
    /**
     * Connect to M-Pesa API
     * Authenticates and establishes connection
     */
    async connect() {
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.MPESA, 'CONFIG_MISSING', 'Configuration not set');
        }
        try {
            this.axiosInstance = axios_1.default.create({
                baseURL: this.baseUrl,
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const authenticated = await this.authenticate(this.config);
            this.connected = authenticated;
            return authenticated;
        }
        catch (error) {
            this.connected = false;
            throw new types_1.IntegrationError(types_1.IntegrationType.MPESA, 'CONNECTION_FAILED', error instanceof Error ? error.message : 'Failed to connect to M-Pesa', error);
        }
    }
    /**
     * Disconnect from M-Pesa API
     */
    async disconnect() {
        this.connected = false;
        this.accessToken = null;
        this.tokenExpiry = null;
        this.axiosInstance = null;
    }
    /**
     * Check if currently connected
     */
    isConnected() {
        return this.connected && this.accessToken !== null;
    }
    /**
     * Authenticate with M-Pesa API
     */
    async authenticate(config) {
        const mpesaConfig = config.config;
        if (!mpesaConfig.consumerKey || !mpesaConfig.consumerSecret) {
            throw new types_1.IntegrationError(types_1.IntegrationType.MPESA, 'AUTH_FAILED', 'Missing consumer key or secret');
        }
        try {
            const token = await this.getAccessToken(mpesaConfig.consumerKey, mpesaConfig.consumerSecret);
            if (token) {
                this.accessToken = token;
                this.tokenExpiry = new Date(Date.now() + 3600 * 1000); // Token valid for 1 hour
                return true;
            }
            return false;
        }
        catch (error) {
            throw new types_1.IntegrationError(types_1.IntegrationType.MPESA, 'AUTH_FAILED', error instanceof Error ? error.message : 'Authentication failed', error);
        }
    }
    /**
     * Get OAuth access token from M-Pesa
     */
    async getAccessToken(consumerKey, consumerSecret) {
        const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        const response = await axios_1.default.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });
        if (response.data && response.data.access_token) {
            return response.data.access_token;
        }
        return null;
    }
    /**
     * Ensure valid access token is available
     */
    async ensureValidToken() {
        if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
            if (!this.config) {
                throw new types_1.IntegrationError(types_1.IntegrationType.MPESA, 'CONFIG_MISSING', 'Configuration not set');
            }
            await this.authenticate(this.config);
        }
        if (!this.accessToken) {
            throw new types_1.IntegrationError(types_1.IntegrationType.MPESA, 'AUTH_FAILED', 'Failed to obtain access token');
        }
        return this.accessToken;
    }
    /**
     * Test connection to M-Pesa
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
     * Initiate STK Push payment request
     */
    async initiateStkPush(request) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.MPESA, 'NOT_CONNECTED', 'Not connected to M-Pesa');
        }
        const token = await this.ensureValidToken();
        const timestamp = this.generateTimestamp();
        const password = this.generatePassword(request.businessShortCode, this.config.config.passkey, timestamp);
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
        const response = await axios_1.default.post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
    /**
     * Register C2B URLs
     */
    async registerC2BUrls(request) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.MPESA, 'NOT_CONNECTED', 'Not connected to M-Pesa');
        }
        const token = await this.ensureValidToken();
        const response = await axios_1.default.post(`${this.baseUrl}/mpesa/c2b/v1/registerurl`, request, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
    /**
     * Initiate B2C payment
     */
    async initiateB2C(request) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.MPESA, 'NOT_CONNECTED', 'Not connected to M-Pesa');
        }
        const token = await this.ensureValidToken();
        const response = await axios_1.default.post(`${this.baseUrl}/mpesa/b2c/v1/paymentrequest`, request, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
    /**
     * Query STK Push transaction status
     */
    async queryStkPushStatus(checkoutRequestId) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.MPESA, 'NOT_CONNECTED', 'Not connected to M-Pesa');
        }
        const token = await this.ensureValidToken();
        const timestamp = this.generateTimestamp();
        const password = this.generatePassword(this.config.config.shortcode, this.config.config.passkey, timestamp);
        const payload = {
            BusinessShortCode: this.config.config.shortcode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId,
        };
        const response = await axios_1.default.post(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
    /**
     * Sync data with M-Pesa (placeholder for future implementation)
     */
    async syncData(request) {
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
    async handleWebhook(payload) {
        try {
            // Process M-Pesa callback
            // This would typically update transaction status in the database
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
     * Get health status of M-Pesa integration
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
    /**
     * Generate timestamp in YYYYMMDDHHmmss format
     */
    generateTimestamp() {
        const now = new Date();
        return now.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    }
    /**
     * Generate password for STK Push
     */
    generatePassword(shortcode, passkey, timestamp) {
        const data = `${shortcode}${passkey}${timestamp}`;
        return Buffer.from(data).toString('base64');
    }
}
exports.MpesaService = MpesaService;
exports.default = MpesaService;
