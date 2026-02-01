/**
 * Sync Status Component
 * Shows offline/online status and sync controls for Nairobi users
 */

"use client";

import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react";

export function SyncStatus() {
  const { isOnline, offlineCount, triggerSync } = useOfflineStorage();

  const handleSync = async () => {
    const button = document.getElementById("sync-button");
    if (button) {
      button.classList.add("animate-spin");
    }

    await triggerSync();

    if (button) {
      setTimeout(() => {
        button.classList.remove("animate-spin");
      }, 1000);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Connection Status */}
      <div
        className={`px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${
          isOnline ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Offline</span>
          </>
        )}
      </div>

      {/* Sync Status */}
      {offlineCount > 0 && (
        <div className="bg-orange-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{offlineCount} unsynced</span>
          </div>

          {isOnline && (
            <button
              id="sync-button"
              onClick={handleSync}
              className="mt-2 w-full bg-white text-orange-500 px-2 py-1 rounded text-sm font-medium hover:bg-orange-50 transition-colors flex items-center justify-center space-x-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Sync Now</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
