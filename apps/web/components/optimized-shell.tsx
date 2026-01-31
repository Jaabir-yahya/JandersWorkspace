/**
 * Optimized Shell Component
 * 
 * Lightweight layout shell optimized for mobile and slow connections.
 * Implements tenant-aware navigation and network-aware features.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTenant, useFeature } from '@/lib/hooks/use-tenant';
import { useNetwork } from '@/lib/hooks/use-network';
import { FeatureFlag } from './feature-flag';

// Icons - using barrel import with optimizePackageImports in next.config.ts
import { Home, Receipt, Users, Camera, Settings, Plus, WifiOff } from 'lucide-react';

interface OptimizedShellProps {
  children: React.ReactNode;
}

export function OptimizedShell({ children }: OptimizedShellProps) {
  const pathname = usePathname();
  const { config } = useTenant();
  const { isOnline, isSlow } = useNetwork();

  // Build navigation based on tenant features
  const navigation = [
    { href: '/', label: 'Home', icon: Home, feature: 'transactions' as const },
    { href: '/transactions', label: 'Transactions', icon: Receipt, feature: 'transactions' as const },
    { href: '/people', label: 'People', icon: Users, feature: 'people' as const },
    { href: '/proof', label: 'Proof', icon: Camera, feature: 'proof' as const },
    { href: '/manager', label: 'Manager', icon: Settings, feature: 'manager' as const },
  ].filter(item => config.features[item.feature]);

  return (
    <div className="min-h-screen bg-background">
      {/* Network status indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 text-sm flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          <span>You're offline. Some features may not work.</span>
        </div>
      )}
      
      {isSlow && isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-1 text-xs text-center">
          Slow connection detected. Loading reduced data.
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <div 
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${config.ui.primaryColor}20` }}
            >
              <Receipt 
                className="h-4 w-4" 
                style={{ color: config.ui.primaryColor }}
              />
            </div>
            <span className="font-semibold tracking-tight truncate max-w-[150px]">
              {config.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  style={isActive ? { color: config.ui.primaryColor } : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background md:hidden">
        <div className="flex items-center justify-around h-16">
          {navigation.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
                style={isActive ? { color: config.ui.primaryColor } : undefined}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Quick Action Button */}
          <FeatureFlag feature="transactions">
            <Link
              href="/transactions/new"
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
              style={{ color: config.ui.primaryColor }}
            >
              <div 
                className="flex items-center justify-center h-10 w-10 rounded-full"
                style={{ backgroundColor: config.ui.primaryColor }}
              >
                <Plus className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs">New</span>
            </Link>
          </FeatureFlag>
        </div>
      </nav>

      {/* Floating Action Button for Desktop */}
      <FeatureFlag feature="transactions">
        {config.ui.enableQuickActions && (
          <Link
            href="/transactions/new"
            className="hidden md:flex fixed bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: config.ui.primaryColor }}
          >
            <Plus className="h-6 w-6 text-white" />
          </Link>
        )}
      </FeatureFlag>
    </div>
  );
}
