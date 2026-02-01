import { useEffect } from "react";
import { useTenantStore } from "./store/tenantStore";
import { TenantSelector } from "./components/tenant/TenantSelector";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { Dashboard } from "./pages/Dashboard";
import { useUIStore, useDashboardStatsStore } from "./store";

function App() {
  const { currentView, sidebarCollapsed, darkMode } = useUIStore();
  const { refreshStats } = useDashboardStatsStore();
  const { currentTenant, resolveTenant, isLoading, error } = useTenantStore();

  useEffect(() => {
    const resolveTenantFromUrl = async () => {
      const path = window.location.pathname;
      const pathParts = path.split("/").filter(Boolean);

      if (pathParts.length > 0) {
        const potentialSlug = pathParts[0];
        if (potentialSlug && !potentialSlug.startsWith("api")) {
          await resolveTenant(potentialSlug);
        }
      }
    };

    if (!currentTenant) {
      resolveTenantFromUrl();
    }
  }, [currentTenant, resolveTenant]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats, currentTenant]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const renderContent = () => {
    if (!currentTenant && isLoading) {
      return (
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tenant...</p>
          </div>
        </div>
      );
    }

    if (!currentTenant && error) {
      return (
        <div className="p-6">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-destructive mb-2">
              Tenant Error
            </h2>
            <p className="text-destructive/80">{error}</p>
            <div className="mt-4">
              <TenantSelector />
            </div>
          </div>
        </div>
      );
    }

    if (!currentTenant) {
      return (
        <div className="p-6">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Select a Workspace</h2>
            <p className="text-muted-foreground mb-6">
              Choose a tenant to continue or enter a tenant slug in the URL
              (e.g., /your-tenant-name)
            </p>
            <TenantSelector />
          </div>
        </div>
      );
    }

    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">
              Transactions
            </h1>
            <p className="text-muted-foreground">
              Full transactions table view coming soon...
            </p>
          </div>
        );
      case "people":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">People</h1>
            <p className="text-muted-foreground">
              People management view coming soon...
            </p>
          </div>
        );
      case "items":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">Items</h1>
            <p className="text-muted-foreground">
              Inventory management view coming soon...
            </p>
          </div>
        );
      case "analytics":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Advanced analytics dashboard coming soon...
            </p>
          </div>
        );
      case "integrations":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">
              Integrations
            </h1>
            <p className="text-muted-foreground">
              Integration management view coming soon...
            </p>
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-foreground mb-6">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Settings page coming soon...
            </p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${darkMode ? "dark" : ""}`}>
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <Header />
        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;
