"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, PaymentBadge, TypeBadge } from "@/components/status-badge";
import { TransactionDetail } from "@/components/transaction-detail";
import { transactionApi } from "@/lib/api";
import { formatCurrency, formatDate, toISODateString } from "@/lib/helpers";
import type { Transaction, TransactionFilters, TransactionStatus, TransactionType, PaymentStatus } from "@/lib/types";
import { Search, RefreshCw, Loader2, Calendar, X } from "lucide-react";

const statuses: TransactionStatus[] = ["DRAFT", "POSTED", "REVERSED", "RECONCILED", "VOIDED", "ARCHIVED"];
const types: TransactionType[] = ["RETAIL", "SERVICE", "RENTAL", "EXPENSE"];
const paymentStatuses: PaymentStatus[] = ["PENDING", "PARTIAL", "PAID", "OVERDUE"];

export function TransactionFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: TransactionFilters = {};
      if (search) filters.search = search;
      if (statusFilter && statusFilter !== "all") filters.status = statusFilter as TransactionStatus;
      if (typeFilter && typeFilter !== "all") filters.type = typeFilter as TransactionType;
      if (paymentFilter && paymentFilter !== "all") filters.payment_status = paymentFilter as PaymentStatus;
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;

      const data = await transactionApi.list(filters);
      setTransactions(data);
    } catch (error) {
      console.error("[v0] Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, typeFilter, paymentFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const handleViewTransaction = async (transaction: Transaction) => {
    try {
      const fullTransaction = await transactionApi.get(transaction.id);
      setSelectedTransaction(fullTransaction);
      setDetailOpen(true);
    } catch (error) {
      console.error("[v0] Failed to fetch transaction details:", error);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setPaymentFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = search || statusFilter !== "all" || typeFilter !== "all" || paymentFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage all transactions</p>
        </div>
        <Button onClick={fetchTransactions} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-card border border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, reference, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            {paymentStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[140px]"
            max={dateTo || toISODateString(new Date())}
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[140px]"
            min={dateFrom}
            max={toISODateString(new Date())}
          />
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm">Try adjusting your filters or create a new transaction</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="font-medium">Date</TableHead>
                <TableHead className="font-medium">Customer</TableHead>
                <TableHead className="font-medium">Type</TableHead>
                <TableHead className="font-medium">Reference</TableHead>
                <TableHead className="font-medium text-right">Amount</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="cursor-pointer border-border hover:bg-muted/50"
                  onClick={() => handleViewTransaction(transaction)}
                >
                  <TableCell className="font-mono text-sm">
                    {formatDate(transaction.transaction_date)}
                  </TableCell>
                  <TableCell>
                    {transaction.entity?.display_name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={transaction.type} />
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {transaction.reference || "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(transaction.total_amount, transaction.currency_code)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell>
                    <PaymentBadge status={transaction.payment_status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetail
        transaction={selectedTransaction}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onRefresh={fetchTransactions}
      />
    </div>
  );
}
