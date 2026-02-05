import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard, getAuthenticatedUser } from '../auth/auth.guard';
import * as InvoiceServiceModule from './invoice.service';

@Controller('invoices')
@UseGuards(AuthGuard)
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceServiceModule.InvoiceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new invoice' })
  async createInvoice(
    @Request() req,
    @Body() createInvoiceDto: InvoiceServiceModule.CreateInvoiceDto,
  ): Promise<InvoiceServiceModule.InvoiceDto> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.invoiceService.createInvoice(
      user.tenantId,
      user.id,
      createInvoiceDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  async findAllInvoices(
    @Request() req,
  ): Promise<InvoiceServiceModule.InvoiceDto[]> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.invoiceService.findAllInvoices(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async findOneInvoice(
    @Request() req,
    @Param('id') id: string,
  ): Promise<InvoiceServiceModule.InvoiceDto> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.invoiceService.findOneInvoice(user.tenantId, id);
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Apply payment to invoice' })
  async applyPayment(
    @Request() req,
    @Param('id') id: string,
    @Body() paymentDto: InvoiceServiceModule.PaymentApplicationDto,
  ): Promise<{ message: string; transactionId: string }> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    // Ensure payment references the correct invoice
    paymentDto.invoiceId = id;

    return this.invoiceService.applyPayment(user.tenantId, user.id, paymentDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel invoice' })
  async cancelInvoice(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    await this.invoiceService.updateInvoicePaymentStatus(
      user.tenantId,
      id,
      'CANCELLED',
    );

    return { message: 'Invoice cancelled successfully' };
  }
}

// Helper decorator for Swagger documentation
function ApiOperation(options: { summary: string }) {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    // This is a placeholder for @ApiOperation decorator
    // In a real implementation, you would use @nestjs/swagger
  };
}
