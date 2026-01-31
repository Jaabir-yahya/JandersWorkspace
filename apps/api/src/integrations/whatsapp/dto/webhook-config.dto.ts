import { IsString, IsUrl, IsBoolean, IsOptional, IsArray, IsObject } from 'class-validator';

export class WebhookConfigDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsArray()
  @IsString({ each: true })
  events: string[];

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
}
