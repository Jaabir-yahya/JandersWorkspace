import { api } from '../api-client';

export interface InventoryContainer {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  location?: string;
  capacity?: string;
  assignedEntityId?: string;
  metadata: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContainerItem {
  id: string;
  containerId: string;
  itemId: string;
  quantity: number;
  batchRef: string;
  expiryAt?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  itemName?: string;
  itemSku?: string;
}

export const containersApi = {
  list: (entityId?: string) =>
    api
      .get<InventoryContainer[]>('/business/containers', { params: entityId ? { entityId } : {} })
      .then((r) => (Array.isArray(r.data) ? r.data : [])),

  get: (id: string) =>
    api.get<InventoryContainer>(`/business/containers/${id}`).then((r) => r.data),

  create: (data: {
    name: string;
    type: string;
    location?: string;
    capacity?: string;
    assignedEntityId?: string;
    metadata?: Record<string, unknown>;
  }) => api.post<InventoryContainer>('/business/containers', data).then((r) => r.data),

  update: (
    id: string,
    data: Partial<{
      name: string;
      type: string;
      location?: string;
      capacity?: string;
      assignedEntityId?: string;
      isActive?: boolean;
      metadata?: Record<string, unknown>;
    }>,
  ) => api.patch<InventoryContainer>(`/business/containers/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/business/containers/${id}`),

  getItems: (containerId: string) =>
    api.get<ContainerItem[]>(`/business/containers/${containerId}/items`).then((r) => (Array.isArray(r.data) ? r.data : [])),

  addItem: (containerId: string, data: { itemId: string; quantity: number; batchRef?: string; expiryAt?: string }) =>
    api.post<ContainerItem>(`/business/containers/${containerId}/items`, data).then((r) => r.data),
};
