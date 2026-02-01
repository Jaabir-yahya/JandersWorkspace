"use strict";
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const integration_types_1 = require("../integrations/types/integration.types");
const crypto = __importStar(require("crypto"));
let WebhooksService = WebhooksService_1 = class WebhooksService {
    prisma;
    configService;
    logger = new common_1.Logger(WebhooksService_1.name);
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async storeWebhookEvent(data) {
        const event = await this.prisma.webhookEvent.create({
            data: {
                tenantId: data.tenantId,
                integrationType: data.integrationType,
                eventType: data.eventType,
                payload: data.payload,
                processed: false,
                retryCount: 0,
            },
        });
        this.logger.log(`Stored webhook event ${event.id} for ${data.integrationType}`);
        return event;
    }
    validateSignature(integrationType, payload, signature, secret) {
        try {
            switch (integrationType) {
                case integration_types_1.IntegrationType.MPESA:
                    return this.validateMpesaSignature(payload, signature, secret);
                case integration_types_1.IntegrationType.SHOPIFY:
                    return this.validateShopifySignature(payload, signature, secret);
                case integration_types_1.IntegrationType.WHATSAPP:
                    return this.validateWhatsAppSignature(payload, signature, secret);
                default:
                    return false;
            }
        }
        catch (error) {
            this.logger.error(`Signature validation failed for ${integrationType}:`, error);
            return false;
        }
    }
    validateMpesaSignature(payload, signature, secret) {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('base64');
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }
    validateShopifySignature(payload, signature, secret) {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload, 'utf8')
            .digest('base64');
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }
    validateWhatsAppSignature(payload, signature, secret) {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature.replace('sha256=', '')), Buffer.from(expectedSignature));
    }
    generateSignature(payload, secret, algorithm = 'sha256') {
        return crypto
            .createHmac(algorithm, secret)
            .update(payload)
            .digest('hex');
    }
    async getWebhookEventById(id) {
        const event = await this.prisma.webhookEvent.findUnique({
            where: { id },
        });
        return event;
    }
    async listWebhookEvents(filters) {
        const where = {};
        if (filters.tenantId) {
            where.tenantId = filters.tenantId;
        }
        if (filters.integrationType) {
            where.integrationType = filters.integrationType;
        }
        if (filters.eventType) {
            where.eventType = filters.eventType;
        }
        if (filters.status) {
            if (filters.status === integration_types_1.WebhookStatus.PENDING) {
                where.processed = false;
            }
            else if (filters.status === integration_types_1.WebhookStatus.DELIVERED) {
                where.processed = true;
                where.errorMessage = null;
            }
            else if (filters.status === integration_types_1.WebhookStatus.FAILED) {
                where.errorMessage = { not: null };
            }
        }
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.createdAt.lte = filters.endDate;
            }
        }
        const [events, total] = await Promise.all([
            this.prisma.webhookEvent.findMany({
                where,
                take: filters.limit || 20,
                skip: filters.offset || 0,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.webhookEvent.count({ where }),
        ]);
        return {
            events: events,
            total,
        };
    }
    async markAsProcessed(id, errorMessage) {
        const event = await this.prisma.webhookEvent.update({
            where: { id },
            data: {
                processed: true,
                processedAt: new Date(),
                errorMessage: errorMessage || null,
            },
        });
        return event;
    }
    async incrementRetryCount(id, errorMessage) {
        const event = await this.prisma.webhookEvent.update({
            where: { id },
            data: {
                retryCount: { increment: 1 },
                errorMessage: errorMessage || undefined,
            },
        });
        return event;
    }
    async cleanupOldEvents(olderThanDays = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        const result = await this.prisma.webhookEvent.deleteMany({
            where: {
                processed: true,
                createdAt: {
                    lt: cutoffDate,
                },
            },
        });
        this.logger.log(`Cleaned up ${result.count} old webhook events`);
        return result.count;
    }
    async getWebhookStats(tenantId) {
        const where = tenantId ? { tenantId } : {};
        const [total, pending, delivered, failed] = await Promise.all([
            this.prisma.webhookEvent.count({ where }),
            this.prisma.webhookEvent.count({
                where: { ...where, processed: false },
            }),
            this.prisma.webhookEvent.count({
                where: { ...where, processed: true, errorMessage: null },
            }),
            this.prisma.webhookEvent.count({
                where: { ...where, errorMessage: { not: null } },
            }),
        ]);
        return { total, pending, delivered, failed };
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map