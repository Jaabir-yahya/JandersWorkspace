"use client";

import { useState } from "react";
import {
  useTransactions,
  postTransaction,
  reverseTransaction,
} from "@/lib/api-client";
import { formatCurrency, formatDateTime } from "@/lib/helpers";
import type { Transaction, ReasonCode } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PaymentBadge, TypeBadge } from "@/components/status-badge";
import {
  Settings,
  CheckCircle,
  RotateCcw,
  Search,
  AlertTriangle,
  FileText,
  Eye,
} from "lucide-react";
import { DEFAULT_USER_ID } from "@/lib/api-client";

const REASON_CODES: { value: ReasonCode; label: string }[] = [
  { value: "RETURN", label: "Return" },
  { value: "ERROR", label: "Error" },
  { value: "CANCELLATION", label: "Cancellation" },
  { value: "OTHER", label: "Other" },
];

export default function ManagerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showReverseDialog, setShowReverseDialog] = useState(false);
  const [reverseReason, setReverseReason] = useState<ReasonCode>("OTHER");
  const [reverseText, setReverseText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: transactions, isLoading, mutate: refreshTransactions } = useTransactions();

  const filteredTransactions = transactions?.filter((t) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      t.reference?.toLowerCase().includes(search) ||
      t.entity?.display_name.toLowerCase().includes(search) ||
      t.status.toLowerCase().includes(search)
    );
  });

  // Group transactions by status
  const draftTransactions = filteredTransactions?.filter((t) => t.status === "DRAFT") || [];
  const postedTransactions = filteredTransactions?.filter((t) => t.status === "POSTED") || [];
  const reversedTransactions = filteredTransactions?.filter((t) => t.status === "REVERSED") || [];

  const handlePost = async (transaction: Transaction) => {
    setIsProcessing(true);
    try {
      await postTransaction(transaction.id, DEFAULT_USER_ID);
      refreshTransactions();
    } catch (error) {
      console.error("Failed to post transaction:", error);
      alert("Failed to post transaction");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReverse = async () => {
    if (!selectedTransaction) return;

    setIsProcessing(true);
    try {
      await reverseTransaction(selectedTransaction.id, {
        user_id: DEFAULT_USER_ID,
        reason_code: reverseReason,
        reason_text: reverseText,
      });
      setShowReverseDialog(false);
      setSelectedTransaction(null);
      setReverseReason("OTHER");
      setReverseText("");
      refreshTransactions();
    } catch (error) {
      console.error("Failed to reverse transaction:", error);
      alert("Failed to reverse transaction");
    } finally {
      setIsProcessing(false);
    }
  };

  const openReverseDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowReverseDialog(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transaction Manager</h1>
          <p className="text-sm text-muted-foreground">
            Post draft transactions and reverse posted ones
          </p>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="text-2xl font-semibold">{draftTransactions.length}</p>
              </div>
              <FileText className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Posted</p>
                <p className="text-2xl font-semibold">{postedTransactions.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reversed</p>
                <p className="text-2xl font-semibold">{reversedTransactions.length}</p>
              </div>
              <RotateCcw className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Draft Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-500" />
            Draft Transactions (Ready to Post)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : draftTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No draft transactions
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono">
                      {transaction.reference || "-"}
                    </TableCell>
                    <TableCell>{transaction.entity?.display_name}</TableCell>
                    <TableCell>
                      <TypeBadge type={transaction.type} />
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(transaction.total_amount, transaction.currency_code)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDateTime(transaction.transaction_date)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handlePost(transaction)}
                        disabled={isProcessing}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Post
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Posted Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Posted Transactions (Can be Reversed)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : postedTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No posted transactions
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {postedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono">
                      {transaction.reference || "-"}
                    </TableCell>
                    <TableCell>{transaction.entity?.display_name}</TableCell>
                    <TableCell>
                      <TypeBadge type={transaction.type} />
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
                        size="sm"
                        variant="destructive"
                        onClick={() => openReverseDialog(transaction)}
                        disabled={isProcessing}
                      >
                        <RotateCcw className="mr-1 h-4 w-4" />
                        Reverse
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recently Reversed */}
      {reversedTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-red-500" />
              Recently Reversed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reversedTransactions.slice(0, 5).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono">
                      {transaction.reference || "-"}
                    </TableCell>
                    <TableCell>{transaction.entity?.display_name}</TableCell>
                    <TableCell>
                      <TypeBadge type={transaction.type} />
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(transaction.total_amount, transaction.currency_code)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDateTime(transaction.transaction_date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Reverse Dialog */}
      <Dialog open={showReverseDialog} onOpenChange={setShowReverseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Reverse Transaction
            </DialogTitle>
            <DialogDescription>
              This will create a reversing entry. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4 pt-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-medium">{selectedTransaction.reference || "Transaction"}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTransaction.entity?.display_name} •{" "}
                  {formatCurrency(selectedTransaction.total_amount, selectedTransaction.currency_code)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Reason Code *</Label>
                <Select
                  value={reverseReason}
                  onValueChange={(v: ReasonCode) => setReverseReason(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REASON_CODES.map((code) => (
                      <SelectItem key={code.value} value={code.value}>
                        {code.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reason Details *</Label>
                <Textarea
                  value={reverseText}
                  onChange={(e) => setReverseText(e.target.value)}
                  placeholder="Explain why this transaction is being reversed..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReverseDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReverse}
                  disabled={!reverseText || isProcessing}
                >
                  {isProcessing ? "Reversing..." : "Confirm Reverse"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
