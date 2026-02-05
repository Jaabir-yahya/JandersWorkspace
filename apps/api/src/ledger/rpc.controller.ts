import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RpcService } from './rpc.service';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('rpc')
@Controller('rpc')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class RpcController {
  constructor(private readonly rpcService: RpcService) {}

  @Post('create-double-entry')
  @ApiOperation({ summary: 'Create double-entry transaction (RPC)' })
  @ApiResponse({ status: 200, description: 'Double-entry transaction created' })
  async createDoubleEntryTransaction(
    @Request() req,
    @Body()
    createDoubleEntryDto: {
      debitAccountType: string;
      creditAccountType: string;
      amount: number;
      description?: string;
      linkedEntityType?: string;
      linkedEntityId?: string;
      reference?: string;
      transactionDate?: string;
    },
  ) {
    return this.rpcService.createDoubleEntryTransaction(
      req.user.tenantId,
      req.user.userId,
      createDoubleEntryDto.debitAccountType,
      createDoubleEntryDto.creditAccountType,
      createDoubleEntryDto.amount,
      createDoubleEntryDto.description,
      createDoubleEntryDto.linkedEntityType,
      createDoubleEntryDto.linkedEntityId,
      createDoubleEntryDto.reference,
      createDoubleEntryDto.transactionDate
        ? new Date(createDoubleEntryDto.transactionDate)
        : undefined,
    );
  }

  @Post('reverse-double-entry')
  @ApiOperation({ summary: 'Reverse double-entry transaction (RPC)' })
  @ApiResponse({ status: 200, description: 'Transaction reversed' })
  async reverseDoubleEntryTransaction(
    @Request() req,
    @Body()
    reverseDto: {
      transactionPairId: string;
      reason?: string;
    },
  ) {
    return this.rpcService.reverseDoubleEntryTransaction(
      req.user.tenantId,
      req.user.userId,
      reverseDto.transactionPairId,
      reverseDto.reason,
    );
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Get trial balance (RPC)' })
  @ApiResponse({ status: 200, description: 'Trial balance' })
  async getTrialBalance(@Request() req) {
    return this.rpcService.getTrialBalance(req.user.tenantId);
  }

  @Get('validate/:transactionPairId')
  @ApiOperation({
    summary: 'Validate double-entry transaction integrity (RPC)',
  })
  @ApiResponse({ status: 200, description: 'Transaction validation result' })
  async validateTransactionIntegrity(
    @Request() req,
    @Param('transactionPairId') transactionPairId: string,
  ) {
    return this.rpcService.validateDoubleEntryIntegrity(
      req.user.tenantId,
      transactionPairId,
    );
  }

  @Post('log-audit')
  @ApiOperation({ summary: 'Log audit event (RPC)' })
  @ApiResponse({ status: 200, description: 'Audit event logged' })
  async logAuditEvent(
    @Request() req,
    @Body()
    auditDto: {
      action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REVERSE';
      tableName: string;
      recordId: string;
      oldData?: any;
      newData?: any;
      description?: string;
    },
  ) {
    await this.rpcService.logAuditEvent(
      req.user.tenantId,
      req.user.userId,
      auditDto.action,
      auditDto.tableName,
      auditDto.recordId,
      auditDto.oldData,
      auditDto.newData,
      auditDto.description,
    );
    return { success: true };
  }
}
