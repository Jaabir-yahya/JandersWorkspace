import type {
  Transaction,
  Entity,
  EntityWithBalance,
  CreateTransactionInput,
  CreateEntityInput,
  UpdateEntityInput,
  TransactionFilters,
  EntitySearchFilters,
  ReverseTransactionInput,
  PaymentStatus,
  Attachment,
  Tenant,
  User,
  DashboardStats,
  ApplyPaymentInput,
  PaymentRecord,
  SearchResult,
} from "./types";
import {
  USE_MOCK_DATA,
  mockTransactions,
  mockEntities,
  mockEntityProfiles,
  mockAttachments,
  mockTenants,
  mockCurrentUser,
  mockDashboardStats,
} from "./mock-data";

const API_BASE_URL = "http://localhost:3000/api/v1";

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API Error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Transaction API
export const transactionApi = {
  list: (filters?: TransactionFilters): Promise<Transaction[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve(
        mockTransactions.filter((t) => {
          if (filters?.status && t.status !== filters.status) return false;
          if (filters?.type && t.type !== filters.type) return false;
          if (filters?.payment_status && t.payment_status !== filters.payment_status) return false;
          if (filters?.search) {
            const search = filters.search.toLowerCase();
            const matchesRef = t.reference?.toLowerCase().includes(search);
            const matchesEntity = t.entity?.display_name.toLowerCase().includes(search);
            if (!matchesRef && !matchesEntity) return false;
          }
          return true;
        })
      );
    }
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const query = params.toString();
    return fetchApi<Transaction[]>(`/transactions${query ? `?${query}` : ""}`);
  },

  get: (id: string): Promise<Transaction> => {
    if (USE_MOCK_DATA) {
      const tx = mockTransactions.find((t) => t.id === id);
      return tx ? Promise.resolve(tx) : Promise.reject(new Error("Not found"));
    }
    return fetchApi<Transaction>(`/transactions/${id}`);
  },

  create: (data: CreateTransactionInput): Promise<Transaction> => {
    if (USE_MOCK_DATA) {
      const newTx: Transaction = {
        id: `txn-${Date.now()}`,
        tenant_id: data.tenant_id,
        entity_id: data.entity_id,
        created_by_user_id: data.created_by_user_id,
        type: data.type,
        status: "DRAFT",
        payment_status: data.due_date ? "CREDIT" : "PENDING",
        total_amount: data.lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0),
        currency_code: data.currency_code,
        transaction_date: data.transaction_date,
        reference: data.reference,
        due_date: data.due_date,
        context: data.context,
        metadata: {},
        lines: data.lines.map((l, i) => ({
          id: `line-${Date.now()}-${i}`,
          transaction_id: `txn-${Date.now()}`,
          description: l.description,
          quantity: l.quantity,
          unit_price: l.unit_price,
          total_line_amount: l.quantity * l.unit_price,
          account_code: l.account_code,
          sku: l.sku,
          metadata: {},
        })),
        entity: mockEntities.find((e) => e.id === data.entity_id),
      };
      mockTransactions.unshift(newTx);
      return Promise.resolve(newTx);
    }
    return fetchApi<Transaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  post: (id: string, userId: string): Promise<Transaction> => {
    if (USE_MOCK_DATA) {
      const tx = mockTransactions.find((t) => t.id === id);
      if (tx) tx.status = "POSTED";
      return tx ? Promise.resolve(tx) : Promise.reject(new Error("Not found"));
    }
    return fetchApi<Transaction>(`/transactions/${id}/post`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  },

  reverse: (id: string, data: ReverseTransactionInput): Promise<Transaction> => {
    if (USE_MOCK_DATA) {
      const tx = mockTransactions.find((t) => t.id === id);
      if (tx) {
        tx.status = "REVERSED";
        tx.metadata = { ...tx.metadata, ...data };
      }
      return tx ? Promise.resolve(tx) : Promise.reject(new Error("Not found"));
    }
    return fetchApi<Transaction>(`/transactions/${id}/reverse`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updatePaymentStatus: (id: string, paymentStatus: PaymentStatus): Promise<Transaction> => {
    if (USE_MOCK_DATA) {
      const tx = mockTransactions.find((t) => t.id === id);
      if (tx) tx.payment_status = paymentStatus;
      return tx ? Promise.resolve(tx) : Promise.reject(new Error("Not found"));
    }
    return fetchApi<Transaction>(`/transactions/${id}/payment_status`, {
      method: "PATCH",
      body: JSON.stringify({ payment_status: paymentStatus }),
    });
  },

  export: (id: string): Promise<Record<string, unknown>> => {
    if (USE_MOCK_DATA) {
      const tx = mockTransactions.find((t) => t.id === id);
      return tx ? Promise.resolve(tx as unknown as Record<string, unknown>) : Promise.reject(new Error("Not found"));
    }
    return fetchApi<Record<string, unknown>>(`/transactions/${id}/export`);
  },
};

// Entity API
export const entityApi = {
  list: (filters?: EntitySearchFilters): Promise<Entity[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve(
        mockEntities.filter((e) => {
          if (filters?.type && e.type !== filters.type) return false;
          if (filters?.search) {
            const search = filters.search.toLowerCase();
            const matchesName = e.display_name.toLowerCase().includes(search);
            const matchesPhone = e.phone_number?.includes(search);
            const matchesLinked = e.linked_phones?.some((p) => p.includes(search));
            const matchesAlt = e.alternate_names?.some((n) => n.toLowerCase().includes(search));
            if (!matchesName && !matchesPhone && !matchesLinked && !matchesAlt) return false;
          }
          return true;
        })
      );
    }
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const query = params.toString();
    return fetchApi<Entity[]>(`/entities${query ? `?${query}` : ""}`);
  },

  get: (id: string): Promise<Entity> => {
    if (USE_MOCK_DATA) {
      const entity = mockEntities.find((e) => e.id === id);
      return entity ? Promise.resolve(entity) : Promise.reject(new Error("Not found"));
    }
    return fetchApi<Entity>(`/entities/${id}`);
  },

  // Search by any phone number (main or linked)
  searchByPhone: (phone: string): Promise<Entity[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve(
        mockEntities.filter(
          (e) => e.phone_number?.includes(phone) || e.linked_phones?.some((p) => p.includes(phone))
        )
      );
    }
    return fetchApi<Entity[]>(`/entities/search?phone=${encodeURIComponent(phone)}`);
  },

  create: (data: CreateEntityInput): Promise<Entity> => {
    if (USE_MOCK_DATA) {
      const newEntity: Entity = {
        id: `ent-${Date.now()}`,
        tenant_id: data.tenant_id,
        type: data.type,
        display_name: data.display_name,
        phone_number: data.phone_number,
        linked_phones: data.linked_phones || [],
        alternate_names: data.alternate_names || [],
        location: data.location,
        notes: data.notes,
        metadata: data.metadata || {},
        created_by_user_id: data.created_by_user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockEntities.push(newEntity);
      return Promise.resolve(newEntity);
    }
    return fetchApi<Entity>("/entities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: UpdateEntityInput): Promise<Entity> => {
    if (USE_MOCK_DATA) {
      const entity = mockEntities.find((e) => e.id === id);
      if (entity) {
        Object.assign(entity, data, { updated_at: new Date().toISOString() });
      }
      return entity ? Promise.resolve(entity) : Promise.reject(new Error("Not found"));
    }
    return fetchApi<Entity>(`/entities/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Get full profile with balance and transaction history
  getProfile: (id: string): Promise<EntityWithBalance & { transactions: Transaction[] }> => {
    if (USE_MOCK_DATA) {
      const profile = mockEntityProfiles[id];
      return profile ? Promise.resolve(profile) : Promise.reject(new Error("Not found"));
    }
    return fetchApi<EntityWithBalance & { transactions: Transaction[] }>(`/entities/${id}/profile`);
  },

  // Add a linked phone number
  addLinkedPhone: (id: string, phone: string): Promise<Entity> => {
    if (USE_MOCK_DATA) {
      const entity = mockEntities.find((e) => e.id === id);
      if (entity) {
        if (!entity.linked_phones) entity.linked_phones = [];
        entity.linked_phones.push(phone);
      }
      return entity ? Promise.resolve(entity) : Promise.reject(new Error("Not found"));
    }
    return fetchApi<Entity>(`/entities/${id}/linked-phones`, {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  },

  // Remove a linked phone number
  removeLinkedPhone: (id: string, phone: string): Promise<Entity> => {
    if (USE_MOCK_DATA) {
      const entity = mockEntities.find((e) => e.id === id);
      if (entity && entity.linked_phones) {
        entity.linked_phones = entity.linked_phones.filter((p) => p !== phone);
      }
      return entity ? Promise.resolve(entity) : Promise.reject(new Error("Not found"));
    }
    return fetchApi<Entity>(`/entities/${id}/linked-phones`, {
      method: "DELETE",
      body: JSON.stringify({ phone }),
    });
  },

  // Get entities with outstanding balances (CRM dashboard)
  getWithBalances: (): Promise<EntityWithBalance[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve(Object.values(mockEntityProfiles));
    }
    return fetchApi<EntityWithBalance[]>("/entities/with-balances");
  },

  // Legacy method for backwards compatibility
  getHistory: (id: string): Promise<Entity & { transactions: Transaction[] }> => {
    if (USE_MOCK_DATA) {
      const profile = mockEntityProfiles[id];
      return profile ? Promise.resolve(profile) : Promise.reject(new Error("Not found"));
    }
    return fetchApi<Entity & { transactions: Transaction[] }>(`/entities/${id}/history`);
  },
};

// Attachment API (for proof/receipts)
export const attachmentApi = {
  // Upload a file
  upload: async (file: File, transactionId?: string, entityId?: string): Promise<Attachment> => {
    if (USE_MOCK_DATA) {
      const fileType = file.type.startsWith("image/")
        ? "IMAGE"
        : file.type === "application/pdf"
          ? "PDF"
          : file.type.startsWith("audio/")
            ? "AUDIO"
            : "OTHER";
      const newAttachment: Attachment = {
        id: `att-${Date.now()}`,
        entity_id: entityId,
        transaction_id: transactionId,
        file_name: file.name,
        file_type: fileType,
        file_url: URL.createObjectURL(file),
        file_size: file.size,
        uploaded_by_user_id: DEFAULT_USER_ID,
        uploaded_at: new Date().toISOString(),
        metadata: {},
      };
      mockAttachments.push(newAttachment);
      return Promise.resolve(newAttachment);
    }
    const formData = new FormData();
    formData.append("file", file);
    if (transactionId) formData.append("transaction_id", transactionId);
    if (entityId) formData.append("entity_id", entityId);
    formData.append("user_id", DEFAULT_USER_ID);

    const response = await fetch(`${API_BASE_URL}/attachments/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // List attachments for a transaction
  listForTransaction: (transactionId: string): Promise<Attachment[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve(mockAttachments.filter((a) => a.transaction_id === transactionId));
    }
    return fetchApi<Attachment[]>(`/attachments?transaction_id=${transactionId}`);
  },

  // List attachments for an entity
  listForEntity: (entityId: string): Promise<Attachment[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve(mockAttachments.filter((a) => a.entity_id === entityId));
    }
    return fetchApi<Attachment[]>(`/attachments?entity_id=${entityId}`);
  },

  // Delete an attachment
  delete: (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      const index = mockAttachments.findIndex((a) => a.id === id);
      if (index > -1) mockAttachments.splice(index, 1);
      return Promise.resolve();
    }
    return fetchApi<void>(`/attachments/${id}`, { method: "DELETE" });
  },
};

// Helper constants
export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000000";
export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";
