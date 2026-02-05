"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Search, Filter, Download, Calendar, Plus } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Badge } from "@/components/Badge";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  downloadAsCSV,
} from "@/lib/utils";
import type { LedgerEntry, Transaction } from "@/lib/types";
import { toast } from "sonner";

export default function LedgerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    dateFrom: "",
    dateTo: "",
    type: "",
    status: "",
  });

  useEffect(() => {
    // Simulate API call - replace with actual API
    setTimeout(() => {
      setTransactions([
        {
          id: "1",
          tenantId: "temp",
          fromAccountId: "acc1",
          toAccountId: "acc2",
          amount: 25000,
          date: "2024-02-01",
          notes: "Office Supplies from Kenya Supplies Ltd",
          reference: "PUR-001",
          createdByUserId: "user1",
          createdAt: "2024-02-01T00:00:00Z",
          updatedAt: "2024-02-01T00:00:00Z",
        },
        {
          id: "2",
          tenantId: "temp",
          fromAccountId: "acc2",
          toAccountId: "acc1",
          amount: 125000,
          date: "2024-02-02",
          notes: "Consulting Services - ABC Limited",
          reference: "INV-001",
          createdByUserId: "user1",
          createdAt: "2024-02-02T00:00:00Z",
          updatedAt: "2024-02-02T00:00:00Z",
        },
        {
          id: "3",
          tenantId: "temp",
          fromAccountId: "acc3",
          toAccountId: "acc1",
          amount: 50000,
          date: "2024-02-03",
          notes: "Payment received via MPesa - RXF345GH89",
          reference: "PAY-001",
          createdByUserId: "user1",
          createdAt: "2024-02-03T00:00:00Z",
          updatedAt: "2024-02-03T00:00:00Z",
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleExport = (format: "csv" | "pdf") => {
    if (format === "csv") {
      downloadAsCSV(transactions, "ledger-report");
    } else {
      toast.error("PDF export coming soon!");
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter.dateFrom && t.date < filter.dateFrom) return false;
    if (filter.dateTo && t.date > filter.dateTo) return false;
    // For new Transaction model, we can filter by reference instead of type
    if (filter.type && t.reference && !t.reference.includes(filter.type))
      return false;
    return true;
  });

  // For Universal Truth transactions, amount is the key field
  const totalDebits = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  );
  const totalCredits = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-baobab-900">
            Ledger
          </h1>
          <p className="text-baobab-600 mt-1">
            View all accounting entries and transactions
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
            <Download className="h-5 w-5 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-baobab-600" />
            <h2 className="font-display font-semibold text-lg">Filters</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="From Date"
              type="date"
              value={filter.dateFrom}
              onChange={(e) =>
                setFilter({ ...filter, dateFrom: e.target.value })
              }
              icon={<Calendar className="h-5 w-5" />}
            />
            <Input
              label="To Date"
              type="date"
              value={filter.dateTo}
              onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
              icon={<Calendar className="h-5 w-5" />}
            />
            <Select
              label="Transaction Type"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              options={[
                { value: "", label: "All Types" },
                { value: "PURCHASE", label: "Purchases" },
                { value: "INVOICE", label: "Invoices" },
                { value: "PAYMENT", label: "Payments" },
                { value: "EXPENSE", label: "Expenses" },
              ]}
            />
            <Select
              label="Status"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              options={[
                { value: "", label: "All Statuses" },
                { value: "DRAFT", label: "Draft" },
                { value: "POSTED", label: "Posted" },
                { value: "PAID", label: "Paid" },
                { value: "VOID", label: "Void" },
              ]}
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setFilter({ dateFrom: "", dateTo: "", type: "", status: "" })
              }
            >
              Clear Filters
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <p className="text-sm text-baobab-600 mb-2">Total Transactions</p>
            <p className="text-3xl font-bold text-baobab-900">
              {filteredTransactions.length}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-baobab-600 mb-2">Total Debits</p>
            <p className="text-3xl font-bold currency text-clay-700">
              {formatCurrency(totalDebits, "KES")}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-baobab-600 mb-2">Total Credits</p>
            <p className="text-3xl font-bold currency text-acacia-700">
              {formatCurrency(totalCredits, "KES")}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">
              Transaction Ledger
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-baobab-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="pl-9 pr-4 py-2 bg-savanna-50 border border-baobab-200 rounded-lg text-sm focus:bg-white focus:border-acacia-500 focus:ring-2 focus:ring-acacia-200 transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-savanna-50 border-b border-baobab-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Debit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Credit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-baobab-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-acacia-600 border-t-transparent rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-savanna-50">
                      <td className="px-6 py-4 font-medium text-baobab-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-baobab-100 px-2 py-1 rounded">
                          {transaction.reference}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-baobab-900">
                        <div>
                          <p className="font-medium">
                            {transaction.notes || transaction.reference}
                          </p>
                          <p className="text-xs text-baobab-500">
                            {transaction.reference}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <span className="text-clay-700 font-semibold">
                          {formatCurrency(transaction.amount, "KES")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <span className="text-acacia-700 font-semibold">
                          {formatCurrency(transaction.amount, "KES")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <span className="text-clay-700 font-semibold">
                          {formatCurrency(transaction.amount, "KES")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="success">ACTIVE</Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <span className="text-clay-700 font-semibold">
                          {formatCurrency(transaction.amount, "KES")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <span className="text-acacia-700 font-semibold">
                          {formatCurrency(transaction.amount, "KES")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <span className="text-clay-700 font-semibold">
                          {formatCurrency(transaction.amount, "KES")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="success">ACTIVE</Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <span className="text-acacia-700 font-semibold">
                          {formatCurrency(transaction.amount, "KES")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold">
                        {formatCurrency(transaction.amount, "KES")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="success">ACTIVE</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-baobab-500"
                    >
                      No transactions found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Print-friendly version */}
      <div className="no-print mt-8">
        <Button variant="ghost" onClick={() => window.print()}>
          Print Ledger
        </Button>
      </div>
    </div>
  );
}
