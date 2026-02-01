import { useState } from "react";
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Wifi,
  WifiOff,
  RefreshCw,
  CreditCard,
  MessageCircle,
  FileText,
  Store,
} from "lucide-react";
import {
  useUIStore,
  useNotificationsStore,
  useUserStore,
  useDashboardStatsStore,
} from "../../store";
import { TenantSelector } from "../tenant/TenantSelector";
import { FeatureGate } from "../tenant/FeatureGate";
import type { AdminView } from "../../types";

const FEATURE_TOOLTIPS: Record<string, string> = {
  mpesa_integration: "M-Pesa Integration Active",
  whatsapp_integration: "WhatsApp Integration Active",
  quickbooks_sync: "QuickBooks Sync Active",
  xero_sync: "Xero Sync Active",
  shopify_sync: "Shopify Sync Active",
  advanced_reporting: "Advanced Reporting Enabled",
};

export function Header() {
  const {
    darkMode,
    toggleDarkMode,
    searchQuery,
    setSearchQuery,
    isOnline,
    pendingSyncs,
  } = useUIStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationsStore();
  const { currentUser, clearUser } = useUserStore();
  const { refreshStats } = useDashboardStatsStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <TenantSelector />
        <div className="h-6 w-px bg-border" />
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions, people, items..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1 mr-2">
          <FeatureGate feature="mpesa_integration">
            <div
              className="p-1.5 rounded bg-green-500/10 text-green-600 dark:text-green-400"
              title={FEATURE_TOOLTIPS.mpesa_integration}
            >
              <CreditCard className="w-4 h-4" />
            </div>
          </FeatureGate>
          <FeatureGate feature="whatsapp_integration">
            <div
              className="p-1.5 rounded bg-green-600/10 text-green-700 dark:text-green-500"
              title={FEATURE_TOOLTIPS.whatsapp_integration}
            >
              <MessageCircle className="w-4 h-4" />
            </div>
          </FeatureGate>
          <FeatureGate feature="quickbooks_sync">
            <div
              className="p-1.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400"
              title={FEATURE_TOOLTIPS.quickbooks_sync}
            >
              <FileText className="w-4 h-4" />
            </div>
          </FeatureGate>
          <FeatureGate feature="shopify_sync">
            <div
              className="p-1.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              title={FEATURE_TOOLTIPS.shopify_sync}
            >
              <Store className="w-4 h-4" />
            </div>
          </FeatureGate>
        </div>

        <div className="flex items-center gap-2 mr-4">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          {pendingSyncs > 0 && (
            <span className="text-xs text-muted-foreground">
              {pendingSyncs} pending
            </span>
          )}
        </div>

        <button
          onClick={() => refreshStats()}
          className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <span className="font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`w-full text-left p-3 hover:bg-accent transition-colors border-b border-border last:border-0 ${
                        !notification.isRead ? "bg-accent/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notification.type === "error"
                              ? "bg-red-500"
                              : notification.type === "warning"
                                ? "bg-yellow-500"
                                : notification.type === "success"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(
                              notification.createdAt,
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
          >
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium hidden sm:block">
              {currentUser?.name || "Admin"}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              <div className="p-3 border-b border-border">
                <p className="font-medium">{currentUser?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground">
                  {currentUser?.email || "admin@bridge.app"}
                </p>
              </div>
              <button
                onClick={() => navigateTo("settings")}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors text-sm"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={clearUser}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors text-sm text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {(showNotifications || showProfile) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </header>
  );
}

const navigateTo = (view: AdminView) => {
  const { setCurrentView } = useUIStore.getState();
  setCurrentView(view);
};
