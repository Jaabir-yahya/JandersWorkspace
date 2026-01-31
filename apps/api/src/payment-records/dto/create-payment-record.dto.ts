import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentRecordDto {
  @IsString()
  @IsUUID()
  transaction_id: string;

  @IsString()
  @IsIn(['CASH', 'M-PESA', 'BANK_TRANSFER', 'CARD', 'CREDIT'])
  method: 'CASH' | 'M-PESA' | 'BANK_TRANSFER' | 'CARD' | 'CREDIT';

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsDateString()
  paid_at?: string;

  @IsString()
  @IsUUID()
  tenant_id: string;

  @IsString()
  @IsUUID()
  created_by_user_id: string;

  @IsOptional()
  @IsString()
  currency_code?: string;
}
