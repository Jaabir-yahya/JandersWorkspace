import { api, apiClient } from '../api-client';
import type { InventoryItem } from '../types';

/** Backend inventory item (BusinessController GET /business/inventory) */
interface BackendInventoryItem {
  id: string;
  tenantId: string;
  name: string;
  quantity: number;
  unit: string;
  averagePrice: number;
  totalValue: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

function mapBackendToInventoryItem(b: BackendInventoryItem): InventoryItem {
  const meta = b.metadata ?? {};
  const unit = (b.unit === 'PCS' ? 'PIECE' : b.unit) as InventoryItem['unit'];
  return {
    id: b.id,
    name: b.name,
    description: (meta.description as string) ?? '',
    sku: (meta.sku as string) ?? '',
    category: (meta.category as string) ?? '',
    unit: unit in { PIECE: 1, KG: 1, LITRE: 1, BOX: 1, CARTON: 1, SACK: 1 } ? unit : 'PIECE',
    quantity: Number(b.quantity),
    reorderLevel: Number(meta.reorderLevel ?? 0),
    costPrice: Number(b.averagePrice ?? 0),
    sellingPrice: Number(meta.sellingPrice ?? b.averagePrice ?? 0),
    currency: 'KES',
    isActive: (meta.isActive as boolean) ?? true,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

export interface InventoryListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  isActive?: boolean;
}

export interface InventoryListResponse {
  data: InventoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

export const inventoryApi = {
  /**
   * List inventory items (backend: GET /business/inventory).
   * Pagination/filtering applied client-side; backend returns full list.
   */
  list: async (params?: InventoryListParams): Promise<InventoryListResponse> => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 100;
    const empty = { data: [], total: 0, page, pageSize };
    try {
      const res = await api.get<BackendInventoryItem[] | { data: BackendInventoryItem[] }>(
        '/business/inventory',
      );
      const raw = Array.isArray(res.data) ? res.data : (res.data as { data?: BackendInventoryItem[] })?.data;
      const list = Array.isArray(raw) ? raw : [];
      const items = list.map(mapBackendToInventoryItem);
      const start = (page - 1) * pageSize;
      const data = items.slice(start, start + pageSize);
      return { data, total: items.length, page, pageSize };
    } catch {
      return empty;
    }
  },

  /**
   * Get a single inventory item (backend: GET /business/inventory/:id).
   */
  get: async (id: string): Promise<InventoryItem> => {
    const res = await api.get<BackendInventoryItem | { data: BackendInventoryItem }>(
      `/business/inventory/${id}`,
    );
    const raw = (res.data as { data?: BackendInventoryItem })?.data ?? (res.data as BackendInventoryItem);
    if (!raw || typeof raw !== 'object') throw new Error('Inventory item not found');
    return mapBackendToInventoryItem(raw);
  },

  /**
   * Create: backend has no standalone inventory create; use supplies.
   */
  create: (data: Partial<InventoryItem>) =>
    apiClient.post<InventoryItem>('/business/inventory', data),

  /**
   * Update: not implemented on backend; may 404.
   */
  update: (id: string, data: Partial<InventoryItem>) =>
    apiClient.put<InventoryItem>(`/business/inventory/${id}`, data),

  /**
   * Delete: not implemented on backend; may 404.
   */
  delete: (id: string) => apiClient.delete<{ message: string }>(`/business/inventory/${id}`),

  /**
   * Adjust: not implemented on backend; may 404.
   */
  adjustQuantity: (id: string, quantity: number, reason: string) =>
    apiClient.post<InventoryItem>(`/business/inventory/${id}/adjust`, { quantity, reason }),

  /**
   * Low stock: not implemented on backend; returns filtered list from list().
   */
  lowStock: async (): Promise<InventoryItem[]> => {
    const { data } = await inventoryApi.list({ pageSize: 1000 });
    return data.filter((i) => i.quantity <= i.reorderLevel);
  },
};
