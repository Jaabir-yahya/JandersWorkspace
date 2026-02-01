import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

/**
 * Public create-person payload for manual tier.
 * No JWT; tenant from X-Tenant-Id; created_by from manual user.
 */
export class CreateEntityPublicDto {
  @IsString()
  @MinLength(1)
  display_name: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  @IsIn(['CUSTOMER', 'SUPPLIER', 'BOTH', 'customer', 'supplier', 'both'])
  type?: string;
}
