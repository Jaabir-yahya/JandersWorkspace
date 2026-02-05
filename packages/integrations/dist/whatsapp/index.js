"use strict";
/**
 * WhatsApp Integration Service
 * Handles WhatsApp Business API integration for messaging
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
class WhatsAppService {
    constructor(config) {
        this.name = 'WhatsApp Business API';
        this.type = types_1.IntegrationType.WHATSAPP;
        this.country = types_1.TenantCountry.KENYA;
        this.tier = types_1.TenantTier.ADVANCED;
        this.defaultApiVersion = 'v18.0';
        this.defaultBaseUrl = 'https://graph.facebook.com';
        this.config = null;
        this.connected = false;
        this.axiosInstance = null;
        if (config) {
            this.config = config;
        }
    }
    /**
     * Get the base URL for WhatsApp API
     */
    get baseUrl() {
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
        }
        return this.config.config.baseUrl || this.defaultBaseUrl;
    }
    /**
     * Get the API version
     */
    get apiVersion() {
        return this.config?.config.version || this.defaultApiVersion;
    }
    /**
     * Connect to WhatsApp Business API
     */
    async connect() {
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
        }
        try {
            this.axiosInstance = axios_1.default.create({
                baseURL: `${this.baseUrl}/${this.apiVersion}`,
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
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'CONNECTION_FAILED', error instanceof Error ? error.message : 'Failed to connect to WhatsApp', error);
        }
    }
    /**
     * Disconnect from WhatsApp API
     */
    async disconnect() {
        this.connected = false;
        this.axiosInstance = null;
    }
    /**
     * Check if currently connected
     */
    isConnected() {
        return this.connected;
    }
    /**
     * Authenticate with WhatsApp Business API
     */
    async authenticate(config) {
        const whatsappConfig = config.config;
        if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'AUTH_FAILED', 'Missing access token or phone number ID');
        }
        try {
            // Test the connection by fetching phone number info
            const response = await axios_1.default.get(`${this.baseUrl}/${this.apiVersion}/${whatsappConfig.phoneNumberId}`, {
                headers: {
                    Authorization: `Bearer ${whatsappConfig.accessToken}`,
                },
            });
            if (response.data) {
                return true;
            }
            return false;
        }
        catch (error) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'AUTH_FAILED', error instanceof Error ? error.message : 'Authentication failed', error);
        }
    }
    /**
     * Test connection to WhatsApp
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
     * Send a text message
     */
    async sendTextMessage(to, message) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'NOT_CONNECTED', 'Not connected to WhatsApp');
        }
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
        }
        const payload = {
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
    async sendTemplateMessage(to, templateName, languageCode, components) {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'NOT_CONNECTED', 'Not connected to WhatsApp');
        }
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
        }
        const payload = {
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
    async sendMessage(message) {
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
        }
        const response = await axios_1.default.post(`${this.baseUrl}/${this.apiVersion}/${this.config.config.phoneNumberId}/messages`, message, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    /**
     * Get phone number information
     */
    async getPhoneNumberInfo() {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'NOT_CONNECTED', 'Not connected to WhatsApp');
        }
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
        }
        const response = await axios_1.default.get(`${this.baseUrl}/${this.apiVersion}/${this.config.config.phoneNumberId}`, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
            },
        });
        return response.data;
    }
    /**
     * Get message templates
     */
    async getMessageTemplates() {
        if (!this.isConnected()) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'NOT_CONNECTED', 'Not connected to WhatsApp');
        }
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
        }
        const wabaId = await this.getWABAId();
        const response = await axios_1.default.get(`${this.baseUrl}/${this.apiVersion}/${wabaId}/message_templates`, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
            },
        });
        return response.data;
    }
    /**
     * Get WhatsApp Business Account ID
     */
    async getWABAId() {
        if (!this.config) {
            throw new types_1.IntegrationError(types_1.IntegrationType.WHATSAPP, 'CONFIG_MISSING', 'Configuration not set');
        }
        const response = await axios_1.default.get(`${this.baseUrl}/${this.apiVersion}/${this.config.config.phoneNumberId}`, {
            headers: {
                Authorization: `Bearer ${this.config.config.accessToken}`,
            },
        });
        return response.data.waba_id;
    }
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload, signature, appSecret) {
        const expectedSignature = crypto
            .createHmac('sha256', appSecret)
            .update(payload, 'utf8')
            .digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    }
    /**
     * Sync data with WhatsApp (placeholder for future implementation)
     * WhatsApp doesn't support traditional data sync
     */
    async syncData(request) {
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
    async handleWebhook(payload) {
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
     * Get health status of WhatsApp integration
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
exports.WhatsAppService = WhatsAppService;
// Import crypto for webhook signature verification
const crypto = __importStar(require("crypto"));
exports.default = WhatsAppService;
