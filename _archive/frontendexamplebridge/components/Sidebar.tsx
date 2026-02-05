'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  TrendingUp,
  Settings,
  BookOpen,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Supplies', href: '/supplies', icon: Package },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Reports', href: '/reports', icon: TrendingUp },
  { name: 'Ledger', href: '/ledger', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gradient-to-b from-baobab-800 to-baobab-900 text-white h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-baobab-700">
        <h1 className="text-2xl font-display font-bold tracking-tight">
          <span className="text-gradient bg-gradient-to-r from-acacia-400 to-savanna-300 bg-clip-text text-transparent">
            LedgerFlow
          </span>
        </h1>
        <p className="text-xs text-baobab-300 mt-1">Business Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-acacia-600 text-white shadow-lg scale-105' 
                  : 'text-baobab-200 hover:bg-baobab-700 hover:text-white hover:scale-102'
                }
              `}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-baobab-300'}`} />
              {item.name}
              {item.badge && (
                <span className="ml-auto bg-clay-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-t border-baobab-700">
        <div className="bg-baobab-700 rounded-lg p-4">
          <p className="text-xs font-medium text-baobab-300 mb-2">Quick Actions</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center text-baobab-200">
              <kbd className="kbd mr-2">Ctrl+N</kbd>
              <span>New Purchase</span>
            </div>
            <div className="flex items-center text-baobab-200">
              <kbd className="kbd mr-2">Ctrl+I</kbd>
              <span>New Invoice</span>
            </div>
            <div className="flex items-center text-baobab-200">
              <kbd className="kbd mr-2">Ctrl+P</kbd>
              <span>Record Payment</span>
            </div>
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
  );
}
