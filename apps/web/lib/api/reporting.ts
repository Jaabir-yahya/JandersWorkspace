import { api } from '../api-client';

/** Trial balance: accounts with debit/credit balances (state). */
export interface TrialBalanceAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export interface TrialBalanceResponse {
  accounts: TrialBalanceAccount[];
  summary: { totalDebits: number; totalCredits: number; isBalanced: boolean };
  generatedAt: string;
}

/** Single transaction in a pair (ledger log). */
export interface TransactionHistoryEntry {
  id: string;
  amount: number;
  date: string;
  party?: string;
  entryType?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  isReversal?: boolean;
  transactionPairId?: string;
  containerId?: string;
}

export interface TransactionHistoryPair {
  transactionPairId: string;
  transactions: TransactionHistoryEntry[];
  date: string;
  totalAmount: number;
  isReversal?: boolean;
}

export interface TransactionHistoryResponse {
  transactions: TransactionHistoryPair[];
  summary: { totalTransactions: number; totalAmount: number };
  filters?: Record<string, string | undefined>;
  generatedAt: string;
}

export interface TransactionHistoryParams {
  dateFrom?: string;
  dateTo?: string;
  accountType?: string;
  entityType?: string;
  entityId?: string;
  containerId?: string;
}

/**
 * Reporting API — state (trial balance) and log (transaction history) from truth backend.
 */
export const reportingApi = {
  /** Trial balance: account-level state. */
  trialBalance: (): Promise<TrialBalanceResponse> =>
    api.get<TrialBalanceResponse>('/reporting/trial-balance').then((r) => r.data),

  /** Transaction history: ledger log; filter by entity, container, dates. */
  transactionHistory: (params?: TransactionHistoryParams): Promise<TransactionHistoryResponse> => {
    const search = new URLSearchParams();
    if (params?.dateFrom) search.set('dateFrom', params.dateFrom);
    if (params?.dateTo) search.set('dateTo', params.dateTo);
    if (params?.accountType) search.set('accountType', params.accountType);
    if (params?.entityType) search.set('entityType', params.entityType);
    if (params?.entityId) search.set('entityId', params.entityId);
    if (params?.containerId) search.set('containerId', params.containerId);
    const q = search.toString();
    return api
      .get<TransactionHistoryResponse>(`/reporting/transaction-history${q ? `?${q}` : ''}`)
      .then((r) => r.data);
  },
};
