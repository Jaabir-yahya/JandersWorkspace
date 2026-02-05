import { api, getCurrentTenantId } from '../api-client';

export interface Entity {
  id: string;
  tenantId: string;
  displayName?: string;
  name?: string;
  phone?: string;
  email?: string;
  entityType?: string;
  [key: string]: unknown;
}

/** Entity state: net balance, credits, debits, transaction count. */
export interface EntityBalance {
  entity: Entity;
  balance: {
    total_credit: number;
    total_debit: number;
    net_balance: number;
    transaction_count: number;
  };
}

/** Entity log: one row per transaction with running balance. */
export interface EntityHistoryItem {
  transaction_id: string;
  transaction_date: string;
  type: string;
  status: string;
  payment_status?: string;
  total_amount: number;
  currency_code?: string;
  reference: string;
  running_balance: number;
}

export interface EntityHistoryResponse {
  entity: Entity;
  transactions: EntityHistoryItem[];
  total_balance: number;
}

export const entitiesApi = {
  list: (params?: { type?: string; search?: string; tenant_id?: string | null }) => {
    const tid = params?.tenant_id ?? getCurrentTenantId();
    const query: Record<string, string> = {};
    if (params?.type) query.type = params.type;
    if (params?.search) query.search = params.search;
    if (tid) query.tenant_id = tid;
    return api
      .get<Entity[]>('/entities', { params: query })
      .then((r) => (Array.isArray(r.data) ? r.data : []));
  },
  get: (id: string) => api.get<Entity>(`/entities/${id}`).then((r) => r.data),
  /** Entity state: amount total for this entity. */
  getBalance: (id: string): Promise<EntityBalance> =>
    api.get<EntityBalance>(`/entities/${id}/balance`).then((r) => r.data),
  /** Entity log: transaction history with running balance. */
  getHistory: (id: string): Promise<EntityHistoryResponse> =>
    api.get<EntityHistoryResponse>(`/entities/${id}/history`).then((r) => r.data),
};
