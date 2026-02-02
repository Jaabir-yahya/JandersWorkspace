import { IntegrationType, WebhookStatus, EventType } from '../../integrations/types/integration.types';
export declare class CreateWebhookEventDto {
    tenantId: string;
    integrationType: IntegrationType;
    eventType: EventType;
    payload: Record<string, any>;
    signature?: string;
    sourceIp?: string;
    headers?: Record<string, string>;
}
export declare class WebhookEventResponseDto {
    id: string;
    tenantId: string;
    integrationType: IntegrationType;
    eventType: EventType;
    payload: Record<string, any>;
    status: WebhookStatus;
    retryCount: number;
    errorMessage?: string;
    createdAt: Date;
    processedAt?: Date;
    nextRetryAt?: Date;
}
export declare class ListWebhookEventsQueryDto {
    tenantId?: string;
    integrationType?: IntegrationType;
    eventType?: EventType;
    status?: WebhookStatus;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
}
export declare class RetryWebhookEventDto {
    force?: boolean;
}
export declare class WebhookDeliveryAttemptDto {
    id: string;
    webhookEventId: string;
    attemptNumber: number;
    statusCode: number;
    responseBody?: string;
    errorMessage?: string;
    createdAt: Date;
}
