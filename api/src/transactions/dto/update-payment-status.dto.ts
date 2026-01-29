import { IsUUID, IsString, IsOptional, IsIn } from 'class-validator';

export class UpdatePaymentStatusDto {
  @IsUUID()
  user_id: string;

  @IsString()
  @IsIn(['PENDING', 'PARTIAL', 'SETTLED', 'FAILED', 'CANCELLED'], {
    message: 'Payment status must be one of: PENDING, PARTIAL, SETTLED, FAILED, CANCELLED',
  })
  status: 'PENDING' | 'PARTIAL' | 'SETTLED' | 'FAILED' | 'CANCELLED';

  @IsOptional()
  @IsString()
  notes?: string;
}
