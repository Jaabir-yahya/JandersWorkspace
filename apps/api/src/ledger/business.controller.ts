import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BusinessService } from './business.service';
import {
  CreateSupplyDto,
  UpdateSupplyDto,
  SupplyDto,
  InventoryDto,
  CreateInvoiceDto,
  InvoiceDto,
  CreatePaymentDto,
  PaymentDto,
  InventoryContainerDto,
  CreateInventoryContainerDto,
  UpdateInventoryContainerDto,
  InventoryContainerItemDto,
  AddContainerItemDto,
} from './dto/business.dto';

@ApiTags('business')
@Controller('business')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  // Supplies endpoints
  @Post('supplies')
  @ApiOperation({ summary: 'Create new supply' })
  @ApiResponse({
    status: 201,
    description: 'Supply created successfully',
    type: SupplyDto,
  })
  async createSupply(
    @Request() req,
    @Body() createSupplyDto: CreateSupplyDto,
  ): Promise<SupplyDto> {
    return this.businessService.createSupply(
      req.user.tenantId,
      req.user.userId,
      createSupplyDto,
    );
  }

  @Get('supplies')
  @ApiOperation({ summary: 'Get all supplies' })
  @ApiResponse({
    status: 200,
    description: 'List of all supplies',
    type: [SupplyDto],
  })
  async findAllSupplies(@Request() req): Promise<SupplyDto[]> {
    return this.businessService.findAllSupplies(req.user.tenantId);
  }

  @Get('supplies/:id')
  @ApiOperation({ summary: 'Get supply by ID' })
  @ApiResponse({ status: 200, description: 'Supply details', type: SupplyDto })
  async findOneSupply(
    @Request() req,
    @Param('id') id: string,
  ): Promise<SupplyDto> {
    return this.businessService.findOneSupply(req.user.tenantId, id);
  }

  @Patch('supplies/:id')
  @ApiOperation({ summary: 'Update supply' })
  @ApiResponse({
    status: 200,
    description: 'Supply updated successfully',
    type: SupplyDto,
  })
  async updateSupply(
    @Request() req,
    @Param('id') id: string,
    @Body() updateSupplyDto: UpdateSupplyDto,
  ): Promise<SupplyDto> {
    return this.businessService.updateSupply(
      req.user.tenantId,
      req.user.userId,
      id,
      updateSupplyDto,
    );
  }

  @Delete('supplies/:id')
  @ApiOperation({ summary: 'Delete supply' })
  @ApiResponse({ status: 200, description: 'Supply deleted successfully' })
  async removeSupply(@Request() req, @Param('id') id: string): Promise<void> {
    return this.businessService.removeSupply(
      req.user.tenantId,
      req.user.userId,
      id,
    );
  }

  // Inventory endpoints
  @Get('inventory')
  @ApiOperation({ summary: 'Get all inventory items' })
  @ApiResponse({
    status: 200,
    description: 'List of all inventory items',
    type: [InventoryDto],
  })
  async getInventory(@Request() req): Promise<InventoryDto[]> {
    return this.businessService.getInventory(req.user.tenantId);
  }

  @Get('inventory/:id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item details',
    type: InventoryDto,
  })
  async getInventoryItem(
    @Request() req,
    @Param('id') id: string,
  ): Promise<InventoryDto> {
    return this.businessService.getInventoryItem(req.user.tenantId, id);
  }

  // Inventory containers
  @Get('containers')
  @ApiOperation({
    summary: 'List inventory containers (optional: filter by assigned entity)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of containers',
    type: [InventoryContainerDto],
  })
  async getContainers(
    @Request() req,
    @Query('entityId') entityId?: string,
  ): Promise<InventoryContainerDto[]> {
    return this.businessService.getContainers(req.user.tenantId, entityId);
  }

  @Get('containers/:id')
  @ApiOperation({ summary: 'Get container by ID' })
  @ApiResponse({
    status: 200,
    description: 'Container details',
    type: InventoryContainerDto,
  })
  async getContainer(
    @Request() req,
    @Param('id') id: string,
  ): Promise<InventoryContainerDto> {
    return this.businessService.getContainer(req.user.tenantId, id);
  }

  @Post('containers')
  @ApiOperation({ summary: 'Create container' })
  @ApiResponse({
    status: 201,
    description: 'Container created',
    type: InventoryContainerDto,
  })
  async createContainer(
    @Request() req,
    @Body() dto: CreateInventoryContainerDto,
  ): Promise<InventoryContainerDto> {
    return this.businessService.createContainer(req.user.tenantId, dto);
  }

  @Patch('containers/:id')
  @ApiOperation({ summary: 'Update container' })
  @ApiResponse({
    status: 200,
    description: 'Container updated',
    type: InventoryContainerDto,
  })
  async updateContainer(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateInventoryContainerDto,
  ): Promise<InventoryContainerDto> {
    return this.businessService.updateContainer(req.user.tenantId, id, dto);
  }

  @Delete('containers/:id')
  @ApiOperation({ summary: 'Delete container' })
  @ApiResponse({ status: 204, description: 'Container deleted' })
  async deleteContainer(
    @Request() req,
    @Param('id') id: string,
  ): Promise<void> {
    return this.businessService.deleteContainer(req.user.tenantId, id);
  }

  @Get('containers/:id/items')
  @ApiOperation({ summary: 'List items in container (batches)' })
  @ApiResponse({
    status: 200,
    description: 'Container items/batches',
    type: [InventoryContainerItemDto],
  })
  async getContainerItems(
    @Request() req,
    @Param('id') id: string,
  ): Promise<InventoryContainerItemDto[]> {
    return this.businessService.getContainerItems(req.user.tenantId, id);
  }

  @Post('containers/:id/items')
  @ApiOperation({ summary: 'Add item/batch to container' })
  @ApiResponse({
    status: 201,
    description: 'Item added to container',
    type: InventoryContainerItemDto,
  })
  async addContainerItem(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddContainerItemDto,
  ): Promise<InventoryContainerItemDto> {
    return this.businessService.addContainerItem(req.user.tenantId, id, dto);
  }

  // Invoice endpoints
  @Post('invoices')
  @ApiOperation({ summary: 'Create new invoice' })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
    type: InvoiceDto,
  })
  async createInvoice(
    @Request() req,
    @Body() createInvoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceDto> {
    return this.businessService.createInvoice(
      req.user.tenantId,
      req.user.userId,
      createInvoiceDto,
    );
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({
    status: 200,
    description: 'List of all invoices',
    type: [InvoiceDto],
  })
  async findAllInvoices(@Request() req): Promise<InvoiceDto[]> {
    return this.businessService.findAllInvoices(req.user.tenantId);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice details',
    type: InvoiceDto,
  })
  async findOneInvoice(
    @Request() req,
    @Param('id') id: string,
  ): Promise<InvoiceDto> {
    return this.businessService.findOneInvoice(req.user.tenantId, id);
  }

  // Payment endpoints
  @Post('payments')
  @ApiOperation({ summary: 'Create new payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: PaymentDto,
  })
  async createPayment(
    @Request() req,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentDto> {
    return this.businessService.createPayment(
      req.user.tenantId,
      req.user.userId,
      createPaymentDto,
    );
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({
    status: 200,
    description: 'List of all payments',
    type: [PaymentDto],
  })
  async findAllPayments(@Request() req): Promise<PaymentDto[]> {
    return this.businessService.findAllPayments(req.user.tenantId);
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment details',
    type: PaymentDto,
  })
  async findOnePayment(
    @Request() req,
    @Param('id') id: string,
  ): Promise<PaymentDto> {
    return this.businessService.findOnePayment(req.user.tenantId, id);
  }
}
