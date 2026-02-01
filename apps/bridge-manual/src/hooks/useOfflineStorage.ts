/**
 * Offline Storage Hook
 * Enables offline transaction storage for Nairobi users with poor connectivity
 */

import { useState, useEffect } from "react";

interface OfflineTransaction {
  id: string;
  amount: number;
  description: string;
  type: "sale" | "expense";
  currency: string;
  method: string;
  timestamp: Date;
  synced: boolean;
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineCount, setOfflineCount] = useState(0);
  const [storage, setStorage] = useState<OfflineTransaction[]>([]);

  // Monitor connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load offline storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bridge_offline_transactions");
      if (stored) {
        const transactions = JSON.parse(stored).map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }));
        setStorage(transactions);
        setOfflineCount(
          transactions.filter((t: OfflineTransaction) => !t.synced).length,
        );
      }
    } catch (error) {
      console.error("Failed to load offline transactions:", error);
    }
  }, []);

  // Save to localStorage
  const saveToLocalStorage = (transactions: OfflineTransaction[]) => {
    try {
      localStorage.setItem(
        "bridge_offline_transactions",
        JSON.stringify(transactions),
      );
      setOfflineCount(transactions.filter((t) => !t.synced).length);
    } catch (error) {
      console.error("Failed to save offline transactions:", error);
    }
  };

  // Add transaction to offline storage
  const addOfflineTransaction = (
    transaction: Omit<OfflineTransaction, "id" | "timestamp" | "synced">,
  ) => {
    const newTransaction: OfflineTransaction = {
      ...transaction,
      id: `offline_${Date.now()}`,
      timestamp: new Date(),
      synced: false,
    };

    const updatedStorage = [...storage, newTransaction];
    setStorage(updatedStorage);
    saveToLocalStorage(updatedStorage);

    return newTransaction;
  };

  // Sync offline transactions when online
  const syncTransactions = async (): Promise<{
    success: number;
    failed: number;
  }> => {
    if (!isOnline) {
      return { success: 0, failed: 0 };
    }

    const unsyncedTransactions = storage.filter((t) => !t.synced);
    let successCount = 0;
    let failedCount = 0;

    for (const transaction of unsyncedTransactions) {
      try {
        // Convert to API format and sync
        await fetch("/api/v1/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add auth header if needed
          },
          body: JSON.stringify({
            amount: transaction.amount,
            description: transaction.description,
            type: transaction.type.toUpperCase(),
            currency: transaction.currency,
            method: transaction.method,
          }),
        });

        // Mark as synced
        const updatedStorage = storage.map((t) =>
          t.id === transaction.id ? { ...t, synced: true } : t,
        );
        setStorage(updatedStorage);
        saveToLocalStorage(updatedStorage);

        successCount++;
      } catch (error) {
        console.error(`Failed to sync transaction ${transaction.id}:`, error);
        failedCount++;
      }
    }

    return { success: successCount, failed: failedCount };
  };

  // Clear synced transactions older than 7 days
  const clearOldTransactions = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const filteredStorage = storage.filter(
      (t) => !t.synced || t.timestamp > sevenDaysAgo,
    );

    setStorage(filteredStorage);
    saveToLocalStorage(filteredStorage);
  };

  // Get unsynced transactions
  const getUnsyncedTransactions = () => storage.filter((t) => !t.synced);

  // Manual sync trigger
  const triggerSync = async () => {
    if (isOnline) {
      const result = await syncTransactions();
      if (result.success > 0) {
        // Show success notification
        console.log(`Synced ${result.success} transactions successfully`);
      }
      if (result.failed > 0) {
        // Show error notification
        console.error(`Failed to sync ${result.failed} transactions`);
      }
      return result;
    } else {
      console.log("Cannot sync while offline");
      return { success: 0, failed: 0 };
    }
  };

  return {
    isOnline,
    offlineCount,
    storage,
    addOfflineTransaction,
    syncTransactions,
    clearOldTransactions,
    getUnsyncedTransactions,
    triggerSync,
  };
}
