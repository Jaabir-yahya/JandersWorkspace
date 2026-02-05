import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAccountDto,
  UpdateAccountDto,
  AccountDto,
} from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  // Since we don't have a dedicated Account model in the existing schema,
  // we'll use the Item model for account-like functionality and track balances
  // through metadata and transactions

  async create(
    tenantId: string,
    userId: string,
    createAccountDto: CreateAccountDto,
  ): Promise<AccountDto> {
    // Check if account with same name already exists for this tenant
    const existing = await this.prisma.item.findFirst({
      where: {
        tenantId,
        name: createAccountDto.name,
        itemType: 'ACCOUNT',
      },
    });

    if (existing) {
      throw new ConflictException(
        `Account with name '${createAccountDto.name}' already exists`,
      );
    }

    const item = await this.prisma.item.create({
      data: {
        tenantId,
        name: createAccountDto.name,
        sku: `ACC_${createAccountDto.type.toUpperCase()}_${Date.now()}`,
        itemType: 'ACCOUNT',
        quantity: createAccountDto.balance || 0,
        defaultPrice: 0,
        tags: '',
        metadata: {
          accountType: createAccountDto.type,
          currency: createAccountDto.currency || 'KES',
          balance: createAccountDto.balance || 0,
          ...createAccountDto.metadata,
        },
      },
    });

    return this.mapItemToAccountDto(item);
  }

  async findAll(tenantId: string): Promise<AccountDto[]> {
    const items = await this.prisma.item.findMany({
      where: {
        tenantId,
        itemType: 'ACCOUNT',
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return items.map((item) => this.mapItemToAccountDto(item));
  }

  async findOne(tenantId: string, id: string): Promise<AccountDto> {
    const item = await this.prisma.item.findFirst({
      where: {
        id,
        tenantId,
        itemType: 'ACCOUNT',
      },
    });

    if (!item) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return this.mapItemToAccountDto(item);
  }

  async findByType(tenantId: string, type: string): Promise<AccountDto[]> {
    const items = await this.prisma.item.findMany({
      where: {
        tenantId,
        itemType: 'ACCOUNT',
        isActive: true,
        metadata: {
          path: ['accountType'],
          equals: type,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return items.map((item) => this.mapItemToAccountDto(item));
  }

  async update(
    tenantId: string,
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<AccountDto> {
    const existing = await this.prisma.item.findFirst({
      where: {
        id,
        tenantId,
        itemType: 'ACCOUNT',
      },
    });

    if (!existing) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    // If updating name, check for duplicates
    if (updateAccountDto.name && updateAccountDto.name !== existing.name) {
      const duplicate = await this.prisma.item.findFirst({
        where: {
          tenantId,
          name: updateAccountDto.name,
          itemType: 'ACCOUNT',
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Account with name '${updateAccountDto.name}' already exists`,
        );
      }
    }

    const updateData: any = {};
    if (updateAccountDto.name) updateData.name = updateAccountDto.name;
    if (updateAccountDto.balance !== undefined) {
      updateData.quantity = updateAccountDto.balance;
      updateData.metadata = {
        ...existing.metadata,
        balance: updateAccountDto.balance,
      };
    }
    if (updateAccountDto.metadata) {
      updateData.metadata = {
        ...existing.metadata,
        ...updateAccountDto.metadata,
      };
    }

    const item = await this.prisma.item.update({
      where: { id },
      data: updateData,
    });

    return this.mapItemToAccountDto(item);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const item = await this.prisma.item.findFirst({
      where: {
        id,
        tenantId,
        itemType: 'ACCOUNT',
      },
    });

    if (!item) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    // Check if account has transactions by checking transaction lines
    const hasTransactions = await this.prisma.transactionLine.findFirst({
      where: {
        accountCode: item.sku,
      },
    });

    if (hasTransactions) {
      throw new BadRequestException(
        'Cannot delete account with existing transactions',
      );
    }

    await this.prisma.item.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getBalance(tenantId: string, id: string): Promise<{ balance: number }> {
    const item = await this.prisma.item.findFirst({
      where: {
        id,
        tenantId,
        itemType: 'ACCOUNT',
      },
      select: {
        metadata: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    const metadata = item.metadata;
    const balance = metadata?.balance || 0;
    return { balance: Number(balance) };
  }

  async getTrialBalance(tenantId: string): Promise<any[]> {
    const items = await this.prisma.item.findMany({
      where: {
        tenantId,
        itemType: 'ACCOUNT',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        metadata: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Group by account type and calculate debits/credits
    const trialBalance = items.reduce((acc, item) => {
      const metadata = item.metadata;
      const accountType = metadata?.accountType || 'UNKNOWN';
      const balance = Number(metadata?.balance || 0);

      if (!acc[accountType]) {
        acc[accountType] = {
          accountType,
          accounts: [],
          totalDebit: 0,
          totalCredit: 0,
        };
      }

      // Determine if this is a debit or credit balance based on account type
      const debitTypes = ['CASH', 'BANK', 'INVENTORY', 'ASSET'];
      const isDebit = debitTypes.includes(accountType) || balance < 0;

      const accountEntry = {
        id: item.id,
        name: item.name,
        balance: Math.abs(balance),
        isDebitBalance: isDebit,
      };

      acc[accountType].accounts.push(accountEntry);

      if (isDebit) {
        acc[accountType].totalDebit += Math.abs(balance);
      } else {
        acc[accountType].totalCredit += balance;
      }

      return acc;
    }, {} as any);

    return Object.values(trialBalance);
  }

  private mapItemToAccountDto(item: any): AccountDto {
    const metadata = item.metadata || {};
    return {
      id: item.id,
      tenantId: item.tenantId,
      name: item.name,
      type: metadata.accountType || 'UNKNOWN',
      balance: Number(metadata.balance || 0),
      currency: metadata.currency || 'KES',
      metadata: metadata,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
