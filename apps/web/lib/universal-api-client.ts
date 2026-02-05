import { apiClient, ApiResponse } from "./api-client";

// Universal Truth Types
export interface CreateAccountDto {
  tenantId: string;
  name: string;
  type: string;
  currency: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface AccountBalanceDto {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  tenantId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  reasonName?: string;
  entityId?: string;
  notes?: string;
  reference?: string;
  createdById?: string;
}

export interface TransactionStreamDto {
  id: string;
  date: string;
  amount: number;
  fromAccountName: string;
  toAccountName: string;
  reasonName: string;
  entityName: string;
  notes: string;
  reference: string;
}

export interface TransactionDetailsDto {
  id: string;
  date: string;
  amount: number;
  fromAccount: AccountBalanceDto;
  toAccount: AccountBalanceDto;
  reason: string;
  entity: string;
  notes: string;
  reference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Universal Truth API Client
export const universalApi = {
  // Accounts
  accounts: {
    create: (data: CreateAccountDto) =>
      apiClient.post<AccountBalanceDto>("/universal/accounts", data),

    getAll: (groupBy?: string) =>
      apiClient.get<AccountBalanceDto[]>("/universal/accounts", {
        params: groupBy ? { group: groupBy } : undefined,
      }),

    getById: (id: string) =>
      apiClient.get<AccountBalanceDto>(`/universal/accounts/${id}`),
  },

  // Transactions
  transactions: {
    create: (data: CreateTransactionDto) =>
      apiClient.post<{ id: string; message: string }>(
        "/universal/transactions",
        data,
      ),

    getStream: (options?: {
      fromDate?: string;
      toDate?: string;
      accountId?: string;
      entityId?: string;
      limit?: number;
    }) =>
      apiClient.get<TransactionStreamDto[]>("/universal/transactions/stream", {
        params: options,
      }),

    getById: (id: string) =>
      apiClient.get<TransactionDetailsDto>(`/universal/transactions/${id}`),

    reverse: (id: string, reason: string) =>
      apiClient.post<{ id: string; message: string }>(
        `/universal/transactions/${id}/reverse`,
        { reason },
      ),
  },
};

export default universalApi;
