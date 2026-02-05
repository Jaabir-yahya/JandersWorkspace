"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  Calendar,
  Filter,
  Search,
  Plus,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, downloadAsCSV } from "@/lib/utils";
import type { Currency } from "@/lib/types";
import { reportingApi } from "@/lib/api/reporting";
import type {
  TransactionHistoryResponse,
  TrialBalanceResponse,
} from "@/lib/api/reporting";
import { entitiesApi } from "@/lib/api/entities";
import { containersApi } from "@/lib/api/containers";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [entityId, setEntityId] = useState("");
  const [containerId, setContainerId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<TransactionHistoryResponse | null>(
    null,
  );
  const [trialBalance, setTrialBalance] = useState<TrialBalanceResponse | null>(
    null,
  );
  const [entities, setEntities] = useState<{ id: string; name: string }[]>([]);
  const [containers, setContainers] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      entitiesApi.list().then((list) =>
        list.map((e) => ({
          id: e.id,
          name: (e.displayName ?? e.name ?? e.id) as string,
        })),
      ),
      containersApi
        .list()
        .then((list) => list.map((c) => ({ id: c.id, name: c.name }))),
    ])
      .then(([e, c]) => {
        setEntities(e);
        setContainers(c);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      reportingApi.transactionHistory({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        entityId: entityId || undefined,
        containerId: containerId || undefined,
      }),
      reportingApi.trialBalance(),
    ])
      .then(([h, t]) => {
        setHistory(h);
        setTrialBalance(t);
      })
      .catch(() => {
        toast.error("Failed to load reports");
        setHistory(null);
        setTrialBalance(null);
      })
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo, entityId, containerId]);

  const pairs = history?.transactions ?? [];
  const filteredPairs = searchQuery.trim()
    ? pairs.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          String(p.transactionPairId ?? "")
            .toLowerCase()
            .includes(q) ||
          p.transactions?.some((t) =>
            String(t.entryType ?? "")
              .toLowerCase()
              .includes(q),
          )
        );
      })
    : pairs;

  const handleExport = (format: "csv" | "pdf") => {
    if (format === "csv") {
      const rows = filteredPairs.flatMap((p) =>
        (p.transactions ?? []).map((t) => ({
          date: p.date,
          pairId: p.transactionPairId,
          amount: t.amount,
          entryType: t.entryType,
          party: t.party,
        })),
      );
      downloadAsCSV(rows, "transaction-ledger");
    } else {
      toast("PDF export coming soon");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-baobab-900">
            Reports
          </h1>
          <p className="text-baobab-600 mt-1">
            State (trial balance) and logs (transaction history) from your
            ledger
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/supplies">
            <Button variant="primary">
              <Plus className="h-5 w-5 mr-2" />
              Record purchase
            </Button>
          </Link>
          <Link href="/invoices">
            <Button variant="secondary">
              <Plus className="h-5 w-5 mr-2" />
              Create invoice
            </Button>
          </Link>
          <Button variant="secondary" onClick={() => handleExport("csv")}>
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => handleExport("pdf")}>
            <FileText className="h-5 w-5 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* State: Trial Balance */}
      <Card>
        <CardHeader>
          <h2 className="font-display font-semibold text-lg">
            Trial Balance (State)
          </h2>
          <p className="text-sm text-baobab-600">Account-level balances</p>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className="text-baobab-500">Loading…</p>
          ) : trialBalance ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-sm">
                <thead>
                  <tr className="bg-savanna-50 border-b border-baobab-200">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-baobab-600 uppercase">
                      Account
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-baobab-600 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-baobab-600 uppercase">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-baobab-200">
                  {(trialBalance.accounts ?? []).map((acc) => (
                    <tr key={acc.id}>
                      <td className="px-4 py-2 font-medium text-baobab-900">
                        {acc.name}
                      </td>
                      <td className="px-4 py-2 text-baobab-600">{acc.type}</td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums">
                        {formatCurrency(
                          acc.balance ?? 0,
                          (acc.currency ?? "KES") as Currency,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end gap-6 text-sm">
                <span>
                  Total Debits:{" "}
                  {formatCurrency(
                    trialBalance.summary?.totalDebits ?? 0,
                    "KES",
                  )}
                </span>
                <span>
                  Total Credits:{" "}
                  {formatCurrency(
                    trialBalance.summary?.totalCredits ?? 0,
                    "KES",
                  )}
                </span>
                {trialBalance.summary?.isBalanced && (
                  <Badge variant="success">Balanced</Badge>
                )}
              </div>
            </div>
          ) : (
            <p className="text-baobab-500">
              No trial balance data. Sign in and ensure ledger is set up.
            </p>
          )}
        </CardBody>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-baobab-600" />
            <h2 className="font-display font-semibold text-lg">
              Transaction log filters
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <Select
              label="Entity"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              options={[
                { value: "", label: "All entities" },
                ...entities.map((e) => ({ value: e.id, label: e.name })),
              ]}
            />
            <Select
              label="Container"
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
              options={[
                { value: "", label: "All containers" },
                ...containers.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>
        </CardBody>
      </Card>

      {/* Log: Transaction history */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-display font-semibold text-lg">
              Transaction Ledger (Log)
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-baobab-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-savanna-50 border border-baobab-200 rounded-lg text-sm focus:bg-white focus:border-acacia-500 focus:ring-2 focus:ring-acacia-200"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-savanna-50 border-b border-baobab-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-baobab-600 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-baobab-600 uppercase">
                    Pair / Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-baobab-600 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-baobab-600 uppercase">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-baobab-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-baobab-500"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : filteredPairs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-baobab-500"
                    >
                      No transactions match. Adjust filters or record activity.
                    </td>
                  </tr>
                ) : (
                  filteredPairs.map((p) => (
                    <tr
                      key={p.transactionPairId ?? p.date}
                      className="hover:bg-savanna-50/50"
                    >
                      <td className="px-4 py-3 font-medium text-baobab-900 whitespace-nowrap">
                        {formatDate(p.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-baobab-100 px-2 py-1 rounded">
                          {String(p.transactionPairId ?? "").slice(0, 8)}
                        </span>
                        {p.transactions?.[0]?.entryType && (
                          <span className="ml-2 text-baobab-600">
                            {String(p.transactions[0].entryType)}
                          </span>
                        )}
                        {p.isReversal && (
                          <Badge variant="warning" className="ml-2">
                            Reversal
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {formatCurrency(p.totalAmount ?? 0, "KES")}
                      </td>
                      <td className="px-4 py-3 text-baobab-600">
                        {p.transactions?.[0]?.party
                          ? `Party: ${p.transactions[0].party}`
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {history?.summary && (
            <div className="px-4 py-3 border-t border-baobab-200 text-sm text-baobab-600">
              Total: {history.summary.totalTransactions} transactions,{" "}
              {formatCurrency(history.summary.totalAmount ?? 0, "KES")}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="no-print mt-8">
        <Button variant="ghost" onClick={() => window.print()}>
          Print Report
        </Button>
      </div>
    </div>
  );
}
