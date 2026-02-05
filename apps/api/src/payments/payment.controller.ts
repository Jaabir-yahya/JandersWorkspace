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
import { PaymentService } from './payment.service';
import type { CreatePaymentDto, PaymentDto } from './payment.service';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create new payment' })
  async createPayment(
    @Request() req,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentDto> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.paymentService.createPayment(
      user.tenantId,
      user.id,
      createPaymentDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  async findAllPayments(@Request() req): Promise<PaymentDto[]> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.paymentService.findAllPayments(user.tenantId);
  }

  @Get('method/:method')
  @ApiOperation({ summary: 'Get payments by method' })
  async findPaymentsByMethod(
    @Request() req,
    @Param('method') method: string,
  ): Promise<PaymentDto[]> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.paymentService.findPaymentsByMethod(user.tenantId, method);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async findOnePayment(
    @Request() req,
    @Param('id') id: string,
  ): Promise<PaymentDto> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.paymentService.findOnePayment(user.tenantId, id);
  }

  @Patch(':id/reverse')
  @ApiOperation({ summary: 'Reverse payment' })
  async reversePayment(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<{ message: string }> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.paymentService.reversePayment(user.tenantId, id, reason);
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
