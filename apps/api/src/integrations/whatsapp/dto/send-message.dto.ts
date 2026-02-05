import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MessageContentDto {
  @IsString()
  @IsOptional()
  body?: string;

  @IsString()
  @IsOptional()
  templateName?: string;

  @IsObject()
  @IsOptional()
  templateData?: {
    language?: string;
    components?: Array<{
      type: string;
      parameters?: Array<{
        type: string;
        [key: string]: any;
      }>;
    }>;
  };
}

export class SendMessageDto {
  @IsString()
  to: string;

  @IsEnum(['text', 'template'])
  type: 'text' | 'template';

  @ValidateNested()
  @Type(() => MessageContentDto)
  content: MessageContentDto;
}
