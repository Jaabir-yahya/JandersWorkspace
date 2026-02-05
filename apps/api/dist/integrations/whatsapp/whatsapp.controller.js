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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppController = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("./whatsapp.service");
const send_message_dto_1 = require("./dto/send-message.dto");
const webhook_config_dto_1 = require("./dto/webhook-config.dto");
let WhatsAppController = class WhatsAppController {
    whatsappService;
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    async sendMessage(req, sendMessageDto) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            phoneNumberId: '',
            accessToken: '',
            webhookVerifyToken: '',
            version: 'v18.0',
            baseUrl: 'https://graph.facebook.com',
        };
        const message = {
            messagingProduct: 'whatsapp',
            to: sendMessageDto.to,
            text: sendMessageDto.type === 'text'
                ? {
                    body: sendMessageDto.content.body || '',
                }
                : undefined,
            template: sendMessageDto.type === 'template'
                ? {
                    name: sendMessageDto.content.templateName || '',
                    language: {
                        code: sendMessageDto.content.templateData?.language || 'en',
                    },
                    components: sendMessageDto.content.templateData?.components,
                }
                : undefined,
        };
        const result = await this.whatsappService.sendMessage(config, message);
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async sendTemplateMessage(req, body) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            phoneNumberId: '',
            accessToken: '',
            webhookVerifyToken: '',
            version: 'v18.0',
            baseUrl: 'https://graph.facebook.com',
        };
        const result = await this.whatsappService.sendTemplateMessage(config, body.to, body.templateName, body.languageCode, body.components);
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async verifyWebhook(mode, token, challenge) {
        const verifyToken = 'your-webhook-verify-token';
        if (mode === 'subscribe') {
            const result = await this.whatsappService.verifyWebhookToken(token, challenge, verifyToken);
            if (result) {
                return challenge;
            }
        }
        return { success: false, message: 'Verification failed' };
    }
    async handleWebhook(payload) {
        const result = await this.whatsappService.handleWebhook(payload);
        return result;
    }
    async configureWebhook(req, configDto) {
        const tenantId = req.user?.tenantId || 'default';
        return {
            success: true,
            message: 'Webhook configuration saved',
            tenantId,
            config: configDto,
        };
    }
    async getHealthStatus() {
        const health = await this.whatsappService.getHealthStatus();
        return {
            service: this.whatsappService.name,
            ...health,
        };
    }
};
exports.WhatsAppController = WhatsAppController;
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('send-template'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "sendTemplateMessage", null);
__decorate([
    (0, common_1.Get)('webhook'),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('config'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, webhook_config_dto_1.WebhookConfigDto]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "configureWebhook", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "getHealthStatus", null);
exports.WhatsAppController = WhatsAppController = __decorate([
    (0, common_1.Controller)('api/v1/integrations/whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsAppService])
], WhatsAppController);
//# sourceMappingURL=whatsapp.controller.js.map