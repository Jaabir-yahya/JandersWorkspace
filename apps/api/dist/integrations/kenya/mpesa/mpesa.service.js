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
var MpesaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../../prisma/prisma.service");
const integration_types_1 = require("../../types/integration.types");
let MpesaService = MpesaService_1 = class MpesaService {
    configService;
    prismaService;
    name = 'M-Pesa Daraja API';
    type = integration_types_1.IntegrationType.MPESA;
    country = integration_types_1.TenantCountry.KENYA;
    tier = integration_types_1.TenantTier.ADVANCED;
    logger = new common_1.Logger(MpesaService_1.name);
    sandboxUrl = 'https://sandbox.safaricom.co.ke';
    productionUrl = 'https://api.safaricom.co.ke';
    get consumerKey() {
        return this.configService.get('MPESA_CONSUMER_KEY') || '';
    }
    get consumerSecret() {
        return this.configService.get('MPESA_CONSUMER_SECRET') || '';
    }
    get passkey() {
        return this.configService.get('MPESA_PASSKEY') || '';
    }
    get environment() {
        return (this.configService.get('MPESA_ENVIRONMENT') || 'sandbox');
    }
    get baseUrl() {
        return this.environment === 'production'
            ? this.productionUrl
            : this.sandboxUrl;
    }
    constructor(configService, prismaService) {
        this.configService = configService;
        this.prismaService = prismaService;
    }
    async authenticate(config) {
        try {
            this.logger.debug('Authenticating M-Pesa integration');
            const mpesaConfig = config.config;
            const consumerKey = mpesaConfig.consumerKey || this.consumerKey;
            const consumerSecret = mpesaConfig.consumerSecret || this.consumerSecret;
            if (!consumerKey || !consumerSecret) {
                this.logger.error('Missing M-Pesa credentials');
                return false;
            }
            const token = await this.getAccessToken(consumerKey, consumerSecret);
            if (token) {
                this.logger.log('M-Pesa authentication successful');
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error('M-Pesa authentication error:', error);
            return false;
        }
    }
    async getAccessToken(consumerKey, consumerSecret) {
        try {
            const key = consumerKey || this.consumerKey;
            const secret = consumerSecret || this.consumerSecret;
            if (!key || !secret) {
                throw new Error('Missing M-Pesa credentials');
            }
            const auth = Buffer.from(`${key}:${secret}`).toString('base64');
            const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
                method: 'GET',
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            });
            if (!response.ok) {
                const error = await response.json();
                this.logger.error('M-Pesa OAuth error:', error);
                return null;
            }
            const data = await response.json();
            return data.access_token;
        }
        catch (error) {
            this.logger.error('Failed to get M-Pesa access token:', error);
            return null;
        }
    }
    async testConnection(config) {
        try {
            return await this.authenticate(config);
        }
        catch (error) {
            this.logger.error('M-Pesa connection test failed:', error);
            return false;
        }
    }
    async syncData(request) {
        return {
            success: true,
            processed: 0,
            errors: ['M-Pesa sync relies on webhooks'],
            lastSyncAt: new Date(),
        };
    }
    async handleWebhook(payload) {
        try {
            await this.persistWebhookEvent('mpesa', JSON.stringify(payload));
            if (payload.Body?.stkCallback) {
                return this.handleStkPushCallback(payload);
            }
            if (payload.TransID) {
                return this.handleC2bCallback(payload);
            }
            return {
                success: false,
                status: 400,
                message: 'Unknown webhook payload structure',
            };
        }
        catch (error) {
            this.logger.error(`Webhook handling failed: ${error.message}`, error.stack);
            return {
                success: false,
                status: 500,
                message: error.message,
            };
        }
    }
    async persistWebhookEvent(eventType, payload) {
        try {
            const tenantId = 'default';
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
        }
        catch (error) {
            this.logger.error(`Failed to persist webhook event: ${error.message}`);
        }
    }
    determineEventType(payload) {
        if (payload.Body?.stkCallback) {
            return 'mpesa.stk_callback';
        }
        if (payload.TransID) {
            return 'mpesa.c2b_payment';
        }
        return 'mpesa.unknown';
    }
    async getHealthStatus() {
        const startTime = Date.now();
        try {
            const hasCredentials = this.configService.get('MPESA_CONSUMER_KEY') &&
                this.configService.get('MPESA_CONSUMER_SECRET');
            const responseTime = Date.now() - startTime;
            return {
                status: hasCredentials ? 'HEALTHY' : 'DEGRADED',
                lastCheck: new Date(),
                responseTime,
                errorMessage: hasCredentials ? undefined : 'Missing M-Pesa credentials',
            };
        }
        catch (error) {
            return {
                status: 'UNHEALTHY',
                lastCheck: new Date(),
                responseTime: Date.now() - startTime,
                errorMessage: error.message,
            };
        }
    }
    async initiateStkPush(config, request, transactionId) {
        try {
            this.logger.debug(`Initiating STK Push for transaction ${transactionId}`);
            const mpesaConfig = config.config;
            const shortcode = request.businessShortCode || mpesaConfig.shortcode || 174379;
            const passkey = mpesaConfig.passkey || this.passkey;
            if (!passkey) {
                throw new integration_types_1.IntegrationError(integration_types_1.IntegrationType.MPESA, 'MISSING_PASSKEY', 'M-Pesa passkey is required');
            }
            const timestamp = this.generateTimestamp();
            const password = this.generatePassword(shortcode, passkey, timestamp);
            const accessToken = await this.getAccessToken(mpesaConfig.consumerKey, mpesaConfig.consumerSecret);
            if (!accessToken) {
                throw new integration_types_1.IntegrationError(integration_types_1.IntegrationType.MPESA, 'AUTH_FAILED', 'Failed to get M-Pesa access token');
            }
            const phoneNumber = this.formatPhoneNumber(request.phoneNumber);
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
            const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(stkPayload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                this.logger.error('STK Push error:', errorData);
                throw new integration_types_1.IntegrationError(integration_types_1.IntegrationType.MPESA, 'STK_PUSH_FAILED', errorData.errorMessage || 'Failed to initiate STK Push', errorData);
            }
            const data = await response.json();
            this.logger.log(`STK Push initiated: ${data.CheckoutRequestID} for ${request.amount} KES`);
            return {
                MerchantRequestID: data.MerchantRequestID,
                CheckoutRequestID: data.CheckoutRequestID,
                ResponseCode: data.ResponseCode,
                ResponseDescription: data.ResponseDescription,
                CustomerMessage: data.CustomerMessage,
            };
        }
        catch (error) {
            if (error instanceof integration_types_1.IntegrationError) {
                throw error;
            }
            this.logger.error('STK Push error:', error);
            throw new integration_types_1.IntegrationError(integration_types_1.IntegrationType.MPESA, 'STK_PUSH_ERROR', error.message || 'Failed to initiate STK Push');
        }
    }
    async registerC2bUrls(config, request) {
        try {
            this.logger.debug('Registering C2B URLs');
            const mpesaConfig = config.config;
            const accessToken = await this.getAccessToken(mpesaConfig.consumerKey, mpesaConfig.consumerSecret);
            if (!accessToken) {
                throw new integration_types_1.IntegrationError(integration_types_1.IntegrationType.MPESA, 'AUTH_FAILED', 'Failed to get M-Pesa access token');
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
                throw new integration_types_1.IntegrationError(integration_types_1.IntegrationType.MPESA, 'C2B_REGISTER_FAILED', errorData.errorMessage || 'Failed to register C2B URLs', errorData);
            }
            const data = await response.json();
            this.logger.log('C2B URLs registered successfully');
            return data;
        }
        catch (error) {
            if (error instanceof integration_types_1.IntegrationError) {
                throw error;
            }
            this.logger.error('C2B registration error:', error);
            throw new integration_types_1.IntegrationError(integration_types_1.IntegrationType.MPESA, 'C2B_REGISTER_ERROR', error.message || 'Failed to register C2B URLs');
        }
    }
    async sendB2cPayment(config, request, transactionId) {
        try {
            this.logger.debug(`Sending B2C payment for transaction ${transactionId}`);
            const mpesaConfig = config.config;
            const accessToken = await this.getAccessToken(mpesaConfig.consumerKey, mpesaConfig.consumerSecret);
            if (!accessToken) {
                throw new integration_types_1.IntegrationError(integration_types_1.IntegrationType.MPESA, 'AUTH_FAILED', 'Failed to get M-Pesa access token');
            }
            const response = await fetch(`${this.baseUrl}/mpesa/b2c/v1/paymentrequest`, {
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
            });
            if (!response.ok) {
                const errorData = await response.json();
                this.logger.error('B2C payment error:', errorData);
                throw new integration_types_1.IntegrationError(integration_types_1.IntegrationType.MPESA, 'B2C_PAYMENT_FAILED', errorData.errorMessage || 'Failed to send B2C payment', errorData);
            }
            const data = await response.json();
            this.logger.log(`B2C payment initiated: ${data.ConversationID}`);
            return data;
        }
        catch (error) {
            if (error instanceof integration_types_1.IntegrationError) {
                throw error;
            }
            this.logger.error('B2C payment error:', error);
            throw new integration_types_1.IntegrationError(integration_types_1.IntegrationType.MPESA, 'B2C_PAYMENT_ERROR', error.message || 'Failed to send B2C payment');
        }
    }
    generateTimestamp() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }
    generatePassword(shortcode, passkey, timestamp) {
        const data = `${shortcode}${passkey}${timestamp}`;
        return Buffer.from(data).toString('base64');
    }
    formatPhoneNumber(phone) {
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '254' + cleaned.substring(1);
        }
        if (cleaned.startsWith('+')) {
            cleaned = cleaned.substring(1);
        }
        if (!cleaned.startsWith('254')) {
            cleaned = '254' + cleaned;
        }
        return cleaned;
    }
    handleStkPushCallback(payload) {
        const callback = payload.Body.stkCallback;
        const resultCode = callback.ResultCode;
        if (resultCode === 0) {
            const callbackMetadata = callback.CallbackMetadata?.Item || [];
            const amount = callbackMetadata.find((item) => item.Name === 'Amount')?.Value;
            const mpesaReceiptNumber = callbackMetadata.find((item) => item.Name === 'MpesaReceiptNumber')?.Value;
            console.log(`STK Push successful: ${mpesaReceiptNumber} for ${amount} KES`);
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
        }
        else {
            console.error(`STK Push failed: ${callback.ResultDesc} (Code: ${resultCode})`);
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
    handleC2bCallback(payload) {
        console.log(`C2B payment received: ${payload.TransID} for ${payload.TransAmount} KES`);
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
};
exports.MpesaService = MpesaService;
exports.MpesaService = MpesaService = MpesaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], MpesaService);
//# sourceMappingURL=mpesa.service.js.map