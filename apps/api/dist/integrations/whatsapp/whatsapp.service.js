"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const base_integration_service_1 = require("../common/base-integration.service");
const integration_types_1 = require("../types/integration.types");
let WhatsAppService = class WhatsAppService extends base_integration_service_1.BaseIntegrationService {
    configService;
    name = 'WhatsApp Business API';
    type = integration_types_1.IntegrationType.WHATSAPP;
    country = integration_types_1.TenantCountry.KENYA;
    tier = integration_types_1.TenantTier.ADVANCED;
    apiVersion = 'v18.0';
    baseUrl = 'https://graph.facebook.com';
    get phoneNumberId() {
        return this.configService.get('WHATSAPP_PHONE_NUMBER_ID') || '';
    }
    get accessToken() {
        return this.configService.get('WHATSAPP_ACCESS_TOKEN') || '';
    }
    get verifyToken() {
        return this.configService.get('WHATSAPP_VERIFY_TOKEN') || '';
    }
    get appSecret() {
        return this.configService.get('WHATSAPP_APP_SECRET') || '';
    }
    constructor(configService) {
        super(configService);
        this.configService = configService;
    }
    async authenticate(config) {
        try {
            this.logger.debug('Authenticating WhatsApp integration');
            const whatsappConfig = config.config;
            const token = whatsappConfig.accessToken || this.accessToken;
            const phoneId = whatsappConfig.phoneNumberId || this.phoneNumberId;
            if (!token || !phoneId) {
                this.logger.error('Missing required WhatsApp configuration');
                return false;
            }
            const response = await fetch(`${this.baseUrl}/${this.apiVersion}/${phoneId}?access_token=${token}`);
            if (!response.ok) {
                const error = await response.json();
                this.logger.error('WhatsApp authentication failed:', error);
                return false;
            }
            const data = await response.json();
            this.logger.log(`WhatsApp authentication successful for phone: ${data.display_phone_number}`);
            return true;
        }
        catch (error) {
            this.logger.error('WhatsApp authentication error:', error);
            return false;
        }
    }
    async syncData(request) {
        try {
            this.logger.debug(`Starting WhatsApp sync for tenant: ${request.tenantId}`);
            return {
                success: true,
                processed: 0,
                errors: [],
                lastSyncAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error('WhatsApp sync failed:', error);
            return {
                success: false,
                processed: 0,
                errors: [error.message],
                lastSyncAt: new Date(),
            };
        }
    }
    async handleWebhook(payload) {
        try {
            this.logger.debug('Processing WhatsApp webhook');
            if (!payload.object || payload.object !== 'whatsapp_business_account') {
                throw new Error('Invalid webhook payload');
            }
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
        }
        catch (error) {
            this.logger.error('WhatsApp webhook processing failed:', error);
            return {
                success: false,
                status: 500,
                message: error.message,
            };
        }
    }
    async sendMessage(config, message) {
        try {
            this.logger.debug(`Sending WhatsApp message to: ${message.to}`);
            if (!message.to) {
                throw new integration_types_1.IntegrationError(integration_types_1.IntegrationType.WHATSAPP, 'INVALID_MESSAGE', 'Recipient phone number is required');
            }
            const token = config.accessToken || this.accessToken;
            const phoneId = config.phoneNumberId || this.phoneNumberId;
            if (!token || !phoneId) {
                throw new integration_types_1.IntegrationError(integration_types_1.IntegrationType.WHATSAPP, 'NOT_CONFIGURED', 'WhatsApp is not properly configured');
            }
            const formattedPhone = message.to.replace(/^\+/, '');
            const url = `${this.baseUrl}/${this.apiVersion}/${phoneId}/messages`;
            const payload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: formattedPhone,
            };
            if (message.text) {
                payload.type = 'text';
                payload.text = {
                    body: message.text.body,
                    preview_url: true,
                };
            }
            else if (message.template) {
                payload.type = 'template';
                payload.template = message.template;
            }
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
                throw new integration_types_1.IntegrationError(integration_types_1.IntegrationType.WHATSAPP, 'API_ERROR', errorData.error?.message || 'Failed to send WhatsApp message', errorData);
            }
            const data = await response.json();
            this.logger.log(`WhatsApp message sent to: ${message.to}, ID: ${data.messages?.[0]?.id}`);
            return {
                success: true,
                messageId: data.messages?.[0]?.id,
                timestamp: new Date(),
                recipient: data.contacts?.[0]?.wa_id,
            };
        }
        catch (error) {
            if (error instanceof integration_types_1.IntegrationError) {
                throw error;
            }
            this.handleError(error, 'MESSAGE_SEND_FAILED');
        }
    }
    async sendTemplateMessage(config, to, templateName, languageCode = 'en', components) {
        try {
            this.logger.debug(`Sending template message: ${templateName} to: ${to}`);
            const message = {
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
        }
        catch (error) {
            this.handleError(error, 'TEMPLATE_SEND_FAILED');
        }
    }
    async verifyWebhookToken(token, challenge, verifyToken) {
        try {
            this.logger.debug('Verifying webhook token');
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
        }
        catch (error) {
            this.logger.error('Webhook verification error:', error);
            return null;
        }
    }
    async processIncomingMessage(message) {
        try {
            this.logger.debug(`Processing incoming message from: ${message.from}`);
            if (message.text) {
                this.logger.log(`Received text message: ${message.text.body}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to process incoming message:', error);
            throw error;
        }
    }
    async performHealthCheck() {
        try {
            return true;
        }
        catch (error) {
            this.logger.error('WhatsApp health check failed:', error);
            return false;
        }
    }
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map