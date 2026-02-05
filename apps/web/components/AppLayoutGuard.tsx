'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { getCurrentTenantId } from '@/lib/api-client';

const PUBLIC_PATHS = ['/login', '/tenant-select'];

export function AppLayoutGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isPublic) {
      setChecked(true);
      return;
    }
    const token = localStorage.getItem('auth_token');
    const tenantId = getCurrentTenantId();
    if (!token) {
      router.replace('/login');
      return;
    }
    if (!tenantId) {
      router.replace('/tenant-select');
      return;
    }
    setChecked(true);
  }, [isPublic, pathname, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (!checked) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-savanna-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-acacia-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-savanna-50/60 min-h-full">
          <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
