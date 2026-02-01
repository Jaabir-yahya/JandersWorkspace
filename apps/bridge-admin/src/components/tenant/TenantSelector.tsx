import { useState } from "react";
import { ChevronDown, Building2, Check } from "lucide-react";
import { useTenantStore } from "../../store/tenantStore";
import type { Tenant } from "../../types";

const FEATURE_ICONS: Record<string, string> = {
  mpesa_integration: "M",
  whatsapp_integration: "W",
  quickbooks_sync: "Q",
  xero_sync: "X",
  shopify_sync: "S",
};

const FEATURE_COLORS: Record<string, string> = {
  mpesa_integration: "bg-green-500/20 text-green-600 dark:text-green-400",
  whatsapp_integration: "bg-green-600/20 text-green-700 dark:text-green-500",
  quickbooks_sync: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  xero_sync: "bg-blue-600/20 text-blue-700 dark:text-blue-500",
  shopify_sync: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
};

const TIER_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  basic: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  pro: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  enterprise:
    "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
};

export function TenantSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const currentTenant = useTenantStore((state) => state.currentTenant);
  const tenantList = useTenantStore((state) => state.tenantList);
  const switchTenant = useTenantStore((state) => state.switchTenant);
  const isLoading = useTenantStore((state) => state.isLoading);

  const handleSwitch = async (slug: string) => {
    if (slug !== currentTenant?.slug) {
      await switchTenant(slug);
    }
    setIsOpen(false);
  };

  const getActiveFeatures = (tenant: Tenant) => {
    return Object.entries(tenant.features)
      .filter(([key, value]) => value && FEATURE_ICONS[key])
      .map(([key]) => key);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left min-w-[200px] max-w-[300px]"
      >
        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {currentTenant?.name || "Select Tenant"}
          </p>
          {currentTenant && (
            <div className="flex items-center gap-1">
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  TIER_COLORS[currentTenant.tier] || TIER_COLORS.basic
                }`}
              >
                {currentTenant.tier}
              </span>
            </div>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-border">
            <p className="font-medium text-sm">Select Workspace</p>
            <p className="text-xs text-muted-foreground">
              {tenantList.length} tenant{tenantList.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {tenantList.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No tenants available
              </div>
            ) : (
              tenantList.map((tenant) => {
                const isActive = tenant.slug === currentTenant?.slug;
                const activeFeatures = getActiveFeatures(tenant);

                return (
                  <button
                    key={tenant.slug}
                    onClick={() => handleSwitch(tenant.slug)}
                    className={`w-full text-left p-3 hover:bg-accent transition-colors border-b border-border last:border-0 ${
                      isActive ? "bg-accent/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {tenant.name}
                          </p>
                          {isActive && (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tenant.slug}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${
                              TIER_COLORS[tenant.tier] || TIER_COLORS.basic
                            }`}
                          >
                            {tenant.tier}
                          </span>
                          <div className="flex items-center gap-1">
                            {activeFeatures.slice(0, 3).map((feature) => (
                              <span
                                key={feature}
                                className={`w-5 h-5 rounded flex items-center justify-center text-xs font-medium ${
                                  FEATURE_COLORS[feature]
                                }`}
                                title={feature.replace("_", " ")}
                              >
                                {FEATURE_ICONS[feature]}
                              </span>
                            ))}
                            {activeFeatures.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{activeFeatures.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
