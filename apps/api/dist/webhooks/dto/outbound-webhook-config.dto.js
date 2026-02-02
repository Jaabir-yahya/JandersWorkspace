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
exports.VerifyWebhookSignatureDto = exports.ListWebhookDeliveriesQueryDto = exports.WebhookDeliveryResponseDto = exports.WebhookDeliveryDto = exports.OutboundWebhookConfigResponseDto = exports.UpdateOutboundWebhookConfigDto = exports.CreateOutboundWebhookConfigDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const integration_types_1 = require("../../integrations/types/integration.types");
class CreateOutboundWebhookConfigDto {
    tenantId;
    name;
    url;
    events;
    secret;
    isActive;
    retryPolicy;
    headers;
}
exports.CreateOutboundWebhookConfigDto = CreateOutboundWebhookConfigDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateOutboundWebhookConfigDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOutboundWebhookConfigDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateOutboundWebhookConfigDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(integration_types_1.EventType, { each: true }),
    __metadata("design:type", Array)
], CreateOutboundWebhookConfigDto.prototype, "events", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOutboundWebhookConfigDto.prototype, "secret", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateOutboundWebhookConfigDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateOutboundWebhookConfigDto.prototype, "retryPolicy", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateOutboundWebhookConfigDto.prototype, "headers", void 0);
class UpdateOutboundWebhookConfigDto {
    name;
    url;
    events;
    secret;
    isActive;
    retryPolicy;
    headers;
}
exports.UpdateOutboundWebhookConfigDto = UpdateOutboundWebhookConfigDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOutboundWebhookConfigDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOutboundWebhookConfigDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(integration_types_1.EventType, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateOutboundWebhookConfigDto.prototype, "events", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOutboundWebhookConfigDto.prototype, "secret", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateOutboundWebhookConfigDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateOutboundWebhookConfigDto.prototype, "retryPolicy", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateOutboundWebhookConfigDto.prototype, "headers", void 0);
class OutboundWebhookConfigResponseDto {
    id;
    tenantId;
    name;
    url;
    events;
    isActive;
    retryPolicy;
    headers;
    lastTriggeredAt;
    createdAt;
    updatedAt;
}
exports.OutboundWebhookConfigResponseDto = OutboundWebhookConfigResponseDto;
class WebhookDeliveryDto {
    webhookConfigId;
    eventType;
    payload;
    correlationId;
}
exports.WebhookDeliveryDto = WebhookDeliveryDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], WebhookDeliveryDto.prototype, "webhookConfigId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(integration_types_1.EventType),
    __metadata("design:type", String)
], WebhookDeliveryDto.prototype, "eventType", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], WebhookDeliveryDto.prototype, "payload", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WebhookDeliveryDto.prototype, "correlationId", void 0);
class WebhookDeliveryResponseDto {
    id;
    tenantId;
    webhookConfigId;
    eventType;
    payload;
    responseStatus;
    responseBody;
    responseHeaders;
    deliveredAt;
    retryCount;
    status;
    nextRetryAt;
    errorMessage;
    createdAt;
}
exports.WebhookDeliveryResponseDto = WebhookDeliveryResponseDto;
class ListWebhookDeliveriesQueryDto {
    tenantId;
    webhookConfigId;
    eventType;
    status;
    limit;
    offset;
}
exports.ListWebhookDeliveriesQueryDto = ListWebhookDeliveriesQueryDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListWebhookDeliveriesQueryDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListWebhookDeliveriesQueryDto.prototype, "webhookConfigId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(integration_types_1.EventType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListWebhookDeliveriesQueryDto.prototype, "eventType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListWebhookDeliveriesQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ListWebhookDeliveriesQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ListWebhookDeliveriesQueryDto.prototype, "offset", void 0);
class VerifyWebhookSignatureDto {
    payload;
    signature;
    secret;
    algorithm;
}
exports.VerifyWebhookSignatureDto = VerifyWebhookSignatureDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyWebhookSignatureDto.prototype, "payload", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyWebhookSignatureDto.prototype, "signature", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyWebhookSignatureDto.prototype, "secret", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], VerifyWebhookSignatureDto.prototype, "algorithm", void 0);
//# sourceMappingURL=outbound-webhook-config.dto.js.map