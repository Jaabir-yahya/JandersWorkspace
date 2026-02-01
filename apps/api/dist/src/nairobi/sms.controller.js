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
exports.NairobiSmsController = void 0;
const common_1 = require("@nestjs/common");
const sms_service_1 = require("./sms.service");
let NairobiSmsController = class NairobiSmsController {
    smsService;
    constructor(smsService) {
        this.smsService = smsService;
    }
    async handleIncomingSms(smsData) {
        try {
            const response = await this.smsService.handleSmsCommand(smsData.from, smsData.text);
            return {
                status: 'success',
                response,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async sendTestSms(body) {
        try {
            const summary = await this.smsService.generateDailySummary(body.tenantId);
            const result = await this.smsService.sendSms({
                ...summary,
                phoneNumber: body.phoneNumber,
            });
            return {
                status: 'success',
                sent: result,
                message: summary.message,
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    }
    async sendDailySummaries() {
        try {
            await this.smsService.sendDailySummaries();
            return {
                status: 'success',
                message: 'Daily summaries sent successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async getWebhookConfig() {
        return this.smsService.setupSmsWebhook();
    }
    async generateSummary(tenantId) {
        try {
            const summary = await this.smsService.generateDailySummary(tenantId);
            return {
                status: 'success',
                data: summary,
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
            };
        }
    }
};
exports.NairobiSmsController = NairobiSmsController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NairobiSmsController.prototype, "handleIncomingSms", null);
__decorate([
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NairobiSmsController.prototype, "sendTestSms", null);
__decorate([
    (0, common_1.Post)('send-daily-summaries'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NairobiSmsController.prototype, "sendDailySummaries", null);
__decorate([
    (0, common_1.Get)('webhook-config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NairobiSmsController.prototype, "getWebhookConfig", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NairobiSmsController.prototype, "generateSummary", null);
exports.NairobiSmsController = NairobiSmsController = __decorate([
    (0, common_1.Controller)('nairobi/sms'),
    __metadata("design:paramtypes", [sms_service_1.NairobiSmsService])
], NairobiSmsController);
//# sourceMappingURL=sms.controller.js.map