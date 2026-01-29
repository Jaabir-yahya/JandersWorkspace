"use client";

import { useState } from "react";
import { useTransactions } from "@/lib/api-client";
import { StatusBadge, PaymentBadge, TypeBadge } from "@/components/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/helpers";
import type { TransactionFilters, Transaction } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Eye, FileText } from "lucide-react";

export default function TransactionFeedPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const { data: transactions, error, isLoading } = useTransactions(filters);

  // Filter transactions by search query locally
  const filteredTransactions = transactions?.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.reference?.toLowerCase().includes(query) ||
      t.entity?.display_name.toLowerCase().includes(query) ||
      t.type.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {filteredTransactions?.length || 0} records
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by reference, customer..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.status || "all"}
            onValueChange={(value: string) =>
              setFilters((f) => ({ ...f, status: value === "all" ? undefined : value as any }))
            }
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="POSTED">Posted</SelectItem>
              <SelectItem value="REVERSED">Reversed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.type || "all"}
            onValueChange={(value: string) =>
              setFilters((f) => ({ ...f, type: value === "all" ? undefined : value as any }))
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="RETAIL">Retail</SelectItem>
              <SelectItem value="SERVICE">Service</SelectItem>
              <SelectItem value="RENTAL">Rental</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.payment_status || "all"}
            onValueChange={(value: string) =>
              setFilters((f) => ({ ...f, payment_status: value === "all" ? undefined : value as any }))
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
              <SelectItem value="CREDIT">Credit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-red-500">
                  Failed to load transactions
                </TableCell>
              </TableRow>
            ) : filteredTransactions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions?.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <TableCell className="font-mono text-sm">
                    {transaction.reference || "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.entity?.display_name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={transaction.type} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell>
                    <PaymentBadge status={transaction.payment_status} />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(transaction.total_amount, transaction.currency_code)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(transaction.transaction_date)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTransaction(transaction);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <Dialog
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Reference</label>
                  <p className="font-mono">{selectedTransaction.reference || "-"}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Date</label>
                  <p>{formatDateTime(selectedTransaction.transaction_date)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Customer</label>
                  <p className="font-medium">{selectedTransaction.entity?.display_name}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Total Amount</label>
                  <p className="font-mono text-lg">
                    {formatCurrency(selectedTransaction.total_amount, selectedTransaction.currency_code)}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Status:</label>
                  <StatusBadge status={selectedTransaction.status} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Payment:</label>
                  <PaymentBadge status={selectedTransaction.payment_status} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Type:</label>
                  <TypeBadge type={selectedTransaction.type} />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Line Items</label>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransaction.lines?.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell>{line.description}</TableCell>
                          <TableCell className="text-right">{line.quantity}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(line.unit_price, selectedTransaction.currency_code)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(line.total_line_amount, selectedTransaction.currency_code)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Context/Notes */}
              {selectedTransaction.context && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {selectedTransaction.context}
                  </p>
                </div>
              )}

              {/* Due Date for Credit */}
              {selectedTransaction.due_date && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
                  <p className="text-sm">
                    {new Date(selectedTransaction.due_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
