import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  IsUUID,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Simple payload for manual-first quick capture (basic tier).
 * Maps to a single-line transaction; tenant_id from X-Tenant-Id header.
 * Phase A: optional person (entity_id), note, and tags for connections.
 */
export class QuickCaptureDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsString()
  description: string;

  @IsString()
  @IsIn(['sale', 'expense', 'SALE', 'EXPENSE', 'RETAIL', 'SERVICE', 'RENTAL'])
  type: string;

  @IsOptional()
  @IsString()
  currency_code?: string;

  @IsOptional()
  @IsString()
  @IsIn(['cash', 'mpesa', 'CASH', 'M-PESA', 'BANK_TRANSFER', 'CARD', 'CREDIT'])
  method?: string;

  /** Optional: link transaction to a person (customer/supplier). */
  @IsOptional()
  @IsUUID()
  entity_id?: string;

  /** Optional: extra note on the transaction. */
  @IsOptional()
  @IsString()
  note?: string;

  /** Optional: labels to filter and connect (e.g. wholesale, mama-mboga). */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
