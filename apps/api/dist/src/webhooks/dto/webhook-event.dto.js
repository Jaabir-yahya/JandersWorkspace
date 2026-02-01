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
exports.WebhookDeliveryAttemptDto = exports.RetryWebhookEventDto = exports.ListWebhookEventsQueryDto = exports.WebhookEventResponseDto = exports.CreateWebhookEventDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const integration_types_1 = require("../../integrations/types/integration.types");
class CreateWebhookEventDto {
    tenantId;
    integrationType;
    eventType;
    payload;
    signature;
    sourceIp;
    headers;
}
exports.CreateWebhookEventDto = CreateWebhookEventDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateWebhookEventDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(integration_types_1.IntegrationType),
    __metadata("design:type", String)
], CreateWebhookEventDto.prototype, "integrationType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(integration_types_1.EventType),
    __metadata("design:type", String)
], CreateWebhookEventDto.prototype, "eventType", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateWebhookEventDto.prototype, "payload", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebhookEventDto.prototype, "signature", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebhookEventDto.prototype, "sourceIp", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWebhookEventDto.prototype, "headers", void 0);
class WebhookEventResponseDto {
    id;
    tenantId;
    integrationType;
    eventType;
    payload;
    status;
    retryCount;
    errorMessage;
    createdAt;
    processedAt;
    nextRetryAt;
}
exports.WebhookEventResponseDto = WebhookEventResponseDto;
class ListWebhookEventsQueryDto {
    tenantId;
    integrationType;
    eventType;
    status;
    limit;
    offset;
    startDate;
    endDate;
}
exports.ListWebhookEventsQueryDto = ListWebhookEventsQueryDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListWebhookEventsQueryDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(integration_types_1.IntegrationType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListWebhookEventsQueryDto.prototype, "integrationType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(integration_types_1.EventType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListWebhookEventsQueryDto.prototype, "eventType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(integration_types_1.WebhookStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListWebhookEventsQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ListWebhookEventsQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ListWebhookEventsQueryDto.prototype, "offset", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListWebhookEventsQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListWebhookEventsQueryDto.prototype, "endDate", void 0);
class RetryWebhookEventDto {
    force;
}
exports.RetryWebhookEventDto = RetryWebhookEventDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], RetryWebhookEventDto.prototype, "force", void 0);
class WebhookDeliveryAttemptDto {
    id;
    webhookEventId;
    attemptNumber;
    statusCode;
    responseBody;
    errorMessage;
    createdAt;
}
exports.WebhookDeliveryAttemptDto = WebhookDeliveryAttemptDto;
//# sourceMappingURL=webhook-event.dto.js.map