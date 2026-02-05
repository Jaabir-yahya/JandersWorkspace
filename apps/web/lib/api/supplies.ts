import { api } from '../api-client';

/** Backend CreateSupplyDto: one line per supply (multi-line purchase = multiple calls). */
export interface CreateSupplyPayload {
  supplierName: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
  entityId?: string;
  containerId?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface SupplyDto {
  id: string;
  supplierName: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit?: string;
  entityId?: string;
  notes?: string;
  transactionPairId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a supply (single line). Backend posts to ledger with optional containerId
 * so supply is linked to truth and container for reporting.
 */
export const suppliesApi = {
  create: (payload: CreateSupplyPayload) =>
    api.post<SupplyDto>('/business/supplies', payload).then((r) => r.data),
};
