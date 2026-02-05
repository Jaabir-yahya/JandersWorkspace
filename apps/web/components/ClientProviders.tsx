'use client';

import { Toaster } from 'sonner';
import { useGlobalKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { AppLayoutGuard } from '@/components/AppLayoutGuard';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useGlobalKeyboardShortcuts();

  return (
    <>
      <AppLayoutGuard>{children}</AppLayoutGuard>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#4a3a2e',
            border: '1px solid #d9cec1',
            borderRadius: '0.75rem',
            padding: '1rem',
            fontSize: '0.875rem',
          },
        }}
      />
    </>
  );
}
