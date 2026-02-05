import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  balance?: number = 0;

  @ApiProperty({ required: false, default: 'KES' })
  @IsOptional()
  @IsString()
  currency?: string = 'KES';

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any> = {};
}

export class UpdateAccountDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  balance?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class AccountDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  metadata: Record<string, any>;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
