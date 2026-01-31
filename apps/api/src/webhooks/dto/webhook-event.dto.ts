import { IsString, IsObject, IsOptional, IsEnum, IsUUID, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { IntegrationType, WebhookStatus, EventType } from '../../integrations/types/integration.types';

export class CreateWebhookEventDto {
  @IsUUID()
  tenantId: string;

  @IsEnum(IntegrationType)
  integrationType: IntegrationType;

  @IsEnum(EventType)
  eventType: EventType;

  @IsObject()
  payload: Record<string, any>;

  @IsString()
  @IsOptional()
  signature?: string;

  @IsString()
  @IsOptional()
  sourceIp?: string;

  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;
}

export class WebhookEventResponseDto {
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

export class ListWebhookEventsQueryDto {
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @IsEnum(IntegrationType)
  @IsOptional()
  integrationType?: IntegrationType;

  @IsEnum(EventType)
  @IsOptional()
  eventType?: EventType;

  @IsEnum(WebhookStatus)
  @IsOptional()
  status?: WebhookStatus;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class RetryWebhookEventDto {
  @IsBoolean()
  @IsOptional()
  force?: boolean;
}

export class WebhookDeliveryAttemptDto {
  id: string;
  webhookEventId: string;
  attemptNumber: number;
  statusCode: number;
  responseBody?: string;
  errorMessage?: string;
  createdAt: Date;
}
