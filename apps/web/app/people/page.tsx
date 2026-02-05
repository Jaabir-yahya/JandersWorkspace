'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, RefreshCw } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { entitiesApi } from '@/lib/api/entities';
import type { Entity, EntityBalance } from '@/lib/api/entities';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PeoplePage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<Record<string, EntityBalance['balance']>>({});
  const [loadingBalances, setLoadingBalances] = useState(false);

  const loadEntities = useCallback(() => {
    setLoading(true);
    entitiesApi
      .list({ search: search || undefined })
      .then(setEntities)
      .catch(() => {
        toast.error('Failed to load people');
        setEntities([]);
      })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  // Lighter use case: load balances only for first page (max 20) so list works without hammering API
  useEffect(() => {
    if (entities.length === 0) return;
    const toLoad = entities.slice(0, 20).map((e) => e.id);
    setLoadingBalances(true);
    Promise.all(
      toLoad.map((id) =>
        entitiesApi.getBalance(id).then((r) => ({ id, balance: r.balance })).catch(() => ({ id, balance: null }))
      )
    )
      .then((results) => {
        const map: Record<string, EntityBalance['balance']> = {};
        results.forEach(({ id, balance }) => {
          if (balance) map[id] = balance;
        });
        setBalances(map);
      })
      .finally(() => setLoadingBalances(false));
  }, [entities]);

  const displayName = (e: Entity) => (e.displayName ?? e.name ?? e.id) as string;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-baobab-900">People</h1>
          <p className="text-baobab-600 mt-1">Entities (customers, suppliers). State (balance) and log per person — full or light use.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadEntities} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-display font-semibold text-lg">Entities</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baobab-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-savanna-50 border border-baobab-200 rounded-lg text-sm focus:bg-white focus:border-acacia-500 focus:ring-2 focus:ring-acacia-200"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="bg-savanna-50 border-b border-baobab-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-baobab-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-baobab-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-baobab-600 uppercase">Contact</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-baobab-600 uppercase">Net balance (state)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-baobab-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-baobab-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-baobab-500">Loading…</td>
                  </tr>
                ) : entities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-baobab-500">
                      No entities yet. Lighter use: add people when you record supplies or create invoices. Or sign in and select a tenant.
                    </td>
                  </tr>
                ) : (
                  entities.map((e) => {
                    const bal = balances[e.id];
                    return (
                      <tr key={e.id} className="hover:bg-savanna-50/50">
                        <td className="px-4 py-3 font-medium text-baobab-900">{displayName(e)}</td>
                        <td className="px-4 py-3 text-baobab-600">{String(e.entityType ?? '—')}</td>
                        <td className="px-4 py-3 text-baobab-600">{String(e.phone ?? e.email ?? '—')}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-baobab-800">
                          {loadingBalances && bal === undefined ? '…' : bal != null ? formatCurrency(bal.net_balance ?? 0, 'KES') : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/people/${e.id}`}>
                            <Button variant="ghost" size="sm">
                              State & log
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
