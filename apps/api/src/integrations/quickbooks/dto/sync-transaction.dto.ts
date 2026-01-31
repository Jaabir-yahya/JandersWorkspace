import { IsString, IsObject, IsOptional, IsEnum } from 'class-validator';

export class SyncTransactionDto {
  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsObject()
  transaction: Record<string, any>;

  @IsEnum(['CREATE', 'UPDATE', 'DELETE'])
  @IsOptional()
  operation?: 'CREATE' | 'UPDATE' | 'DELETE';
}
