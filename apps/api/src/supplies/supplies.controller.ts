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
import { SuppliesService } from './supplies.service';
import type { CreateSupplyDto, SupplyDto } from './supplies.service';

@Controller('supplies')
@UseGuards(AuthGuard)
export class SuppliesController {
  constructor(private readonly suppliesService: SuppliesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new supply' })
  async createSupply(
    @Request() req,
    @Body() createSupplyDto: CreateSupplyDto,
  ): Promise<SupplyDto> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.suppliesService.createSupply(
      user.tenantId,
      user.id,
      createSupplyDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all supplies' })
  async findAllSupplies(@Request() req): Promise<SupplyDto[]> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.suppliesService.findAllSupplies(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supply by ID' })
  async findOneSupply(
    @Request() req,
    @Param('id') id: string,
  ): Promise<SupplyDto> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.suppliesService.findOneSupply(user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update supply status' })
  async updateSupplyStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: 'PENDING' | 'RECEIVED' | 'PROCESSED',
  ): Promise<SupplyDto> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    return this.suppliesService.updateSupplyStatus(user.tenantId, id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete supply' })
  async deleteSupply(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const user = getAuthenticatedUser(req);
    if (!user.tenantId) {
      throw new BadRequestException('User must be associated with a tenant');
    }

    await this.suppliesService.deleteSupply(user.tenantId, id);
    return { message: 'Supply deleted successfully' };
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
