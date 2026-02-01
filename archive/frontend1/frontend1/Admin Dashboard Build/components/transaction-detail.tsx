"use client";

import React from "react"

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, PaymentBadge, TypeBadge } from "@/components/status-badge";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/helpers";
import { transactionApi, attachmentApi, DEFAULT_USER_ID } from "@/lib/api";
import type { Transaction, Attachment, PaymentMethod } from "@/lib/types";
import {
  Download,
  Send,
  RotateCcw,
  Loader2,
  Upload,
  FileImage,
  FileText,
  FileAudio,
  File,
  Trash2,
  Calendar,
  Banknote,
  Smartphone,
  Building,
  CreditCard,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { ReverseModal } from "./reverse-modal";

interface TransactionDetailProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

const paymentMethodIcons: Record<PaymentMethod, typeof Banknote> = {
  CASH: Banknote,
  MPESA: Smartphone,
  BANK: Building,
  CARD: CreditCard,
  CREDIT: AlertCircle,
  OTHER: CreditCard,
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: "Cash",
  MPESA: "M-Pesa",
  BANK: "Bank Transfer",
  CARD: "Card",
  CREDIT: "Credit",
  OTHER: "Other",
};

export function TransactionDetail({
  transaction,
  open,
  onOpenChange,
  onRefresh,
}: TransactionDetailProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reverseOpen, setReverseOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transaction && open) {
      loadAttachments();
    }
  }, [transaction, open]);

  const loadAttachments = async () => {
    if (!transaction) return;
    setIsLoadingAttachments(true);
    try {
      // Try to load from transaction.attachments first (if populated by API)
      if (transaction.attachments) {
        setAttachments(transaction.attachments);
      } else {
        const data = await attachmentApi.listForTransaction(transaction.id);
        setAttachments(data);
      }
    } catch (error) {
      console.error("[v0] Failed to load attachments:", error);
      setAttachments([]);
    } finally {
      setIsLoadingAttachments(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !transaction) return;

    setIsUploading(true);
    try {
      const newAttachment = await attachmentApi.upload(file, transaction.id);
      setAttachments((prev) => [...prev, newAttachment]);
    } catch (error) {
      console.error("[v0] Failed to upload file:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await attachmentApi.delete(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (error) {
      console.error("[v0] Failed to delete attachment:", error);
    }
  };

  const getFileIcon = (fileType: Attachment["file_type"]) => {
    switch (fileType) {
      case "IMAGE":
        return FileImage;
      case "PDF":
        return FileText;
      case "AUDIO":
        return FileAudio;
      default:
        return File;
    }
  };

  if (!transaction) return null;

  const handlePost = async () => {
    setIsPosting(true);
    try {
      await transactionApi.post(transaction.id, DEFAULT_USER_ID);
      onRefresh();
      onOpenChange(false);
    } catch (error) {
      console.error("[v0] Failed to post transaction:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await transactionApi.export(transaction.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transaction-${transaction.reference || transaction.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[v0] Failed to export transaction:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const totalPayments =
    transaction.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const remainingBalance = transaction.total_amount - totalPayments;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>Transaction Details</span>
              <StatusBadge status={transaction.status} />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Reference</p>
                <p className="font-mono">{transaction.reference || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p>{formatDateTime(transaction.transaction_date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p>{transaction.entity?.display_name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <TypeBadge type={transaction.type} />
              </div>
              <div>
                <p className="text-muted-foreground">Payment Status</p>
                <PaymentBadge status={transaction.payment_status} />
              </div>
              <div>
                <p className="text-muted-foreground">Currency</p>
                <p>{transaction.currency_code}</p>
              </div>
            </div>

            {/* Credit/Due Date Alert */}
            {(transaction.payment_status === "CREDIT" || transaction.due_date) && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-amber-400">Credit (Udhaari)</p>
                  {transaction.due_date && (
                    <p className="text-xs text-amber-400/80">
                      Due: {formatDate(transaction.due_date)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Context/Notes */}
            {transaction.context && (
              <div>
                <h4 className="text-sm font-medium mb-2">Context / Notes</h4>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {transaction.context}
                  </p>
                </div>
              </div>
            )}

            <Separator className="bg-border" />

            {/* Line Items */}
            <div>
              <h4 className="text-sm font-medium mb-3">Line Items</h4>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Description</th>
                      <th className="text-right px-4 py-2 font-medium">Qty</th>
                      <th className="text-right px-4 py-2 font-medium">Unit Price</th>
                      <th className="text-right px-4 py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaction.lines.map((line) => (
                      <tr key={line.id} className="border-t border-border">
                        <td className="px-4 py-2">
                          <div>{line.description}</div>
                          {line.sku && (
                            <div className="text-xs text-muted-foreground font-mono">
                              SKU: {line.sku}
                            </div>
                          )}
                        </td>
                        <td className="text-right px-4 py-2">{line.quantity}</td>
                        <td className="text-right px-4 py-2">
                          {formatCurrency(line.unit_price, transaction.currency_code)}
                        </td>
                        <td className="text-right px-4 py-2 font-medium">
                          {formatCurrency(line.total_line_amount, transaction.currency_code)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30">
                    <tr className="border-t border-border">
                      <td colSpan={3} className="px-4 py-3 text-right font-medium">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-lg">
                        {formatCurrency(transaction.total_amount, transaction.currency_code)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Records (Split Payments) */}
            {transaction.payments && transaction.payments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Payment Records</h4>
                <div className="space-y-2">
                  {transaction.payments.map((payment) => {
                    const Icon = paymentMethodIcons[payment.method] || Banknote;
                    return (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {paymentMethodLabels[payment.method]}
                            </p>
                            {payment.reference && (
                              <p className="text-xs text-muted-foreground font-mono">
                                Ref: {payment.reference}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-mono font-medium text-emerald-400">
                          {formatCurrency(payment.amount, transaction.currency_code)}
                        </span>
                      </div>
                    );
                  })}
                  {/* Summary */}
                  <div className="flex items-center justify-between pt-2 text-sm">
                    <span className="text-muted-foreground">Total Paid</span>
                    <span className="font-mono font-medium text-emerald-400">
                      {formatCurrency(totalPayments, transaction.currency_code)}
                    </span>
                  </div>
                  {remainingBalance > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-mono font-medium text-amber-400">
                        {formatCurrency(remainingBalance, transaction.currency_code)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator className="bg-border" />

            {/* Attachments / Proof */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Proof / Attachments</h4>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="attachment-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Receipt
                  </Button>
                </div>
              </div>

              {isLoadingAttachments ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : attachments.length === 0 ? (
                <div className="text-center py-6 rounded-lg border border-dashed border-border">
                  <FileImage className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No attachments yet</p>
                  <p className="text-xs text-muted-foreground/70">
                    Upload receipts, invoices, or voice notes
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {attachments.map((attachment) => {
                    const FileIcon = getFileIcon(attachment.file_type);
                    return (
                      <div
                        key={attachment.id}
                        className="group relative p-3 rounded-lg bg-muted/30 border border-border"
                      >
                        {attachment.file_type === "IMAGE" ? (
                          <div className="aspect-square rounded overflow-hidden mb-2 bg-muted">
                            <img
                              src={attachment.file_url || "/placeholder.svg"}
                              alt={attachment.file_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square rounded bg-muted/50 flex items-center justify-center mb-2">
                            <FileIcon className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        <p className="text-xs truncate">{attachment.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(attachment.uploaded_at)}
                        </p>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => window.open(attachment.file_url, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDeleteAttachment(attachment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator className="bg-border" />

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export
              </Button>

              {transaction.status === "DRAFT" && (
                <Button onClick={handlePost} disabled={isPosting}>
                  {isPosting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post Transaction
                </Button>
              )}

              {transaction.status === "POSTED" && (
                <Button variant="destructive" onClick={() => setReverseOpen(true)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reverse
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ReverseModal
        transaction={transaction}
        open={reverseOpen}
        onOpenChange={setReverseOpen}
        onSuccess={() => {
          onRefresh();
          onOpenChange(false);
        }}
      />
    </>
  );
}
