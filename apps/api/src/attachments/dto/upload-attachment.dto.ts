import { IsString, IsUUID, IsOptional } from 'class-validator';

export class UploadAttachmentDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  entity_id?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  transaction_id?: string;

  @IsString()
  @IsUUID()
  uploaded_by_user_id: string;
}
