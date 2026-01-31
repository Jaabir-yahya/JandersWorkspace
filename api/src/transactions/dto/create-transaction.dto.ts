import { IsString, IsUUID, IsArray, IsOptional, IsNumber, IsObject, ValidateNested, ArrayMinSize, Matches, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionLineDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  unit_price: number;

  @IsOptional()
  @IsString()
  account_code?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class PaymentRecordDto {
  @IsString()
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
}

export class CreateTransactionDto {
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'tenant_id must be a valid UUID',
  })
  tenant_id: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'entity_id must be a valid UUID',
  })
  entity_id?: string;

  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'created_by_user_id must be a valid UUID',
  })
  created_by_user_id: string;

  @IsString()
  type: 'RETAIL' | 'SERVICE' | 'RENTAL' | 'EXPENSE';

  @IsString()
  currency_code: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  transaction_date?: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionLineDto)
  @ArrayMinSize(1)
  lines: TransactionLineDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentRecordDto)
  payment_records?: PaymentRecordDto[];
}
