import { IsString, IsUUID, IsArray, IsOptional, IsNumber, IsObject, ValidateNested, ArrayMinSize, Matches } from 'class-validator';
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
  @IsObject()
  metadata?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionLineDto)
  @ArrayMinSize(1)
  lines: TransactionLineDto[];
}
