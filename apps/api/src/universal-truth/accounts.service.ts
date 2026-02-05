import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Core Universal Truth DTOs
export interface CreateAccountDto {
  tenantId: string;
  name: string;
  type: string;
  currency?: string;
  metadata?: Record<string, any>;
  createdById?: string;
}

export interface CreateTransactionDto {
  tenantId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  reasonId?: string;
  entityId?: string;
  notes?: string;
  reference?: string;
  createdById?: string;
}

export interface AccountBalanceDto {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

@Injectable()
export class UniversalAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create account using stored procedure
   */
  async createAccount(data: CreateAccountDto): Promise<string> {
    // Validate inputs
    if (!data.tenantId || !data.name || !data.type) {
      throw new BadRequestException('Tenant ID, name, and type are required');
    }

    // Check for duplicate account name
    const existingAccount = await this.prisma.account.findFirst({
      where: {
        tenantId: data.tenantId,
        name: { equals: data.name, mode: 'insensitive' },
      },
    });

    if (existingAccount) {
      throw new BadRequestException(
        `Account '${data.name}' already exists for this tenant`,
      );
    }

    // Use stored procedure for atomicity
    const result = await this.prisma.$queryRaw`
      SELECT * FROM create_account(
        ${data.tenantId}::uuid,
        ${data.name}::varchar,
        ${data.type}::varchar,
        ${data.currency || 'KES'}::varchar,
        ${data.createdById || null}::uuid
      )
    `;

    const accountData = (result as any)[0];
    if (accountData?.p_error_message) {
      throw new BadRequestException(accountData.p_error_message);
    }

    return accountData?.p_account_id;
  }

  /**
   * Get tenant balances with grouping
   */
  async getBalances(
    tenantId: string,
    groupBy?: string,
  ): Promise<AccountBalanceDto[]> {
    const result = await this.prisma.$queryRaw`
      SELECT * FROM get_tenant_balances(
        ${tenantId}::uuid,
        ${groupBy || null}::varchar
      )
    `;

    return result as AccountBalanceDto[];
  }

  /**
   * Get account details
   */
  async getAccount(
    accountId: string,
    tenantId: string,
  ): Promise<AccountBalanceDto> {
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        tenantId,
        isActive: true,
      },
    });

    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found`);
    }

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      balance: Number(account.balance),
      currency: account.currency,
    };
  }

  /**
   * List all tenant accounts
   */
  async listAccounts(tenantId: string): Promise<AccountBalanceDto[]> {
    const accounts = await this.prisma.account.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });

    return accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      balance: Number(account.balance),
      currency: account.currency,
    }));
  }
}
