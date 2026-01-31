import { IsString, IsObject, IsOptional, IsEnum, IsUUID, IsNumber, IsBoolean, IsArray, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../../integrations/types/integration.types';

export class CreateOutboundWebhookConfigDto {
  @IsUUID()
  tenantId: string;

  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsArray()
  @IsEnum(EventType, { each: true })
  events: EventType[];

  @IsString()
  @IsOptional()
  secret?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };

  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;
}

export class UpdateOutboundWebhookConfigDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsArray()
  @IsEnum(EventType, { each: true })
  @IsOptional()
  events?: EventType[];

  @IsString()
  @IsOptional()
  secret?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };

  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;
}

export class OutboundWebhookConfigResponseDto {
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

export class WebhookDeliveryDto {
  @IsUUID()
  webhookConfigId: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsObject()
  payload: Record<string, any>;

  @IsUUID()
  @IsOptional()
  correlationId?: string;
}

export class WebhookDeliveryResponseDto {
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

export class ListWebhookDeliveriesQueryDto {
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @IsUUID()
  @IsOptional()
  webhookConfigId?: string;

  @IsEnum(EventType)
  @IsOptional()
  eventType?: EventType;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}

export class VerifyWebhookSignatureDto {
  @IsString()
  payload: string;

  @IsString()
  signature: string;

  @IsString()
  secret: string;

  @IsString()
  @IsOptional()
  algorithm?: string;
}
