import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Person,
  Transaction,
  Item,
  Note,
  Tag,
  QuickPersonInput,
  QuickTransactionInput,
  DailySummary,
  AppState,
  Screen,
} from "../types";

// Generate UUID (simple version for client-side)
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
  addPerson: (input: QuickPersonInput) => Person;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  getPersonById: (id: string) => Person | undefined;
  getPeopleByType: (type: Person["type"]) => Person[];
  getPeopleWithCredit: () => Person[];
  searchPeople: (query: string) => Person[];
  addTagToPerson: (personId: string, tag: string) => void;
  removeTagFromPerson: (personId: string, tag: string) => void;
}

export const usePeopleStore = create<PeopleState>()(
  persist(
    (set, get) => ({
      people: [],

      addPerson: (input) => {
        const person: Person = {
          id: generateId(),
          name: input.name,
          phone: input.phone,
          type: input.type,
          photo: input.photo,
          notes: input.note,
          tags: [],
          creditBalance: 0,
          totalSpent: 0,
          totalSupplied: 0,
          transactionCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        };

        set((state) => ({
          people: [...state.people, person],
        }));

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
        }));
      },

      getPersonById: (id) => {
        return get().people.find((p) => p.id === id);
      },

      getPeopleByType: (type) => {
        return get().people.filter((p) => p.type === type && p.isActive);
      },

      getPeopleWithCredit: () => {
        return get().people.filter((p) => p.creditBalance !== 0);
      },

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
    }),
    {
      name: "bridge-people-storage",
    },
  ),
);

// ==================== TRANSACTIONS STORE ====================

interface TransactionsState {
  transactions: Transaction[];
  addTransaction: (input: QuickTransactionInput) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionsByDate: (date: Date) => Transaction[];
  getTransactionsByPerson: (personId: string) => Transaction[];
  getTransactionsByType: (type: Transaction["type"]) => Transaction[];
  getPendingCredit: () => Transaction[];
  getDailySummary: (date: Date) => DailySummary;
  getUnsyncedTransactions: () => Transaction[];
  markAsSynced: (id: string) => void;
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (input) => {
        const transaction: Transaction = {
          id: generateId(),
          type: input.type,
          status: "confirmed",
          amount: input.amount,
          currency: "KES", // Default, can be made dynamic
          paymentMethod: input.paymentMethod,
          personId: input.personId,
          personName: input.personName,
          description: input.description,
          category: input.category,
          tags: [],
          isCredit: input.isCredit || false,
          creditPaid: input.isCredit ? false : true,
          receiptPhoto: input.receiptPhoto,
          notes: input.notes,
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          synced: false,
        };

        set((state) => ({
          transactions: [...state.transactions, transaction],
        }));

        // Update person stats if linked
        if (input.personId) {
          const peopleStore = usePeopleStore.getState();
          const person = peopleStore.getPersonById(input.personId);
          if (person) {
            const updates: Partial<Person> = {
              lastTransactionDate: new Date(),
              transactionCount: person.transactionCount + 1,
            };

            if (input.type === "sale") {
              updates.totalSpent = person.totalSpent + input.amount;
              if (input.isCredit) {
                updates.creditBalance = person.creditBalance + input.amount;
              }
            } else if (input.type === "purchase") {
              // For suppliers
              updates.totalSupplied =
                (person.totalSupplied || 0) + input.amount;
            }

            peopleStore.updatePerson(input.personId, updates);
          }
        }

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
        }));
      },

      getTransactionById: (id) => {
        return get().transactions.find((t) => t.id === id);
      },

      getTransactionsByDate: (date) => {
        const targetDate = new Date(date).toDateString();
        return get().transactions.filter(
          (t) => new Date(t.date).toDateString() === targetDate,
        );
      },

      getTransactionsByPerson: (personId) => {
        return get().transactions.filter((t) => t.personId === personId);
      },

      getTransactionsByType: (type) => {
        return get().transactions.filter((t) => t.type === type);
      },

      getPendingCredit: () => {
        return get().transactions.filter(
          (t) => t.isCredit && !t.creditPaid && t.type === "sale",
        );
      },

      getDailySummary: (date) => {
        const transactions = get().getTransactionsByDate(date);

        let revenue = 0;
        let expenses = 0;
        let creditGiven = 0;
        const paymentMethods: Record<string, number> = {};
        const categories: Record<string, number> = {};

        transactions.forEach((t) => {
          if (t.type === "sale") {
            if (!t.isCredit) {
              revenue += t.amount;
            } else {
              creditGiven += t.amount;
            }
          } else if (t.type === "expense") {
            expenses += t.amount;
          } else if (t.type === "purchase") {
            expenses += t.amount;
          }

          // Payment method breakdown
          paymentMethods[t.paymentMethod] =
            (paymentMethods[t.paymentMethod] || 0) + t.amount;

          // Category breakdown
          if (t.category) {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
          }
        });

        return {
          date,
          revenue,
          expenses,
          profit: revenue - expenses,
          transactionCount: transactions.length,
          paymentMethods,
          categories,
          creditGiven,
          creditReceived: 0, // Calculated separately
          alerts: [],
        };
      },

      getUnsyncedTransactions: () => {
        return get().transactions.filter((t) => !t.synced);
      },

      markAsSynced: (id) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, synced: true } : t,
          ),
        }));
      },
    }),
    {
      name: "bridge-transactions-storage",
    },
  ),
);

// ==================== ITEMS STORE ====================

interface ItemsState {
  items: Item[];
  addItem: (item: Omit<Item, "id" | "createdAt" | "updatedAt">) => Item;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => Item | undefined;
  getItemsByCategory: (category: string) => Item[];
  getLowStockItems: () => Item[];
  searchItems: (query: string) => Item[];
  adjustStock: (itemId: string, quantity: number, reason: string) => void;
}

export const useItemsStore = create<ItemsState>()(
  persist(
    (set, get) => ({
      items: [],

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
          isActive: true,
        };

        set((state) => ({
          items: [...state.items, item],
        }));

        return item;
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item;

            const updated = { ...item, ...updates, updatedAt: new Date() };

            // Recalculate derived fields
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
        }));
      },

      getItemById: (id) => {
        return get().items.find((item) => item.id === id);
      },

      getItemsByCategory: (category) => {
        return get().items.filter(
          (item) => item.category === category && item.isActive,
        );
      },

      getLowStockItems: () => {
        return get().items.filter(
          (item) => item.currentStock <= item.reorderLevel && item.isActive,
        );
      },

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

        // TODO: Create stock movement record
      },
    }),
    {
      name: "bridge-items-storage",
    },
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
  getNotesByTag: (tag: string) => Note[];
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

        set((state) => ({
          notes: [...state.notes, note],
        }));

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
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        }));
      },

      getNoteById: (id) => {
        return get().notes.find((n) => n.id === id);
      },

      getNotesByPerson: (personId) => {
        return get().notes.filter((n) => n.personId === personId);
      },

      getNotesByTransaction: (transactionId) => {
        return get().notes.filter((n) => n.transactionId === transactionId);
      },

      getNotesByItem: (itemId) => {
        return get().notes.filter((n) => n.itemId === itemId);
      },

      getNotesByTag: (tag) => {
        return get().notes.filter((n) => n.tags.includes(tag));
      },

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
    {
      name: "bridge-notes-storage",
    },
  ),
);

// ==================== TAGS STORE ====================

interface TagsState {
  tags: Tag[];
  addTag: (name: string, color?: string) => Tag;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  getTagByName: (name: string) => Tag | undefined;
  incrementTagCount: (name: string) => void;
  decrementTagCount: (name: string) => void;
}

export const useTagsStore = create<TagsState>()(
  persist(
    (set, get) => ({
      tags: [],

      addTag: (name, color) => {
        // Check if tag already exists
        const existing = get().getTagByName(name);
        if (existing) return existing;

        const tag: Tag = {
          id: generateId(),
          name: name.toLowerCase().trim(),
          color: color || getRandomColor(),
          count: 0,
        };

        set((state) => ({
          tags: [...state.tags, tag],
        }));

        return tag;
      },

      updateTag: (id, updates) => {
        set((state) => ({
          tags: state.tags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== id),
        }));
      },

      getTagByName: (name) => {
        return get().tags.find((t) => t.name === name.toLowerCase().trim());
      },

      incrementTagCount: (name) => {
        set((state) => ({
          tags: state.tags.map((t) =>
            t.name === name.toLowerCase().trim()
              ? { ...t, count: t.count + 1 }
              : t,
          ),
        }));
      },

      decrementTagCount: (name) => {
        set((state) => ({
          tags: state.tags.map((t) =>
            t.name === name.toLowerCase().trim() && t.count > 0
              ? { ...t, count: t.count - 1 }
              : t,
          ),
        }));
      },
    }),
    {
      name: "bridge-tags-storage",
    },
  ),
);

// ==================== APP STATE STORE ====================

interface AppStoreState extends AppState {
  setOnline: (isOnline: boolean) => void;
  setCurrentScreen: (screen: Screen) => void;
  setSelectedDate: (date: Date) => void;
  setTenant: (
    tenantId: string,
    tenantSlug: string,
    tenantName: string,
    currency: string,
  ) => void;
  incrementPendingSyncs: () => void;
  decrementPendingSyncs: () => void;
  resetPendingSyncs: () => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      isOnline: true,
      pendingSyncs: 0,
      currentScreen: "dashboard",
      selectedDate: new Date(),
      currency: "KES",

      setOnline: (isOnline) => set({ isOnline }),

      setCurrentScreen: (screen) => set({ currentScreen: screen }),

      setSelectedDate: (date) => set({ selectedDate: date }),

      setTenant: (tenantId, tenantSlug, tenantName, currency) =>
        set({ tenantId, tenantSlug, tenantName, currency }),

      incrementPendingSyncs: () =>
        set((state) => ({ pendingSyncs: state.pendingSyncs + 1 })),

      decrementPendingSyncs: () =>
        set((state) => ({ pendingSyncs: Math.max(0, state.pendingSyncs - 1) })),

      resetPendingSyncs: () => set({ pendingSyncs: 0 }),
    }),
    {
      name: "bridge-app-storage",
    },
  ),
);

// ==================== UTILITY FUNCTIONS ====================

function getRandomColor(): string {
  const colors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#84cc16", // lime
    "#22c55e", // green
    "#10b981", // emerald
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#0ea5e9", // sky
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#d946ef", // fuchsia
    "#ec4899", // pink
    "#f43f5e", // rose
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
