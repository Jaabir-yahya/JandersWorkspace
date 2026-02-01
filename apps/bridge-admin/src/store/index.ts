import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Person,
  Transaction,
  Item,
  Note,
  DashboardStats,
  Integration,
  Notification,
  User,
  AdminView,
  TransactionFilter,
  TableSortState,
  TablePaginationState,
} from "../types";

// Generate UUID
const generateId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ==================== PEOPLE STORE ====================

interface PeopleState {
  people: Person[];
  selectedPersonIds: string[];
  addPerson: (person: Omit<Person, "id" | "createdAt" | "updatedAt">) => Person;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  deleteManyPeople: (ids: string[]) => void;
  getPersonById: (id: string) => Person | undefined;
  getPeopleByType: (type: Person["type"]) => Person[];
  getPeopleWithCredit: () => Person[];
  searchPeople: (query: string) => Person[];
  addTagToPerson: (personId: string, tag: string) => void;
  removeTagFromPerson: (personId: string, tag: string) => void;
  setSelectedPeople: (ids: string[]) => void;
  togglePersonSelection: (id: string) => void;
  clearPersonSelection: () => void;
}

export const usePeopleStore = create<PeopleState>()(
  persist(
    (set, get) => ({
      people: [],
      selectedPersonIds: [],

      addPerson: (input) => {
        const person: Person = {
          id: generateId(),
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ people: [...state.people, person] }));
        return person;
      },

      updatePerson: (id, updates) => {
        set((state) => ({
          people: state.people.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p,
          ),
        }));
      },

      deletePerson: (id) => {
        set((state) => ({
          people: state.people.filter((p) => p.id !== id),
          selectedPersonIds: state.selectedPersonIds.filter(
            (pid) => pid !== id,
          ),
        }));
      },

      deleteManyPeople: (ids) => {
        set((state) => ({
          people: state.people.filter((p) => !ids.includes(p.id)),
          selectedPersonIds: state.selectedPersonIds.filter(
            (pid) => !ids.includes(pid),
          ),
        }));
      },

      getPersonById: (id) => get().people.find((p) => p.id === id),
      getPeopleByType: (type) =>
        get().people.filter((p) => p.type === type && p.isActive),
      getPeopleWithCredit: () =>
        get().people.filter((p) => p.creditBalance !== 0),
      searchPeople: (query) => {
        const lowercaseQuery = query.toLowerCase();
        return get().people.filter(
          (p) =>
            p.name.toLowerCase().includes(lowercaseQuery) ||
            p.phone?.includes(query) ||
            p.tags.some((t) => t.toLowerCase().includes(lowercaseQuery)),
        );
      },

      addTagToPerson: (personId, tag) => {
        set((state) => ({
          people: state.people.map((p) =>
            p.id === personId && !p.tags.includes(tag)
              ? { ...p, tags: [...p.tags, tag], updatedAt: new Date() }
              : p,
          ),
        }));
      },

      removeTagFromPerson: (personId, tag) => {
        set((state) => ({
          people: state.people.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  tags: p.tags.filter((t) => t !== tag),
                  updatedAt: new Date(),
                }
              : p,
          ),
        }));
      },

      setSelectedPeople: (ids) => set({ selectedPersonIds: ids }),
      togglePersonSelection: (id) =>
        set((state) => ({
          selectedPersonIds: state.selectedPersonIds.includes(id)
            ? state.selectedPersonIds.filter((pid) => pid !== id)
            : [...state.selectedPersonIds, id],
        })),
      clearPersonSelection: () => set({ selectedPersonIds: [] }),
    }),
    { name: "bridge-admin-people" },
  ),
);

// ==================== TRANSACTIONS STORE ====================

interface TransactionsState {
  transactions: Transaction[];
  selectedTransactionIds: string[];
  filter: TransactionFilter;
  sort: TableSortState;
  pagination: TablePaginationState;

  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteManyTransactions: (ids: string[]) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionsByPerson: (personId: string) => Transaction[];
  getTransactionsByType: (type: Transaction["type"]) => Transaction[];
  getPendingCredit: () => Transaction[];
  getFilteredTransactions: () => Transaction[];
  setFilter: (filter: Partial<TransactionFilter>) => void;
  setSort: (sort: TableSortState) => void;
  setPagination: (pagination: Partial<TablePaginationState>) => void;
  setSelectedTransactions: (ids: string[]) => void;
  toggleTransactionSelection: (id: string) => void;
  clearTransactionSelection: () => void;
  exportTransactions: () => string;
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],
      selectedTransactionIds: [],
      filter: {
        dateRange: { period: "this_month" },
        type: "all",
        paymentMethod: "all",
        personId: "all",
        category: "all",
        status: "all",
        minAmount: null,
        maxAmount: null,
        isCredit: null,
      },
      sort: { field: "date", direction: "desc" },
      pagination: { page: 1, pageSize: 25, total: 0 },

      addTransaction: (input) => {
        const transaction: Transaction = {
          id: generateId(),
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          transactions: [...state.transactions, transaction],
        }));
        return transaction;
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t,
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
          selectedTransactionIds: state.selectedTransactionIds.filter(
            (tid) => tid !== id,
          ),
        }));
      },

      deleteManyTransactions: (ids) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => !ids.includes(t.id)),
          selectedTransactionIds: state.selectedTransactionIds.filter(
            (tid) => !ids.includes(tid),
          ),
        }));
      },

      getTransactionById: (id) => get().transactions.find((t) => t.id === id),
      getTransactionsByPerson: (personId) =>
        get().transactions.filter((t) => t.personId === personId),
      getTransactionsByType: (type) =>
        get().transactions.filter((t) => t.type === type),
      getPendingCredit: () =>
        get().transactions.filter(
          (t) => t.isCredit && !t.creditPaid && t.type === "sale",
        ),

      getFilteredTransactions: () => {
        const { transactions, filter, sort } = get();
        let filtered = transactions;

        if (filter.type !== "all") {
          filtered = filtered.filter((t) => t.type === filter.type);
        }
        if (filter.paymentMethod !== "all") {
          filtered = filtered.filter(
            (t) => t.paymentMethod === filter.paymentMethod,
          );
        }
        if (filter.personId !== "all") {
          filtered = filtered.filter((t) => t.personId === filter.personId);
        }
        if (filter.category !== "all") {
          filtered = filtered.filter((t) => t.category === filter.category);
        }
        if (filter.status !== "all") {
          filtered = filtered.filter((t) => t.status === filter.status);
        }
        if (filter.isCredit !== null) {
          filtered = filtered.filter((t) => t.isCredit === filter.isCredit);
        }
        if (filter.minAmount !== null) {
          filtered = filtered.filter((t) => t.amount >= filter.minAmount!);
        }
        if (filter.maxAmount !== null) {
          filtered = filtered.filter((t) => t.amount <= filter.maxAmount!);
        }

        filtered.sort((a, b) => {
          const direction = sort.direction === "asc" ? 1 : -1;
          switch (sort.field) {
            case "date":
              return (
                (new Date(a.date).getTime() - new Date(b.date).getTime()) *
                direction
              );
            case "amount":
              return (a.amount - b.amount) * direction;
            case "description":
              return a.description.localeCompare(b.description) * direction;
            default:
              return 0;
          }
        });

        return filtered;
      },

      setFilter: (filter) =>
        set((state) => ({ filter: { ...state.filter, ...filter } })),
      setSort: (sort) => set({ sort }),
      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),
      setSelectedTransactions: (ids) => set({ selectedTransactionIds: ids }),
      toggleTransactionSelection: (id) =>
        set((state) => ({
          selectedTransactionIds: state.selectedTransactionIds.includes(id)
            ? state.selectedTransactionIds.filter((tid) => tid !== id)
            : [...state.selectedTransactionIds, id],
        })),
      clearTransactionSelection: () => set({ selectedTransactionIds: [] }),

      exportTransactions: () => {
        const transactions = get().getFilteredTransactions();
        const headers = [
          "Date",
          "Type",
          "Description",
          "Amount",
          "Payment Method",
          "Person",
          "Status",
        ];
        const rows = transactions.map((t) => [
          new Date(t.date).toISOString(),
          t.type,
          t.description,
          t.amount,
          t.paymentMethod,
          t.personName || "",
          t.status,
        ]);
        return [headers, ...rows].map((row) => row.join(",")).join("\n");
      },
    }),
    { name: "bridge-admin-transactions" },
  ),
);

// ==================== ITEMS STORE ====================

interface ItemsState {
  items: Item[];
  selectedItemIds: string[];
  addItem: (
    item: Omit<
      Item,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "profitMargin"
      | "stockValue"
      | "lowStockAlert"
    >,
  ) => Item;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  deleteManyItems: (ids: string[]) => void;
  getItemById: (id: string) => Item | undefined;
  getItemsByCategory: (category: string) => Item[];
  getLowStockItems: () => Item[];
  searchItems: (query: string) => Item[];
  adjustStock: (itemId: string, quantity: number, reason: string) => void;
  setSelectedItems: (ids: string[]) => void;
  toggleItemSelection: (id: string) => void;
  clearItemSelection: () => void;
}

export const useItemsStore = create<ItemsState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedItemIds: [],

      addItem: (input) => {
        const item: Item = {
          id: generateId(),
          ...input,
          profitMargin:
            input.sellingPrice > 0
              ? ((input.sellingPrice - input.costPrice) / input.sellingPrice) *
                100
              : 0,
          stockValue:
            input.currentStock * (input.avgCostPrice || input.costPrice),
          lowStockAlert: input.currentStock <= input.reorderLevel,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ items: [...state.items, item] }));
        return item;
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item;
            const updated = { ...item, ...updates, updatedAt: new Date() };
            if (updates.sellingPrice || updates.costPrice) {
              updated.profitMargin =
                updated.sellingPrice > 0
                  ? ((updated.sellingPrice - updated.costPrice) /
                      updated.sellingPrice) *
                    100
                  : 0;
            }
            if (updates.currentStock || updates.avgCostPrice) {
              updated.stockValue =
                updated.currentStock *
                (updated.avgCostPrice || updated.costPrice);
            }
            updated.lowStockAlert =
              updated.currentStock <= updated.reorderLevel;
            return updated;
          }),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          selectedItemIds: state.selectedItemIds.filter((iid) => iid !== id),
        }));
      },

      deleteManyItems: (ids) => {
        set((state) => ({
          items: state.items.filter((item) => !ids.includes(item.id)),
          selectedItemIds: state.selectedItemIds.filter(
            (iid) => !ids.includes(iid),
          ),
        }));
      },

      getItemById: (id) => get().items.find((item) => item.id === id),
      getItemsByCategory: (category) =>
        get().items.filter(
          (item) => item.category === category && item.isActive,
        ),
      getLowStockItems: () =>
        get().items.filter(
          (item) => item.currentStock <= item.reorderLevel && item.isActive,
        ),
      searchItems: (query) => {
        const lowercaseQuery = query.toLowerCase();
        return get().items.filter(
          (item) =>
            item.name.toLowerCase().includes(lowercaseQuery) ||
            item.description?.toLowerCase().includes(lowercaseQuery) ||
            item.tags.some((t) => t.toLowerCase().includes(lowercaseQuery)),
        );
      },

      adjustStock: (itemId, quantity, _reason) => {
        const item = get().getItemById(itemId);
        if (!item) return;
        const newStock = item.currentStock + quantity;
        get().updateItem(itemId, { currentStock: newStock });
      },

      setSelectedItems: (ids) => set({ selectedItemIds: ids }),
      toggleItemSelection: (id) =>
        set((state) => ({
          selectedItemIds: state.selectedItemIds.includes(id)
            ? state.selectedItemIds.filter((iid) => iid !== id)
            : [...state.selectedItemIds, id],
        })),
      clearItemSelection: () => set({ selectedItemIds: [] }),
    }),
    { name: "bridge-admin-items" },
  ),
);

// ==================== NOTES STORE ====================

interface NotesState {
  notes: Note[];
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
  getNotesByPerson: (personId: string) => Note[];
  getNotesByTransaction: (transactionId: string) => Note[];
  getNotesByItem: (itemId: string) => Note[];
  searchNotes: (query: string) => Note[];
  getReminders: () => Note[];
  completeReminder: (id: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (input) => {
        const note: Note = {
          id: generateId(),
          ...input,
          photos: input.photos || [],
          tags: input.tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ notes: [...state.notes, note] }));
        return note;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n,
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
      },

      getNoteById: (id) => get().notes.find((n) => n.id === id),
      getNotesByPerson: (personId) =>
        get().notes.filter((n) => n.personId === personId),
      getNotesByTransaction: (transactionId) =>
        get().notes.filter((n) => n.transactionId === transactionId),
      getNotesByItem: (itemId) =>
        get().notes.filter((n) => n.itemId === itemId),
      searchNotes: (query) => {
        const lowercaseQuery = query.toLowerCase();
        return get().notes.filter(
          (n) =>
            n.title?.toLowerCase().includes(lowercaseQuery) ||
            n.content.toLowerCase().includes(lowercaseQuery) ||
            n.tags.some((t) => t.toLowerCase().includes(lowercaseQuery)),
        );
      },
      getReminders: () => {
        const now = new Date();
        return get().notes.filter(
          (n) =>
            n.reminderDate &&
            !n.isReminderCompleted &&
            new Date(n.reminderDate) <= now,
        );
      },
      completeReminder: (id) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, isReminderCompleted: true, updatedAt: new Date() }
              : n,
          ),
        }));
      },
    }),
    { name: "bridge-admin-notes" },
  ),
);

// ==================== UI STATE STORE ====================

interface UIState {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  currentView: AdminView;
  searchQuery: string;
  isOnline: boolean;
  pendingSyncs: number;
  lastSyncAt?: Date;

  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setCurrentView: (view: AdminView) => void;
  setSearchQuery: (query: string) => void;
  setOnline: (isOnline: boolean) => void;
  incrementPendingSyncs: () => void;
  decrementPendingSyncs: () => void;
  resetPendingSyncs: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      darkMode: false,
      currentView: "dashboard",
      searchQuery: "",
      isOnline: true,
      pendingSyncs: 0,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setCurrentView: (view) => set({ currentView: view }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setOnline: (isOnline) => set({ isOnline }),
      incrementPendingSyncs: () =>
        set((state) => ({ pendingSyncs: state.pendingSyncs + 1 })),
      decrementPendingSyncs: () =>
        set((state) => ({ pendingSyncs: Math.max(0, state.pendingSyncs - 1) })),
      resetPendingSyncs: () => set({ pendingSyncs: 0 }),
    }),
    { name: "bridge-admin-ui" },
  ),
);

// ==================== DASHBOARD STATS STORE ====================

interface DashboardStatsState {
  stats: DashboardStats;
  isLoading: boolean;
  lastUpdated?: Date;

  refreshStats: () => void;
  setStats: (stats: Partial<DashboardStats>) => void;
}

const defaultStats: DashboardStats = {
  totalRevenue: 0,
  totalExpenses: 0,
  netProfit: 0,
  activeCustomers: 0,
  revenueTrend: 0,
  expensesTrend: 0,
  profitTrend: 0,
  customersTrend: 0,
  period: "month",
  pendingTransactions: 0,
  pendingCredit: 0,
  lowStockItems: 0,
  unreadNotifications: 0,
};

export const useDashboardStatsStore = create<DashboardStatsState>()(
  persist(
    (set, get) => ({
      stats: defaultStats,
      isLoading: false,

      refreshStats: () => {
        set({ isLoading: true });
        const transactions = useTransactionsStore.getState().transactions;
        const people = usePeopleStore.getState().people;
        const items = useItemsStore.getState().items;

        const revenue = transactions
          .filter((t) => t.type === "sale" && !t.isCredit)
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
          .filter((t) => t.type === "expense" || t.type === "purchase")
          .reduce((sum, t) => sum + t.amount, 0);

        const activeCustomers = people.filter(
          (p) => p.type === "customer" && p.isActive,
        ).length;
        const pendingCredit = transactions.filter(
          (t) => t.isCredit && !t.creditPaid,
        ).length;
        const lowStockItems = items.filter(
          (i) => i.currentStock <= i.reorderLevel,
        ).length;

        set({
          stats: {
            ...get().stats,
            totalRevenue: revenue,
            totalExpenses: expenses,
            netProfit: revenue - expenses,
            activeCustomers,
            pendingCredit,
            lowStockItems,
            pendingTransactions: transactions.filter(
              (t) => t.status === "draft",
            ).length,
          },
          isLoading: false,
          lastUpdated: new Date(),
        });
      },

      setStats: (stats) =>
        set((state) => ({ stats: { ...state.stats, ...stats } })),
    }),
    { name: "bridge-admin-dashboard-stats" },
  ),
);

// ==================== INTEGRATIONS STORE ====================

interface IntegrationsState {
  integrations: Integration[];
  isLoading: boolean;

  addIntegration: (
    integration: Omit<Integration, "id" | "createdAt" | "updatedAt">,
  ) => Integration;
  updateIntegration: (id: string, updates: Partial<Integration>) => void;
  deleteIntegration: (id: string) => void;
  getIntegrationById: (id: string) => Integration | undefined;
  getIntegrationsByType: (type: Integration["type"]) => Integration[];
  syncIntegration: (id: string) => Promise<void>;
  testIntegration: (id: string) => Promise<boolean>;
}

export const useIntegrationsStore = create<IntegrationsState>()(
  persist(
    (set, get) => ({
      integrations: [],
      isLoading: false,

      addIntegration: (input) => {
        const integration: Integration = {
          id: generateId(),
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          integrations: [...state.integrations, integration],
        }));
        return integration;
      },

      updateIntegration: (id, updates) => {
        set((state) => ({
          integrations: state.integrations.map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: new Date() } : i,
          ),
        }));
      },

      deleteIntegration: (id) => {
        set((state) => ({
          integrations: state.integrations.filter((i) => i.id !== id),
        }));
      },

      getIntegrationById: (id) => get().integrations.find((i) => i.id === id),
      getIntegrationsByType: (type) =>
        get().integrations.filter((i) => i.type === type),

      syncIntegration: async (id) => {
        const integration = get().getIntegrationById(id);
        if (!integration) return;

        set((state) => ({
          integrations: state.integrations.map((i) =>
            i.id === id ? { ...i, status: "syncing" } : i,
          ),
        }));

        await new Promise((resolve) => setTimeout(resolve, 1000));

        set((state) => ({
          integrations: state.integrations.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: "connected",
                  lastSyncAt: new Date(),
                  lastSyncStatus: "success",
                }
              : i,
          ),
        }));
      },

      testIntegration: async (_id) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return true;
      },
    }),
    { name: "bridge-admin-integrations" },
  ),
);

// ==================== NOTIFICATIONS STORE ====================

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;

  addNotification: (
    notification: Omit<Notification, "id" | "isRead" | "createdAt">,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  getUnread: () => Notification[];
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (input) => {
        const notification: Notification = {
          id: generateId(),
          ...input,
          isRead: false,
          createdAt: new Date(),
        };
        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n,
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            isRead: true,
          })),
          unreadCount: 0,
        }));
      },

      deleteNotification: (id) => {
        const notification = get().notifications.find((n) => n.id === id);
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: notification?.isRead
            ? state.unreadCount
            : Math.max(0, state.unreadCount - 1),
        }));
      },

      clearAll: () => set({ notifications: [], unreadCount: 0 }),
      getUnread: () => get().notifications.filter((n) => !n.isRead),
    }),
    { name: "bridge-admin-notifications" },
  ),
);

// ==================== USER STORE ====================

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;

  setUser: (user: User) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,

      setUser: (user) => set({ currentUser: user, isAuthenticated: true }),
      clearUser: () => set({ currentUser: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...updates }
            : null,
        })),
      hasPermission: (permission) => {
        const user = get().currentUser;
        return (
          user?.role === "owner" ||
          user?.permissions.includes(permission) ||
          false
        );
      },
    }),
    { name: "bridge-admin-user" },
  ),
);

// ==================== UTILITY FUNCTIONS ====================

export function getRandomColor(): string {
  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
