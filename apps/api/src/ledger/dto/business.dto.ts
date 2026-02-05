import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplyDto {
  @ApiProperty()
  @IsString()
  supplierName: string;

  @ApiProperty()
  @IsString()
  itemType: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  unitPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unit?: string = 'PCS';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ required: false, description: 'Receive into this inventory container (links supply to truth)' })
  @IsOptional()
  @IsUUID()
  containerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any> = {};
}

export class UpdateSupplyDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  itemType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unitPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class SupplyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  supplierName: string;

  @ApiProperty()
  itemType: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  entityId?: string;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  metadata: Record<string, any>;

  @ApiProperty()
  linkedInventoryItems: any[];

  @ApiProperty()
  transactionPairId?: string;

  @ApiProperty()
  createdByUserId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class InventoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  averagePrice: number;

  @ApiProperty()
  totalValue: number;

  @ApiProperty()
  metadata: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsString()
  customerName: string;

  @ApiProperty()
  @IsArray()
  items: InvoiceItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any> = {};
}

export class InvoiceItemDto {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  unitPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  itemType?: string;
}

export class InvoiceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  items: InvoiceItemDto[];

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  entityId?: string;

  @ApiProperty()
  dueDate?: Date;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  metadata: Record<string, any>;

  @ApiProperty()
  isSettled: boolean;

  @ApiProperty()
  settledAmount: number;

  @ApiProperty()
  createdByUserId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreatePaymentDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  amount: number;

  @ApiProperty()
  @IsString()
  method: string; // CASH, MPESA, BANK, CARD

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any> = {};
}

export class PaymentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  reference?: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  metadata: Record<string, any>;

  @ApiProperty()
  createdByUserId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  paidAt?: Date;

  @ApiProperty()
  applications: PaymentApplicationDto[];
}

export class PaymentApplicationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  paymentId: string;

  @ApiProperty()
  transactionId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  appliedAmount: number;

  @ApiProperty()
  appliedAt: Date;
}

// Inventory containers
export class InventoryContainerDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  tenantId: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ example: 'WAREHOUSE' })
  type: string;
  @ApiProperty({ required: false })
  location?: string;
  @ApiProperty({ required: false })
  capacity?: string;
  @ApiProperty({ required: false, description: 'Entity (person) assigned to this container' })
  assignedEntityId?: string;
  @ApiProperty()
  metadata: Record<string, any>;
  @ApiProperty()
  isActive: boolean;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}

export class CreateInventoryContainerDto {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty({ example: 'WAREHOUSE', description: 'WAREHOUSE | BIN | SHELF | SHIPMENT | VEHICLE' })
  @IsString()
  type: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  capacity?: string;
  @ApiProperty({ required: false, description: 'Link container to a person/entity (e.g. driver, warehouse manager)' })
  @IsOptional()
  @IsUUID()
  assignedEntityId?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateInventoryContainerDto extends CreateInventoryContainerDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class InventoryContainerItemDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  containerId: string;
  @ApiProperty()
  itemId: string;
  @ApiProperty()
  quantity: number;
  @ApiProperty()
  batchRef: string;
  @ApiProperty({ required: false })
  expiryAt?: Date;
  @ApiProperty()
  metadata: Record<string, any>;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty({ required: false })
  itemName?: string;
  @ApiProperty({ required: false })
  itemSku?: string;
}

export class AddContainerItemDto {
  @ApiProperty()
  @IsString()
  itemId: string;
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  quantity: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  batchRef?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiryAt?: string;
}
