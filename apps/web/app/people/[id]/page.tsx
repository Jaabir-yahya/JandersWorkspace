"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, TrendingUp, List } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Currency } from "@/lib/types";
import { entitiesApi } from "@/lib/api/entities";
import type { EntityBalance, EntityHistoryResponse } from "@/lib/api/entities";
import toast from "react-hot-toast";

export default function EntityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [balance, setBalance] = useState<EntityBalance | null>(null);
  const [history, setHistory] = useState<EntityHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      entitiesApi.getBalance(id).catch(() => null),
      entitiesApi.getHistory(id).catch(() => null),
      entitiesApi.get(id).catch(() => null),
    ])
      .then(([b, h, e]) => {
        setBalance(b ?? null);
        setHistory(h ?? null);
        if (b) return;
        if (h) return;
        if (e)
          setBalance({
            entity: e,
            balance: {
              total_credit: 0,
              total_debit: 0,
              net_balance: 0,
              transaction_count: 0,
            },
          });
      })
      .catch(() => {
        toast.error("Failed to load entity");
        setBalance(null);
        setHistory(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const entity = balance?.entity ?? history?.entity;
  const displayName = entity
    ? (entity.displayName ?? entity.name ?? entity.id)
    : "—";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/people">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            People
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-display font-bold text-baobab-900 flex items-center gap-2">
          <User className="h-8 w-8 text-baobab-600" />
          {displayName}
        </h1>
        <p className="text-baobab-600 mt-1">
          State (balance) and log (transaction history)
        </p>
      </div>

      {loading ? (
        <p className="text-baobab-500">Loading…</p>
      ) : (
        <>
          {/* State: Balance */}
          <Card>
            <CardHeader>
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-acacia-600" />
                State (amount total)
              </h2>
            </CardHeader>
            <CardBody>
              {balance?.balance ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-baobab-600">Net balance</p>
                    <p className="text-2xl font-bold font-mono tabular-nums text-baobab-900">
                      {formatCurrency(balance.balance.net_balance ?? 0, "KES")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-baobab-600">Total credit</p>
                    <p className="text-xl font-mono tabular-nums text-acacia-700">
                      {formatCurrency(balance.balance.total_credit ?? 0, "KES")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-baobab-600">Total debit</p>
                    <p className="text-xl font-mono tabular-nums text-clay-700">
                      {formatCurrency(balance.balance.total_debit ?? 0, "KES")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-baobab-600">Transactions</p>
                    <p className="text-xl font-mono tabular-nums text-baobab-800">
                      {balance.balance.transaction_count ?? 0}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-baobab-500">
                  No balance data yet. Lighter use: record supplies or create
                  invoices linked to this entity to see state here.
                </p>
              )}
            </CardBody>
          </Card>

          {/* Log: History */}
          <Card>
            <CardHeader>
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <List className="h-5 w-5 text-baobab-600" />
                Log (transaction history)
              </h2>
              {history?.total_balance != null && (
                <p className="text-sm text-baobab-600">
                  Running total: {formatCurrency(history.total_balance, "KES")}
                </p>
              )}
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="bg-savanna-50 border-b border-baobab-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-baobab-600 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-baobab-600 uppercase">
                        Type / Ref
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-baobab-600 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-baobab-600 uppercase">
                        Running balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-baobab-200">
                    {!history?.transactions?.length ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-baobab-500"
                        >
                          No transactions yet. Lighter use: link this entity to
                          supplies or invoices to see log here.
                        </td>
                      </tr>
                    ) : (
                      history.transactions.map((t) => (
                        <tr
                          key={t.transaction_id}
                          className="hover:bg-savanna-50/50"
                        >
                          <td className="px-4 py-3 font-medium text-baobab-900 whitespace-nowrap">
                            {formatDate(t.transaction_date)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs bg-baobab-100 px-2 py-1 rounded">
                              {t.reference || t.transaction_id?.slice(0, 8)}
                            </span>
                            <span className="ml-2 text-baobab-600">
                              {t.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums">
                            {formatCurrency(
                              t.total_amount ?? 0,
                              (t.currency_code ?? "KES") as Currency,
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums font-medium">
                            {formatCurrency(
                              t.running_balance ?? 0,
                              (t.currency_code ?? "KES") as Currency,
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
