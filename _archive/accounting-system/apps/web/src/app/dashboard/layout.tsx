'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  DollarSign,
  Users,
  Building2,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    shortcut: 'Ctrl+D',
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    shortcut: 'Ctrl+I',
  },
  {
    name: 'Invoices',
    href: '/invoices',
    icon: FileText,
    shortcut: 'Ctrl+V',
  },
  {
    name: 'Payments',
    href: '/payments',
    icon: DollarSign,
    shortcut: 'Ctrl+P',
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    name: 'Suppliers',
    href: '/suppliers',
    icon: Building2,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    shortcut: 'Ctrl+R',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200',
          'transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-semibold text-neutral-900">
                African<span className="text-primary-600">Biz</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.shortcut && (
                    <kbd className="hidden xl:inline-block text-xs opacity-60 font-mono bg-black/5 px-1.5 py-0.5 rounded">
                      {item.shortcut}
                    </kbd>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  John Doe
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  Owner - Demo Business
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/settings"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button className="p-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-neutral-200 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-xl mx-auto lg:mx-0">
            {/* Search bar - placeholder */}
            <div className="relative hidden md:block">
              <input
                type="search"
                placeholder="Quick search... (Ctrl+K)"
                className="w-full px-4 py-2 text-sm bg-neutral-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications - placeholder */}
            <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg">
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
