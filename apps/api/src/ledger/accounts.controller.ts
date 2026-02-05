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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import {
  CreateAccountDto,
  UpdateAccountDto,
  AccountDto,
} from './dto/account.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('accounts')
@Controller('accounts')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: AccountDto,
  })
  async create(
    @Request() req,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<AccountDto> {
    return this.accountsService.create(
      req.user.tenantId,
      req.user.userId,
      createAccountDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of all accounts',
    type: [AccountDto],
  })
  async findAll(@Request() req): Promise<AccountDto[]> {
    return this.accountsService.findAll(req.user.tenantId);
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Get trial balance' })
  @ApiResponse({ status: 200, description: 'Trial balance report' })
  async getTrialBalance(@Request() req) {
    return this.accountsService.getTrialBalance(req.user.tenantId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get accounts by type' })
  @ApiResponse({
    status: 200,
    description: 'Accounts of specified type',
    type: [AccountDto],
  })
  async findByType(
    @Request() req,
    @Param('type') type: string,
  ): Promise<AccountDto[]> {
    return this.accountsService.findByType(req.user.tenantId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiResponse({
    status: 200,
    description: 'Account details',
    type: AccountDto,
  })
  async findOne(@Request() req, @Param('id') id: string): Promise<AccountDto> {
    return this.accountsService.findOne(req.user.tenantId, id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiResponse({ status: 200, description: 'Account balance' })
  async getBalance(@Request() req, @Param('id') id: string) {
    return this.accountsService.getBalance(req.user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully',
    type: AccountDto,
  })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<AccountDto> {
    return this.accountsService.update(req.user.tenantId, id, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  async remove(@Request() req, @Param('id') id: string): Promise<void> {
    return this.accountsService.remove(req.user.tenantId, id);
  }
}
