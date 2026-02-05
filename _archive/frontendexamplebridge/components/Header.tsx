'use client';

import { useEffect } from 'react';
import { Bell, Search, WifiOff, Wifi } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function Header() {
  const { syncStatus, setOnlineStatus } = useAppStore();

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    setOnlineStatus(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  return (
    <>
      {/* Offline Banner */}
      {!syncStatus.isOnline && (
        <div className="offline-banner animate-slide-down">
          <WifiOff className="inline-block mr-2 h-4 w-4" />
          You are offline. Changes will be synced when connection is restored.
          {syncStatus.pendingItems > 0 && (
            <span className="ml-2 font-bold">
              ({syncStatus.pendingItems} pending)
            </span>
          )}
        </div>
      )}

      <header className="sticky top-0 z-30 bg-white border-b border-baobab-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-baobab-400" />
                <input
                  type="text"
                  placeholder="Search transactions, invoices, suppliers..."
                  className="w-full pl-10 pr-4 py-2.5 bg-savanna-50 border border-baobab-200 rounded-lg text-sm placeholder:text-baobab-400 focus:bg-white focus:border-acacia-500 focus:ring-2 focus:ring-acacia-200 transition-all"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4 ml-6">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {syncStatus.isOnline ? (
                  <>
                    <Wifi className="h-5 w-5 text-acacia-600" />
                    <span className="text-sm text-baobab-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-clay-600" />
                    <span className="text-sm text-clay-600">Offline</span>
                  </>
                )}
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-baobab-600 hover:bg-baobab-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-clay-500 rounded-full"></span>
              </button>

              {/* Sync Status */}
              {syncStatus.isSyncing && (
                <div className="flex items-center text-sm text-baobab-600">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Syncing...
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
