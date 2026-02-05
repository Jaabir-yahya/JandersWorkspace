'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Box,
  FileText,
  TrendingUp,
  Settings,
  BookOpen,
  X,
  Plus,
  CreditCard,
  Users,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

/** Nav grouped by use case: Truth (ledger/bookkeeping), Capture (transactions), Manage (data) */
const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Truth & bookkeeping',
    items: [
      { name: 'Ledger', href: '/ledger', icon: BookOpen },
      { name: 'Reports', href: '/reports', icon: TrendingUp },
    ],
  },
  {
    label: 'Capture',
    items: [
      { name: 'Supplies', href: '/supplies', icon: Package },
      { name: 'Invoices', href: '/invoices', icon: FileText },
    ],
  },
  {
    label: 'Manage',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'People', href: '/people', icon: Users },
      { name: 'Inventory', href: '/inventory', icon: Package },
      { name: 'Containers', href: '/inventory/containers', icon: Box },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggleMenu = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-mobile-menu', handleToggleMenu);
    return () => window.removeEventListener('toggle-mobile-menu', handleToggleMenu);
  }, []);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`flex flex-col w-64 bg-gradient-to-b from-baobab-800 to-baobab-900 text-white h-screen fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:flex`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-baobab-700 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold tracking-tight">
            <span className="text-gradient bg-gradient-to-r from-acacia-400 to-savanna-300 bg-clip-text text-transparent">
              LedgerFlow
            </span>
          </h1>
          <button
            className="md:hidden p-2 text-baobab-300 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation – grouped by use case */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-baobab-400">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive
                          ? 'bg-savanna-600 text-white shadow-md'
                          : 'text-baobab-200 hover:bg-baobab-700 hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`mr-3 h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-baobab-300'}`} />
                      {item.name}
                      {item.badge && (
                        <span className="ml-auto bg-clay-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Quick Actions - clickable + shortcuts */}
        <div className="px-4 py-4 border-t border-baobab-700">
          <div className="bg-baobab-700 rounded-lg p-4">
            <p className="text-xs font-medium text-baobab-300 mb-2">Quick Actions</p>
            <div className="space-y-1.5 text-xs">
              <Link
                href="/supplies"
                className="flex items-center text-baobab-200 hover:text-white hover:bg-baobab-600 rounded px-2 py-1.5 -mx-2 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 mr-2 text-acacia-400" />
                <span>New Purchase</span>
                <kbd className="kbd ml-auto text-baobab-400">Ctrl+N</kbd>
              </Link>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-add-inventory'))}
                className="w-full flex items-center text-baobab-200 hover:text-white hover:bg-baobab-600 rounded px-2 py-1.5 -mx-2 transition-colors text-left"
              >
                <Package className="h-3.5 w-3.5 mr-2 text-acacia-400" />
                <span>Add Inventory Item</span>
                <kbd className="kbd ml-auto text-baobab-400">Ctrl+I</kbd>
              </button>
              <Link
                href="/settings"
                className="flex items-center text-baobab-200 hover:text-white hover:bg-baobab-600 rounded px-2 py-1.5 -mx-2 transition-colors"
              >
                <Settings className="h-3.5 w-3.5 mr-2 text-acacia-400" />
                <span>Settings</span>
                <kbd className="kbd ml-auto text-baobab-400">Ctrl+S</kbd>
              </Link>
              <Link
                href="/supplies"
                className="flex items-center text-baobab-200 hover:text-white hover:bg-baobab-600 rounded px-2 py-1.5 -mx-2 transition-colors"
              >
                <CreditCard className="h-3.5 w-3.5 mr-2 text-acacia-400" />
                <span>Record Payment</span>
                <kbd className="kbd ml-auto text-baobab-400">Ctrl+P</kbd>
              </Link>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-t border-baobab-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-acacia-400 to-savanna-400 flex items-center justify-center text-white font-bold">
              AD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-baobab-400">admin@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
