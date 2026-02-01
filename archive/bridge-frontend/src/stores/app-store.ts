import { create } from "zustand";
import type { User, Tenant, Entity, Transaction } from "@/types";

interface AppStore {
  // Authentication state
  user: User | null;
  currentTenant: Tenant | null;
  isAuthenticated: boolean;

  // Data state
  entities: Entity[];
  transactions: Transaction[];
  recentSearches: string[];

  // UI state
  theme: "light" | "dark" | "system";
  isOnline: boolean;
  isSyncing: boolean;

  // Integration state
  activeIntegrations: string[];
  integrationData: Record<string, any>;

  // Actions
  actions: {
    setUser: (user: User | null) => void;
    setCurrentTenant: (tenant: Tenant | null) => void;
    login: (
      email: string,
      password: string,
    ) => Promise<{ user: User; tenant: Tenant }>;
    logout: () => void;
    addEntity: (entity: Entity) => void;
    updateEntity: (id: string, updates: Partial<Entity>) => void;
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    addSearch: (query: string) => void;
    setTheme: (theme: "light" | "dark" | "system") => void;
    setOnlineStatus: (isOnline: boolean) => void;
    startSync: () => void;
    stopSync: () => void;
    enableIntegration: (integrationId: string) => void;
    setIntegrationData: (integrationId: string, data: any) => void;
  };
}

export const useAppStore = create<AppStore>((set) => ({
  // Initial state
  user: null,
  currentTenant: null,
  isAuthenticated: false,
  entities: [],
  transactions: [],
  recentSearches: [],
  theme: "system",
  isOnline: navigator.onLine,
  isSyncing: false,
  activeIntegrations: [],
  integrationData: {},

  // Actions
  actions: {
    setUser: (user) => set({ user }),
    setCurrentTenant: (tenant) => set({ currentTenant: tenant }),

    login: async (email, password) => {
      try {
        // This would integrate with your auth system
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const { user, tenant } = await response.json();
        set({ user, currentTenant: tenant, isAuthenticated: true });
        return { user, tenant };
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },

    logout: () =>
      set({
        user: null,
        currentTenant: null,
        isAuthenticated: false,
        activeIntegrations: [],
        integrationData: {},
      }),

    addEntity: (entity) =>
      set((state) => ({
        entities: [...state.entities, entity],
      })),

    updateEntity: (id, updates) =>
      set((state) => ({
        entities: state.entities.map((entity) =>
          entity.id === id ? { ...entity, ...updates } : entity,
        ),
      })),

    addTransaction: (transaction) =>
      set((state) => ({
        transactions: [transaction, ...state.transactions],
      })),

    updateTransaction: (id, updates) =>
      set((state) => ({
        transactions: state.transactions.map((tx) =>
          tx.id === id ? { ...tx, ...updates } : tx,
        ),
      })),

    addSearch: (query) =>
      set((state) => ({
        recentSearches: [query, ...state.recentSearches.slice(0, 4)],
      })),

    setTheme: (theme) => set({ theme }),

    setOnlineStatus: (isOnline) => set({ isOnline }),

    startSync: () => set({ isSyncing: true }),
    stopSync: () => set({ isSyncing: false }),

    enableIntegration: (integrationId) =>
      set((state) => ({
        activeIntegrations: [...state.activeIntegrations, integrationId],
      })),

    setIntegrationData: (integrationId, data) =>
      set((state) => ({
        integrationData: { ...state.integrationData, [integrationId]: data },
      })),
  },
}));

// Convenience selectors for common patterns
export const useAuth = () => {
  const user = useAppStore((state) => state.user);
  const currentTenant = useAppStore((state) => state.currentTenant);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  return { user, currentTenant, isAuthenticated };
};

export const useData = () => {
  const entities = useAppStore((state) => state.entities);
  const transactions = useAppStore((state) => state.transactions);

  return { entities, transactions };
};

export const useUI = () => {
  const theme = useAppStore((state) => state.theme);
  const isOnline = useAppStore((state) => state.isOnline);
  const isSyncing = useAppStore((state) => state.isSyncing);

  return { theme, isOnline, isSyncing };
};

export const useIntegrations = () => {
  const activeIntegrations = useAppStore((state) => state.activeIntegrations);
  const integrationData = useAppStore((state) => state.integrationData);

  return { activeIntegrations, integrationData };
};
