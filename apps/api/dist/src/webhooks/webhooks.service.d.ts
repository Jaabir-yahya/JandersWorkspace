import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, EventType, WebhookStatus } from '../integrations/types/integration.types';
import { CreateWebhookEventDto } from './dto/webhook-event.dto';
export interface WebhookEventRecord {
    id: string;
    tenantId: string;
    integrationType: string;
    eventType: string;
    payload: any;
    processed: boolean;
    retryCount: number;
    errorMessage?: string;
    createdAt: Date;
    processedAt?: Date;
}
export declare class WebhooksService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    storeWebhookEvent(data: CreateWebhookEventDto): Promise<WebhookEventRecord>;
    validateSignature(integrationType: IntegrationType, payload: string, signature: string, secret: string): boolean;
    private validateMpesaSignature;
    private validateShopifySignature;
    private validateWhatsAppSignature;
    generateSignature(payload: string, secret: string, algorithm?: string): string;
    getWebhookEventById(id: string): Promise<WebhookEventRecord | null>;
    listWebhookEvents(filters: {
        tenantId?: string;
        integrationType?: IntegrationType;
        eventType?: EventType;
        status?: WebhookStatus;
        limit?: number;
        offset?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        events: WebhookEventRecord[];
        total: number;
    }>;
    markAsProcessed(id: string, errorMessage?: string): Promise<WebhookEventRecord>;
    incrementRetryCount(id: string, errorMessage?: string): Promise<WebhookEventRecord>;
    cleanupOldEvents(olderThanDays?: number): Promise<number>;
    getWebhookStats(tenantId?: string): Promise<{
        total: number;
        pending: number;
        delivered: number;
        failed: number;
    }>;
}
