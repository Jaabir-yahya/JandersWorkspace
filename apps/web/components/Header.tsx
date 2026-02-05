'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, WifiOff, Wifi, Check, X, AlertTriangle, Info, CheckCircle, XCircle, Menu, Building2, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getCurrentTenantId, getCurrentTenantName, setCurrentTenantId, setCurrentTenantName } from '@/lib/api-client';
import { tenantsApi, type TenantOption } from '@/lib/api/tenants';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function Header() {
  const router = useRouter();
  const { syncStatus, setOnlineStatus } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showTenantSwitcher, setShowTenantSwitcher] = useState(false);
  const [tenantList, setTenantList] = useState<TenantOption[]>([]);
  const [tenantName, setTenantNameState] = useState<string | null>(() => getCurrentTenantName());

  useEffect(() => {
    setTenantNameState(getCurrentTenantName());
  }, []);

  useEffect(() => {
    if (showTenantSwitcher && tenantList.length === 0) {
      tenantsApi.myTenants().then(setTenantList).catch(() => toast.error('Failed to load workspaces'));
    }
  }, [showTenantSwitcher]);

  const handleSwitchTenant = (t: TenantOption) => {
    setCurrentTenantId(t.id);
    setCurrentTenantName(t.name);
    setTenantNameState(t.name);
    setShowTenantSwitcher(false);
    router.refresh();
  };

  const toggleMobileMenu = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
  };

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

  // Listen for custom events to add notifications
  useEffect(() => {
    const handleAddNotification = (event: CustomEvent<Notification>) => {
      setNotifications((prev) => [event.detail, ...prev].slice(0, 10));
    };

    window.addEventListener('add-notification', handleAddNotification as EventListener);
    return () => {
      window.removeEventListener('add-notification', handleAddNotification as EventListener);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-acacia-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-clay-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-clay-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-savanna-600" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-acacia-50 border-acacia-200';
      case 'error':
        return 'bg-clay-50 border-clay-200';
      case 'warning':
        return 'bg-clay-50 border-clay-200';
      case 'info':
        return 'bg-savanna-50 border-savanna-200';
    }
  };

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
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-baobab-600 hover:bg-baobab-100 rounded-lg transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-lg hidden md:block">
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
            <div className="flex items-center space-x-2 md:space-x-4 ml-2 md:ml-6">
              {/* Tenant switcher */}
              {getCurrentTenantId() && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTenantSwitcher(!showTenantSwitcher)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-baobab-200 bg-white text-sm text-baobab-800 hover:bg-savanna-50 transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-baobab-500" />
                    <span className="max-w-[120px] truncate hidden sm:inline">
                      {tenantName || 'Workspace'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-baobab-400" />
                  </button>
                  {showTenantSwitcher && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowTenantSwitcher(false)} aria-hidden />
                      <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-baobab-200 z-50 py-1">
                        <p className="px-3 py-2 text-xs font-medium text-baobab-500 uppercase">Switch workspace</p>
                        {tenantList.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleSwitchTenant(t)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-baobab-800 hover:bg-savanna-50"
                          >
                            <Building2 className="h-4 w-4 text-baobab-400 flex-shrink-0" />
                            <span className="truncate">{t.name}</span>
                          </button>
                        ))}
                        {tenantList.length === 0 && (
                          <p className="px-3 py-2 text-sm text-baobab-500">No other workspaces</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

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
              <div className="relative">
                <button
                  className="relative p-2 text-baobab-600 hover:bg-baobab-100 rounded-lg transition-colors"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-clay-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-baobab-200 z-50">
                    <div className="p-4 border-b border-baobab-200 flex items-center justify-between">
                      <h3 className="font-semibold text-baobab-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-acacia-600 hover:text-acacia-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 md:max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-baobab-500">
                          <Bell className="h-12 w-12 mx-auto mb-3 text-baobab-300" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-baobab-100 hover:bg-savanna-50 transition-colors ${
                              !notification.read ? 'bg-savanna-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-medium text-baobab-900 text-sm">
                                    {notification.title}
                                  </p>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {!notification.read && (
                                      <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-acacia-600 hover:text-acacia-700"
                                        title="Mark as read"
                                      >
                                        <Check className="h-4 w-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteNotification(notification.id)}
                                      className="text-baobab-400 hover:text-clay-600"
                                      title="Delete"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-sm text-baobab-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-baobab-400 mt-2">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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
