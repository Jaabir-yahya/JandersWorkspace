import { EventType } from '../../integrations/types/integration.types';
export declare class CreateOutboundWebhookConfigDto {
    tenantId: string;
    name: string;
    url: string;
    events: EventType[];
    secret?: string;
    isActive?: boolean;
    retryPolicy?: {
        maxRetries: number;
        backoffMs: number;
    };
    headers?: Record<string, string>;
}
export declare class UpdateOutboundWebhookConfigDto {
    name?: string;
    url?: string;
    events?: EventType[];
    secret?: string;
    isActive?: boolean;
    retryPolicy?: {
        maxRetries: number;
        backoffMs: number;
    };
    headers?: Record<string, string>;
}
export declare class OutboundWebhookConfigResponseDto {
    id: string;
    tenantId: string;
    name: string;
    url: string;
    events: EventType[];
    isActive: boolean;
    retryPolicy: {
        maxRetries: number;
        backoffMs: number;
    };
    headers?: Record<string, string>;
    lastTriggeredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class WebhookDeliveryDto {
    webhookConfigId: string;
    eventType: EventType;
    payload: Record<string, any>;
    correlationId?: string;
}
export declare class WebhookDeliveryResponseDto {
    id: string;
    tenantId: string;
    webhookConfigId: string;
    eventType: EventType;
    payload: Record<string, any>;
    responseStatus?: number;
    responseBody?: string;
    responseHeaders?: Record<string, string>;
    deliveredAt?: Date;
    retryCount: number;
    status: string;
    nextRetryAt?: Date;
    errorMessage?: string;
    createdAt: Date;
}
export declare class ListWebhookDeliveriesQueryDto {
    tenantId?: string;
    webhookConfigId?: string;
    eventType?: EventType;
    status?: string;
    limit?: number;
    offset?: number;
}
export declare class VerifyWebhookSignatureDto {
    payload: string;
    signature: string;
    secret: string;
    algorithm?: string;
}
