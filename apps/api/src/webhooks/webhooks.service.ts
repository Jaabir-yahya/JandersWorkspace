import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { IntegrationType, EventType, WebhookStatus, WebhookResult } from '../integrations/types/integration.types';
import { CreateWebhookEventDto } from './dto/webhook-event.dto';
import * as crypto from 'crypto';

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

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Store an incoming webhook event in the database
   */
  async storeWebhookEvent(data: CreateWebhookEventDto): Promise<WebhookEventRecord> {
    const event = await this.prisma.webhookEvent.create({
      data: {
        tenantId: data.tenantId,
        source: data.integrationType,
        integrationType: data.integrationType,
        eventType: data.eventType,
        payload: data.payload,
        processed: false,
        retryCount: 0,
      },
    });

    this.logger.log(`Stored webhook event ${event.id} for ${data.integrationType}`);
    return event as WebhookEventRecord;
  }

  /**
   * Validate webhook signature for supported integrations
   */
  validateSignature(
    integrationType: IntegrationType,
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    try {
      switch (integrationType) {
        case IntegrationType.MPESA:
          return this.validateMpesaSignature(payload, signature, secret);
        case IntegrationType.SHOPIFY:
          return this.validateShopifySignature(payload, signature, secret);
        case IntegrationType.WHATSAPP:
          return this.validateWhatsAppSignature(payload, signature, secret);
        default:
          // Fail closed: reject unknown integrations
          return false;
      }
    } catch (error) {
      this.logger.error(`Signature validation failed for ${integrationType}:`, error);
      return false;
    }
  }

  /**
   * Validate M-Pesa webhook signature using HMAC
   */
  private validateMpesaSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Validate Shopify webhook signature using HMAC-SHA256
   */
  private validateShopifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('base64');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Validate WhatsApp webhook signature
   */
  private validateWhatsAppSignature(payload: string, signature: string, secret: string): boolean {
    // WhatsApp uses SHA-256 signature in the X-Hub-Signature-256 header
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature.replace('sha256=', '')),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Generate HMAC signature for outbound webhooks
   */
  generateSignature(payload: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto
      .createHmac(algorithm, secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Get webhook event by ID
   */
  async getWebhookEventById(id: string): Promise<WebhookEventRecord | null> {
    const event = await this.prisma.webhookEvent.findUnique({
      where: { id },
    });
    return event as WebhookEventRecord | null;
  }

  /**
   * List webhook events with filters
   */
  async listWebhookEvents(filters: {
    tenantId?: string;
    integrationType?: IntegrationType;
    eventType?: EventType;
    status?: WebhookStatus;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ events: WebhookEventRecord[]; total: number }> {
    const where: any = {};

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
      if (filters.status === WebhookStatus.PENDING) {
        where.processed = false;
      } else if (filters.status === WebhookStatus.DELIVERED) {
        where.processed = true;
        where.errorMessage = null;
      } else if (filters.status === WebhookStatus.FAILED) {
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
      events: events as WebhookEventRecord[],
      total,
    };
  }

  /**
   * Mark webhook event as processed
   */
  async markAsProcessed(id: string, errorMessage?: string): Promise<WebhookEventRecord> {
    const event = await this.prisma.webhookEvent.update({
      where: { id },
      data: {
        processed: true,
        processedAt: new Date(),
        errorMessage: errorMessage || null,
      },
    });

    return event as WebhookEventRecord;
  }

  /**
   * Increment retry count for a webhook event
   */
  async incrementRetryCount(id: string, errorMessage?: string): Promise<WebhookEventRecord> {
    const event = await this.prisma.webhookEvent.update({
      where: { id },
      data: {
        retryCount: { increment: 1 },
        errorMessage: errorMessage || undefined,
      },
    });

    return event as WebhookEventRecord;
  }

  /**
   * Delete old processed webhook events
   */
  async cleanupOldEvents(olderThanDays: number = 30): Promise<number> {
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

  /**
   * Get webhook statistics for a tenant
   */
  async getWebhookStats(tenantId?: string): Promise<{
    total: number;
    pending: number;
    delivered: number;
    failed: number;
  }> {
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
}
