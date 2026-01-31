"use client";

import { useState, useCallback } from "react";
import { useTransactions, useAttachmentsForTransaction, uploadAttachment } from "@/lib/api-client";
import { formatCurrency, formatDateTime } from "@/lib/helpers";
import type { Transaction, Attachment } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Upload,
  Image,
  File,
  X,
  Search,
  Eye,
  Download,
  Paperclip,
} from "lucide-react";
import { DEFAULT_USER_ID } from "@/lib/api-client";

function FileIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) return <Image className="h-6 w-6" />;
  if (type === "application/pdf") return <FileText className="h-6 w-6" />;
  return <File className="h-6 w-6" />;
}

function AttachmentCard({
  attachment,
  onClick,
}: {
  attachment: Attachment;
  onClick?: () => void;
}) {
  const isImage = attachment.file_type === "IMAGE" || attachment.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="aspect-video bg-secondary rounded-md mb-3 flex items-center justify-center overflow-hidden">
          {isImage ? (
            <img
              src={attachment.file_url}
              alt={attachment.file_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileIcon type={attachment.file_type} />
          )}
        </div>
        <p className="text-sm font-medium truncate">{attachment.file_name}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(attachment.uploaded_at).toLocaleDateString()}
        </p>
        {attachment.transaction_id && (
          <Badge variant="secondary" className="mt-2 text-xs">
            Transaction
          </Badge>
        )}
        {attachment.entity_id && (
          <Badge variant="secondary" className="mt-2 text-xs">
            Entity
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProofVaultPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");

  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();
  const { data: attachments, mutate: refreshAttachments } = useAttachmentsForTransaction(
    selectedTransaction?.id || ""
  );

  const filteredTransactions = transactions?.filter((t) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      t.reference?.toLowerCase().includes(search) ||
      t.entity?.display_name.toLowerCase().includes(search)
    );
  });

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !selectedTransaction) return;

      setIsUploading(true);
      try {
        await uploadAttachment(file, {
          transactionId: selectedTransaction.id,
          userId: DEFAULT_USER_ID,
        });
        refreshAttachments();
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload file");
      } finally {
        setIsUploading(false);
      }
    },
    [selectedTransaction, refreshAttachments]
  );

  // Collect all attachments from transactions
  const allAttachments = transactions?.flatMap((t) => t.attachments || []) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proof Vault</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage receipts, invoices, and proof documents
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="transactions">By Transaction</TabsTrigger>
          <TabsTrigger value="gallery">All Files</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transaction List */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="rounded-md border">
                <div className="max-h-[600px] overflow-y-auto">
                  {isLoadingTransactions ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="p-4 border-b">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ))
                  ) : filteredTransactions?.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No transactions found</p>
                    </div>
                  ) : (
                    filteredTransactions?.map((transaction) => (
                      <button
                        key={transaction.id}
                        className={`w-full text-left p-4 border-b hover:bg-secondary/50 transition-colors ${
                          selectedTransaction?.id === transaction.id ? "bg-secondary" : ""
                        }`}
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {transaction.reference || "No reference"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.entity?.display_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-sm">
                              {formatCurrency(transaction.total_amount, transaction.currency_code)}
                            </p>
                            {transaction.attachments && transaction.attachments.length > 0 && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                <Paperclip className="h-3 w-3 mr-1" />
                                {transaction.attachments.length}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(transaction.transaction_date)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Attachment Gallery */}
            <div className="lg:col-span-2">
              {selectedTransaction ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {selectedTransaction.reference || "Transaction"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedTransaction.entity?.display_name} •{" "}
                        {formatCurrency(selectedTransaction.total_amount, selectedTransaction.currency_code)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,.pdf"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" disabled={isUploading} asChild>
                          <span>
                            <Upload className="mr-2 h-4 w-4" />
                            {isUploading ? "Uploading..." : "Upload"}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>

                  {attachments && attachments.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {attachments.map((attachment) => (
                        <AttachmentCard
                          key={attachment.id}
                          attachment={attachment}
                          onClick={() => setSelectedAttachment(attachment)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No attachments yet</p>
                      <p className="text-sm text-muted-foreground">
                        Upload receipts, invoices, or proof documents
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
                  <FileText className="h-16 w-16 mb-4 opacity-30" />
                  <p className="text-lg">Select a transaction to view attachments</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          {allAttachments.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {allAttachments.map((attachment) => (
                <AttachmentCard
                  key={attachment.id}
                  attachment={attachment}
                  onClick={() => setSelectedAttachment(attachment)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-30" />
              <p>No files uploaded yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Attachment Preview Dialog */}
      <Dialog
        open={!!selectedAttachment}
        onOpenChange={() => setSelectedAttachment(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate">{selectedAttachment?.file_name}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={selectedAttachment?.file_url}
                    download={selectedAttachment?.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center bg-secondary rounded-lg overflow-hidden min-h-[400px]">
            {selectedAttachment?.file_type === "IMAGE" ||
            selectedAttachment?.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img
                src={selectedAttachment?.file_url}
                alt={selectedAttachment?.file_name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p>Preview not available</p>
                <Button variant="outline" className="mt-4" asChild>
                  <a
                    href={selectedAttachment?.file_url}
                    download={selectedAttachment?.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Uploaded: {selectedAttachment && new Date(selectedAttachment.uploaded_at).toLocaleString()}</p>
            {selectedAttachment?.file_size && (
              <p>Size: {(selectedAttachment.file_size / 1024).toFixed(1)} KB</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
