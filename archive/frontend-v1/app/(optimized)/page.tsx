/**
 * Optimized Dashboard Page
 * 
 * Server component that fetches data in parallel for optimal performance.
 * Displays key metrics: revenue, outstanding credit, recent transactions.
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
// import { api } from '@/lib/api'; // TODO: Create server-side API client
import { formatCurrency } from '@/lib/helpers';
import { TrendingUp, Users, Wallet, Plus } from 'lucide-react';

// Loading skeleton for stats cards
function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

// Revenue card component - fetches its own data
async function RevenueCard() {
  // In production, fetch from API
  // const stats = await api.get('/dashboard/stats');
  const revenue = 1250000; // Placeholder

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
        <TrendingUp className="h-4 w-4 text-emerald-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(revenue)}</div>
        <p className="text-xs text-muted-foreground">
          +12% from yesterday
        </p>
      </CardContent>
    </Card>
  );
}

// Outstanding credit card
async function CreditCard() {
  const credit = 450000; // Placeholder

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Outstanding (Udhaari)</CardTitle>
        <Wallet className="h-4 w-4 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(credit)}</div>
        <p className="text-xs text-muted-foreground">
          12 customers owe
        </p>
      </CardContent>
    </Card>
  );
}

// People count card
async function PeopleCard() {
  const count = 48; // Placeholder

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">People</CardTitle>
        <Users className="h-4 w-4 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">
          32 customers, 16 suppliers
        </p>
      </CardContent>
    </Card>
  );
}

// Quick actions section
function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link href="/transactions/new">
        <Button className="w-full h-auto py-4 flex flex-col items-center gap-2" variant="outline">
          <Plus className="h-5 w-5" />
          <span className="text-sm">New Sale</span>
        </Button>
      </Link>
      <Link href="/transactions/new?type=expense">
        <Button className="w-full h-auto py-4 flex flex-col items-center gap-2" variant="outline">
          <Wallet className="h-5 w-5" />
          <span className="text-sm">Add Expense</span>
        </Button>
      </Link>
    </div>
  );
}

// Main dashboard page
export default function DashboardPage() {
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your business
        </p>
      </div>

      {/* Stats Grid - Parallel data fetching with Suspense */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Suspense fallback={<StatsCardSkeleton />}>
          <RevenueCard />
        </Suspense>
        <Suspense fallback={<StatsCardSkeleton />}>
          <CreditCard />
        </Suspense>
        <Suspense fallback={<StatsCardSkeleton />}>
          <PeopleCard />
        </Suspense>
      </div>

      {/* Quick Actions - Mobile optimized */}
      <div className="md:hidden">
        <h2 className="text-sm font-medium mb-3">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <h2 className="text-sm font-medium mb-3">Recent Activity</h2>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p className="text-sm">Recent transactions will appear here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
