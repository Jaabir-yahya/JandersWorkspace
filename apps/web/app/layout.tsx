'use client';

import { Toaster } from 'sonner';
import { useGlobalKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { AppLayoutGuard } from '@/components/AppLayoutGuard';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useGlobalKeyboardShortcuts();

  return (
    <html lang="en">
      <body className="grid-pattern">
        <AppLayoutGuard>{children}</AppLayoutGuard>

        {/* Toast Notifications */}
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
      </body>
    </html>
  );
}
