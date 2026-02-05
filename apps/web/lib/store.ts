import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Account, 
  Supplier, 
  Customer, 
  SupplyItem,
  SyncStatus,
  OfflineQueueItem 
} from './types';

interface AppStore {
  // Master data
  accounts: Account[];
  suppliers: Supplier[];
  customers: Customer[];
  supplyItems: SupplyItem[];
  
  // Sync state
  syncStatus: SyncStatus;
  offlineQueue: OfflineQueueItem[];
  
  // Actions
  setAccounts: (accounts: Account[]) => void;
  setSuppliers: (suppliers: Supplier[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setSupplyItems: (items: SupplyItem[]) => void;
  
  addToOfflineQueue: (item: OfflineQueueItem) => void;
  removeFromOfflineQueue: (id: string) => void;
  clearOfflineQueue: () => void;
  
  setOnlineStatus: (isOnline: boolean) => void;
  setLastSync: (timestamp: string) => void;
  setIsSyncing: (isSyncing: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Initial state
      accounts: [],
      suppliers: [],
      customers: [],
      supplyItems: [],
      
      syncStatus: {
        isOnline: true,
        lastSync: undefined,
        pendingItems: 0,
        isSyncing: false,
      },
      
      offlineQueue: [],
      
      // Actions
      setAccounts: (accounts) => set({ accounts }),
      setSuppliers: (suppliers) => set({ suppliers }),
      setCustomers: (customers) => set({ customers }),
      setSupplyItems: (items) => set({ supplyItems: items }),
      
      addToOfflineQueue: (item) => set((state) => ({
        offlineQueue: [...state.offlineQueue, item],
        syncStatus: {
          ...state.syncStatus,
          pendingItems: state.offlineQueue.length + 1,
        },
      })),
      
      removeFromOfflineQueue: (id) => set((state) => ({
        offlineQueue: state.offlineQueue.filter((item) => item.id !== id),
        syncStatus: {
          ...state.syncStatus,
          pendingItems: state.offlineQueue.length - 1,
        },
      })),
      
      clearOfflineQueue: () => set((state) => ({
        offlineQueue: [],
        syncStatus: {
          ...state.syncStatus,
          pendingItems: 0,
        } as SyncStatus,
      })),
      
      setOnlineStatus: (isOnline) => set((state) => ({
        syncStatus: {
          ...state.syncStatus,
          isOnline,
        },
      })),
      
      setLastSync: (timestamp) => set((state) => ({
        syncStatus: {
          ...state.syncStatus,
          lastSync: timestamp,
        },
      })),
      
      setIsSyncing: (isSyncing) => set((state) => ({
        syncStatus: {
          ...state.syncStatus,
          isSyncing,
        },
      })),
    }),
    {
      name: 'ledger-app-storage',
      partialize: (state) => ({
        // Only persist offline queue and sync status
        offlineQueue: state.offlineQueue,
        syncStatus: state.syncStatus,
      }),
    }
  )
);
