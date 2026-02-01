import { useState, useCallback } from "react";
import type { Entity, Transaction, SearchType } from "@/types";
import { useAppStore } from "@/stores/app-store";

// Hook for ultra-fast entity lookup and management
export const useEntityLookup = () => {
  const { entities, actions } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [lookupStatus, setLookupStatus] = useState<
    "idle" | "searching" | "found" | "not-found"
  >("idle");

  // Phone number pattern matching for African countries
  const phonePatterns = {
    kenya: /^\+254\d{9}$/,
    nigeria: /^\+234\d{10}$/,
    ghana: /^\+233\d{9}$/,
    uganda: /^\+256\d{9}$/,
    tanzania: /^\+255\d{9}$/,
  };

  const detectCountry = useCallback((phone: string) => {
    if (phonePatterns.kenya.test(phone)) return "Kenya";
    if (phonePatterns.nigeria.test(phone)) return "Nigeria";
    if (phonePatterns.ghana.test(phone)) return "Ghana";
    if (phonePatterns.uganda.test(phone)) return "Uganda";
    if (phonePatterns.tanzania.test(phone)) return "Tanzania";
    return "Unknown";
  }, []);

  const handlePhoneLookup = useCallback(
    async (phone: string) => {
      if (!phone || phone.length < 10) return;

      setLookupStatus("searching");

      try {
        // Simulate API call to your backend
        const response = await fetch(
          `/api/entities/phone/${encodeURIComponent(phone)}`,
        );
        const { entity } = await response.json();

        if (entity) {
          setSelectedEntity(entity);
          setLookupStatus("found");
          // Auto-select this entity in global store for easy access
          const existingIndex = entities.findIndex((e) => e.id === entity.id);
          if (existingIndex === -1) {
            actions.addEntity(entity);
          }
        } else {
          setLookupStatus("not-found");
        }
      } catch (error) {
        console.error("Phone lookup failed:", error);
        setLookupStatus("idle");
      }
    },
    [entities, actions],
  );

  const quickSelectRecent = useCallback(
    (entityId: string) => {
      const entity = entities.find((e) => e.id === entityId);
      if (entity) {
        setSelectedEntity(entity);
        setSearchQuery(entity.display_name);
      }
    },
    [entities],
  );

  const getRecentEntities = useCallback(() => {
    // Get recently accessed entities for quick selection
    return entities
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5);
  }, [entities]);

  return {
    searchQuery,
    selectedEntity,
    lookupStatus,
    detectCountry,
    handlePhoneLookup,
    quickSelectRecent,
    getRecentEntities,
    filteredEntities: entities.filter(
      (entity) =>
        entity.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.phone_number?.includes(searchQuery) ||
        entity.linked_phones?.some((phone) => phone.includes(searchQuery)),
    ),
  };
};

// Hook for fast transaction creation
export const useQuickTransaction = () => {
  const { entities, actions } = useAppStore();
  const [amount, setAmount] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [reference, setReference] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Common amounts for African market (in local currencies)
  const commonAmounts = {
    KES: [50, 100, 200, 500, 1000, 2000], // Kenya Shillings
    NGN: [100, 200, 500, 1000, 2000, 5000], // Nigerian Naira
    GHS: [10, 20, 50, 100, 200, 500], // Ghana Cedis
    UGX: [500, 1000, 2000, 5000, 10000], // Ugandan Shillings
    TZS: [1000, 2000, 5000, 10000, 20000], // Tanzanian Shillings
  };

  const getCurrencyCode = useCallback(() => {
    // Get currency from selected entity or user preference
    return selectedEntity?.metadata?.currency || "KES"; // Default to KES for Nairobi focus
  }, [selectedEntity]);

  const getCommonAmounts = useCallback(() => {
    const currency = getCurrencyCode();
    return (
      commonAmounts[currency as keyof typeof commonAmounts] || commonAmounts.KES
    );
  }, [getCurrencyCode]);

  const handleSubmit = useCallback(async () => {
    if (!selectedEntity || !amount || isProcessing) return;

    setIsProcessing(true);

    try {
      const transactionData = {
        entity_id: selectedEntity.id,
        type: "RETAIL", // Default to retail for quick transactions
        total_amount: parseFloat(amount) * 100, // Convert to cents
        currency_code: getCurrencyCode(),
        reference: reference || `TXN${Date.now()}`,
        context: "Quick transaction via mobile interface",
      };

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      const transaction = await response.json();

      if (transaction.id) {
        actions.addTransaction(transaction);

        // Reset form
        setAmount("");
        setReference("");
        setSelectedEntity(null);

        // Show success feedback for African UX
        if (navigator.vibrate) {
          navigator.vibrate(200); // Vibration for success
        }
      }
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedEntity, amount, reference, getCurrencyCode, actions]);

  return {
    amount,
    setAmount,
    selectedEntity,
    setSelectedEntity,
    reference,
    setReference,
    isProcessing,
    commonAmounts: getCommonAmounts(),
    handleSubmit,
  };
};

// Hook for offline-first data management
export const useOfflineSync = () => {
  const { entities, transactions, actions } = useAppStore();
  const [syncStatus, setSyncStatus] = useState<
    "online" | "offline" | "syncing"
  >("online");
  const [pendingOperations, setPendingOperations] = useState<any[]>([]);

  const saveOfflineOperation = useCallback((operation: any) => {
    // Save to IndexedDB for offline storage
    if ("indexedDB" in window) {
      const request = indexedDB.open("ProjectBridgeOffline", 1);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(["operations"], "readwrite");
        const store = tx.objectStore("operations");
        store.add(operation);
      };
    }

    setPendingOperations((prev) => [...prev, operation]);
  }, []);

  const syncPendingOperations = useCallback(async () => {
    if (!navigator.onLine || pendingOperations.length === 0) return;

    setSyncStatus("syncing");

    for (const operation of pendingOperations) {
      try {
        const response = await fetch(`/api/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(operation),
        });

        if (response.ok) {
          // Remove from pending operations
          setPendingOperations((prev) =>
            prev.filter((op) => op.id !== operation.id),
          );

          // Update local stores
          if (operation.type === "entity") {
            actions.addEntity(operation.data);
          } else if (operation.type === "transaction") {
            actions.addTransaction(operation.data);
          }
        }
      } catch (error) {
        console.error("Sync failed for operation:", operation, error);
      }
    }

    setSyncStatus("online");
  }, [pendingOperations, actions]);

  // Listen for connectivity changes
  useState(() => {
    const handleOnlineStatus = () => {
      setSyncStatus(navigator.onLine ? "online" : "offline");
      if (navigator.onLine) {
        syncPendingOperations();
      }
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  });

  return {
    syncStatus,
    pendingOperations,
    saveOfflineOperation,
    syncPendingOperations,
  };
};
