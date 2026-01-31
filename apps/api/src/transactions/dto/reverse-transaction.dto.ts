import { IsUUID, IsString, IsOptional, MinLength } from 'class-validator';

export class ReverseTransactionDto {
  @IsUUID()
  created_by_user_id: string;

  @IsString()
  @MinLength(3, { message: 'Reason must be at least 3 characters long' })
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
