import { useState, useEffect } from "react";
import { Search, Plus, Zap, Wifi, WifiOff, RefreshCw } from "lucide-react";
import type { Entity, Transaction } from "@/types";
import {
  useEntityLookup,
  useQuickTransaction,
  useOfflineSync,
} from "@/hooks/use-optimized-hooks";
import { useAppStore } from "@/stores/app-store";

// Lightning-fast dashboard optimized for African commerce
export default function DashboardPage() {
  const { user, currentTenant, isOnline } = useAppStore();
  const { selectedEntity, handlePhoneLookup, lookupStatus, getRecentEntities } =
    useEntityLookup();

  const { amount, setAmount, commonAmounts, isProcessing } =
    useQuickTransaction();

  const { syncStatus, syncPendingOperations } = useOfflineSync();

  const [showSettings, setShowSettings] = useState(false);

  // Quick stats calculation from local state (optimized for speed)
  const quickStats = {
    todayTransactions: 0, // Would be calculated from today's transactions
    weekRevenue: 0, // Sum of this week's transactions
    outstandingCredit: 0, // Total owed to business
    activeCustomers: 0, // Customers with recent activity
  };

  useEffect(() => {
    // Vibration for feedback (African UX standard)
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      const handleTransactionComplete = () => navigator.vibrate(200);
      document.addEventListener(
        "transactionComplete",
        handleTransactionComplete,
      );

      return () => {
        document.removeEventListener(
          "transactionComplete",
          handleTransactionComplete,
        );
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Connectivity Status - Critical for African markets */}
      <div
        className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg text-sm font-medium ${
          syncStatus === "online"
            ? "status-online"
            : syncStatus === "offline"
              ? "status-offline"
              : "status-syncing"
        }`}
      >
        {syncStatus === "online" && <Wifi className="w-4 h-4 mr-2" />}
        {syncStatus === "offline" && <WifiOff className="w-4 h-4 mr-2" />}
        {syncStatus === "syncing" && (
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        )}
        {syncStatus === "online" && "Connected"}
        {syncStatus === "offline" && "Offline - Queued"}
        {syncStatus === "syncing" && "Syncing..."}
        {syncPendingOperations.length > 0 &&
          ` (${syncPendingOperations.length} pending)`}
      </div>

      {/* Header with tenant branding */}
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-kenya to-primary-nigeria rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">PB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Project Bridge</h1>
              <p className="text-sm text-muted-foreground">
                {currentTenant?.name || "Dashboard"}
                {isOnline && " • Online"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Quick Transaction Panel - Core African commerce feature */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-success-mpesa" />
            Quick Transaction
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Entity Selection */}
            <div className="mobile-card">
              <h3 className="text-lg font-semibold mb-4">Customer</h3>

              {/* Phone Lookup - Most common African pattern */}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="tel"
                    value={selectedEntity?.display_name || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length >= 9) {
                        handlePhoneLookup(value);
                      }
                    }}
                    placeholder="Enter phone number..."
                    className="phone-input w-full text-center text-lg"
                    autoFocus
                  />
                  {lookupStatus === "searching" && (
                    <div className="absolute right-3 top-3">
                      <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>

                {selectedEntity && (
                  <div className="mt-4 p-4 bg-success-mpesa text-white rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {selectedEntity.display_name}
                        </p>
                        <p className="text-sm opacity-90">
                          {selectedEntity.phone_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-75">Balance</p>
                        <p className="text-lg font-bold">
                          KES{" "}
                          {selectedEntity.balance
                            ? Math.abs(selectedEntity.balance / 100).toFixed(2)
                            : "0.00"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Customer Selection */}
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                  Recent Customers
                </h4>
                <div className="space-y-2">
                  {getRecentEntities()
                    .slice(0, 3)
                    .map((entity) => (
                      <button
                        key={entity.id}
                        onClick={() => {
                          setSelectedEntity(entity);
                          setAmount("");
                        }}
                        className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors quick-action"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {entity.display_name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {entity.phone_number}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Amount Entry */}
            <div className="mobile-card">
              <h3 className="text-lg font-semibold mb-4">Amount</h3>

              <div className="space-y-4">
                {/* Common Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {commonAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setAmount(String(amount))}
                      className="quick-action p-3 text-lg font-mono"
                    >
                      KES {amount}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="relative">
                  <div className="text-sm text-muted-foreground mb-1">
                    Custom Amount
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="amount-input w-full"
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute right-3 top-3 text-sm text-muted-foreground">
                    KES
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Today's Overview</h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="mobile-card text-center">
              <p className="text-sm text-muted-foreground mb-1">Transactions</p>
              <p className="text-2xl font-bold">
                {quickStats.todayTransactions}
              </p>
            </div>

            <div className="mobile-card text-center">
              <p className="text-sm text-muted-foreground mb-1">Revenue</p>
              <p className="text-2xl font-bold text-success-mpesa">
                KES {quickStats.weekRevenue.toLocaleString()}
              </p>
            </div>

            <div className="mobile-card text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Credit Outstanding
              </p>
              <p className="text-2xl font-bold text-amber-500">
                KES {quickStats.outstandingCredit.toLocaleString()}
              </p>
            </div>

            <div className="mobile-card text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Active Customers
              </p>
              <p className="text-2xl font-bold">{quickStats.activeCustomers}</p>
            </div>
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>

          <div className="mobile-card">
            <div className="transaction-list max-h-80">
              {/* Placeholder for recent transactions */}
              <div className="text-center py-8 text-muted-foreground">
                <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transactions yet today</p>
                <p className="text-sm mt-2">
                  Complete your first quick transaction above
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
