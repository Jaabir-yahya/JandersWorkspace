'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ChevronRight, Loader2 } from 'lucide-react';
import { setCurrentTenantId, setCurrentTenantName } from '@/lib/api-client';
import { tenantsApi, type TenantOption } from '@/lib/api/tenants';

export default function TenantSelectPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await tenantsApi.myTenants();
        if (mounted) setTenants(list);
      } catch (e) {
        if (mounted) setError((e as Error).message || 'Failed to load tenants');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSelect = (t: TenantOption) => {
    setCurrentTenantId(t.id);
    setCurrentTenantName(t.name);
    router.push('/dashboard');
    router.refresh();
  };

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
  useEffect(() => {
    if (!loading && !hasToken) {
      router.replace('/login');
    }
  }, [loading, hasToken, router]);

  if (!hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grid-pattern">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-acacia-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid-pattern px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-baobab-200 bg-white p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-baobab-800 mb-1">Choose workspace</h1>
        <p className="text-sm text-baobab-600 mb-6">
          Select a tenant to continue. You can switch later from the header.
        </p>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-acacia-600" />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">{error}</p>
        )}

        {!loading && !error && tenants.length === 0 && (
          <p className="text-sm text-baobab-600 py-6 text-center">
            No workspaces available. Ask an admin to add you to a tenant or create one.
          </p>
        )}

        {!loading && tenants.length > 0 && (
          <ul className="space-y-2">
            {tenants.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(t)}
                  className="w-full flex items-center gap-3 rounded-lg border border-baobab-200 bg-white px-4 py-3 text-left hover:bg-savanna-50 hover:border-acacia-300 transition-colors"
                >
                  <Building2 className="h-5 w-5 text-baobab-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-baobab-900 truncate">{t.name}</p>
                    <p className="text-xs text-baobab-500">{t.slug} · {t.tier}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-baobab-400 flex-shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-xs text-baobab-500 text-center">
          Use the dev tenant for experimenting with new features.
        </p>
      </div>
    </div>
  );
}
