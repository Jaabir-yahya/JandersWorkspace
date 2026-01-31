import { IsUUID } from 'class-validator';

export class PostTransactionDto {
  @IsUUID()
  user_id: string;
}
