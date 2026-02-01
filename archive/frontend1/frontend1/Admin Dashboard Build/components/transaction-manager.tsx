"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge, TypeBadge } from "@/components/status-badge";
import { TransactionDetail } from "@/components/transaction-detail";
import { ReverseModal } from "@/components/reverse-modal";
import { transactionApi, DEFAULT_USER_ID } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/helpers";
import type { Transaction } from "@/lib/types";
import { 
  RefreshCw, 
  Loader2, 
  Send, 
  RotateCcw, 
  Eye, 
  FileText,
  CheckCircle2 
} from "lucide-react";

export function TransactionManager() {
  const [draftTransactions, setDraftTransactions] = useState<Transaction[]>([]);
  const [postedTransactions, setPostedTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postingId, setPostingId] = useState<string | null>(null);
  
  // Modals
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reverseOpen, setReverseOpen] = useState(false);
  const [confirmPostOpen, setConfirmPostOpen] = useState(false);
  const [transactionToPost, setTransactionToPost] = useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const [drafts, posted] = await Promise.all([
        transactionApi.list({ status: "DRAFT" }),
        transactionApi.list({ status: "POSTED" }),
      ]);
      setDraftTransactions(drafts);
      setPostedTransactions(posted);
    } catch (error) {
      console.error("[v0] Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
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

  const handlePostConfirm = (transaction: Transaction) => {
    setTransactionToPost(transaction);
    setConfirmPostOpen(true);
  };

  const handlePost = async () => {
    if (!transactionToPost) return;
    
    setPostingId(transactionToPost.id);
    setConfirmPostOpen(false);
    
    try {
      await transactionApi.post(transactionToPost.id, DEFAULT_USER_ID);
      fetchTransactions();
    } catch (error) {
      console.error("[v0] Failed to post transaction:", error);
    } finally {
      setPostingId(null);
      setTransactionToPost(null);
    }
  };

  const handleReverseClick = async (transaction: Transaction) => {
    try {
      const fullTransaction = await transactionApi.get(transaction.id);
      setSelectedTransaction(fullTransaction);
      setReverseOpen(true);
    } catch (error) {
      console.error("[v0] Failed to fetch transaction for reversal:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transaction Manager</h1>
          <p className="text-muted-foreground">Post drafts and reverse posted transactions</p>
        </div>
        <Button onClick={fetchTransactions} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="drafts" className="space-y-4">
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="drafts" className="data-[state=active]:bg-card">
            <FileText className="h-4 w-4 mr-2" />
            Drafts ({draftTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="posted" className="data-[state=active]:bg-card">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Posted ({postedTransactions.length})
          </TabsTrigger>
        </TabsList>

        {/* Draft Transactions */}
        <TabsContent value="drafts">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : draftTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <FileText className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-lg font-medium">No draft transactions</p>
                <p className="text-sm">All drafts have been posted or none exist yet</p>
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
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draftTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-border">
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTransaction(transaction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePostConfirm(transaction)}
                            disabled={postingId === transaction.id}
                          >
                            {postingId === transaction.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-1" />
                            )}
                            Post
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Posted Transactions */}
        <TabsContent value="posted">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : postedTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-lg font-medium">No posted transactions</p>
                <p className="text-sm">Post some drafts to see them here</p>
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
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-border">
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTransaction(transaction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReverseClick(transaction)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reverse
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Modal */}
      <TransactionDetail
        transaction={selectedTransaction}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onRefresh={fetchTransactions}
      />

      {/* Reverse Modal */}
      <ReverseModal
        transaction={selectedTransaction}
        open={reverseOpen}
        onOpenChange={setReverseOpen}
        onSuccess={fetchTransactions}
      />

      {/* Post Confirmation Dialog */}
      <AlertDialog open={confirmPostOpen} onOpenChange={setConfirmPostOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Post Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to post this transaction? Once posted, it cannot be
              edited - only reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePost}>
              <Send className="h-4 w-4 mr-2" />
              Post Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
