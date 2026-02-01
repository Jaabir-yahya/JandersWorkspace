"use client";

import { useTenant } from "@/context/TenantContext";

// Tenant-aware header component
function TenantHeader() {
  const { tenant, isLoading, error } = useTenant();

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="animate-pulse h-6 w-32 bg-gray-200 rounded"></div>
        </div>
      </header>
    );
  }

  if (error || !tenant) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Project Bridge</h1>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{tenant.name}</h1>
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {tenant.tier} Tier
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{tenant.country}</span>
            {tenant.tier === "ENTERPRISE" && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Full Access
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Wrapper to use context inside provider
export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="theme-wrapper" className="min-h-screen bg-gray-50">
      <TenantHeader />
      <main>{children}</main>
    </div>
  );
}
