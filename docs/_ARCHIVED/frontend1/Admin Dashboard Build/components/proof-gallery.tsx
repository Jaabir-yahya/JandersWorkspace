"use client";

import React from "react";
import useSWR from "swr";
import { attachmentApi, transactionApi, entityApi } from "@/lib/api";
import type { Attachment, Transaction, Entity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Search, FileText, ImageIcon, Music, File, Trash2, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/helpers";

interface AttachmentWithContext extends Attachment {
  transaction?: Transaction;
  entity?: Entity;
}

export function ProofGallery() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [uploadType, setUploadType] = React.useState<"transaction" | "entity">("transaction");
  const [selectedId, setSelectedId] = React.useState("");
  const [selectedAttachment, setSelectedAttachment] = React.useState<AttachmentWithContext | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  // Fetch all data needed
  const { data: transactions } = useSWR<Transaction[]>("transactions-all", () =>
    transactionApi.list()
  );
  const { data: entities } = useSWR<Entity[]>("entities-all", () => entityApi.list());

  // Get all attachments by fetching from all transactions
  const [allAttachments, setAllAttachments] = React.useState<AttachmentWithContext[]>([]);

  React.useEffect(() => {
    const loadAttachments = async () => {
      if (!transactions) return;

      const attachmentsWithContext: AttachmentWithContext[] = [];
      
      for (const tx of transactions) {
        if (tx.attachments && tx.attachments.length > 0) {
          for (const att of tx.attachments) {
            attachmentsWithContext.push({
              ...att,
              transaction: tx,
            });
          }
        }
      }

      setAllAttachments(attachmentsWithContext);
    };

    loadAttachments();
  }, [transactions]);

  const handleUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const transactionId = uploadType === "transaction" ? selectedId : undefined;
      const entityId = uploadType === "entity" ? selectedId : undefined;

      await attachmentApi.upload(uploadFile, transactionId, entityId);
      
      // Reset form
      setUploadFile(null);
      setSelectedId("");
      
      // Trigger reload by mutating SWR cache
      window.location.reload();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this attachment?")) return;

    try {
      await attachmentApi.delete(id);
      setAllAttachments((prev) => prev.filter((a) => a.id !== id));
      setSelectedAttachment(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "IMAGE":
        return <ImageIcon className="h-4 w-4" />;
      case "PDF":
        return <FileText className="h-4 w-4" />;
      case "AUDIO":
        return <Music className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const filteredAttachments = allAttachments.filter((att) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      att.file_name.toLowerCase().includes(query) ||
      att.transaction?.reference?.toLowerCase().includes(query) ||
      att.entity?.display_name.toLowerCase().includes(query)
    );
  });

  const transactionAttachments = filteredAttachments.filter((a) => a.transaction_id);
  const entityAttachments = filteredAttachments.filter((a) => a.entity_id && !a.transaction_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Proof Vault</h2>
          <p className="text-sm text-muted-foreground">
            Receipts, invoices, and voice notes attached to transactions and people
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Upload New Proof</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Attach to</label>
              <div className="flex gap-2">
                <Button
                  variant={uploadType === "transaction" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUploadType("transaction")}
                >
                  Transaction
                </Button>
                <Button
                  variant={uploadType === "entity" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUploadType("entity")}
                >
                  Person
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Select {uploadType === "transaction" ? "Transaction" : "Person"}
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Choose...</option>
                {uploadType === "transaction"
                  ? transactions?.map((tx) => (
                      <option key={tx.id} value={tx.id}>
                        {tx.reference} - {tx.entity?.display_name}
                      </option>
                    ))
                  : entities?.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.display_name}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div>
            <Input
              type="file"
              accept="image/*,application/pdf,audio/*"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!uploadFile || !selectedId || isUploading}
            className="w-full sm:w-auto"
          >
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by filename, transaction reference, or person name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Gallery Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({filteredAttachments.length})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions ({transactionAttachments.length})</TabsTrigger>
          <TabsTrigger value="entities">People ({entityAttachments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <AttachmentGrid
            attachments={filteredAttachments}
            onSelect={setSelectedAttachment}
            getFileIcon={getFileIcon}
          />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <AttachmentGrid
            attachments={transactionAttachments}
            onSelect={setSelectedAttachment}
            getFileIcon={getFileIcon}
          />
        </TabsContent>

        <TabsContent value="entities" className="mt-6">
          <AttachmentGrid
            attachments={entityAttachments}
            onSelect={setSelectedAttachment}
            getFileIcon={getFileIcon}
          />
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={!!selectedAttachment} onOpenChange={() => setSelectedAttachment(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedAttachment?.file_name}</DialogTitle>
            <DialogDescription>
              {selectedAttachment?.transaction && (
                <span>
                  Transaction: {selectedAttachment.transaction.reference} -{" "}
                  {formatCurrency(
                    selectedAttachment.transaction.total_amount,
                    selectedAttachment.transaction.currency_code
                  )}
                </span>
              )}
              {selectedAttachment?.entity && (
                <span>Person: {selectedAttachment.entity.display_name}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedAttachment && (
            <div className="space-y-4">
              {/* Preview */}
              {selectedAttachment.file_type === "IMAGE" ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={selectedAttachment.file_url || "/placeholder.svg"}
                    alt={selectedAttachment.file_name}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : selectedAttachment.file_type === "PDF" ? (
                <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-muted">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">PDF Document</p>
                  </div>
                </div>
              ) : selectedAttachment.file_type === "AUDIO" ? (
                <div className="space-y-2">
                  <div className="flex h-32 items-center justify-center rounded-lg border border-border bg-muted">
                    <Music className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <audio controls className="w-full">
                    <source src={selectedAttachment.file_url} />
                  </audio>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-muted">
                  <File className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              {/* Metadata */}
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{selectedAttachment.file_type}</span>
                </div>
                {selectedAttachment.file_size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-medium">
                      {(selectedAttachment.file_size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded</span>
                  <span className="font-medium">
                    {formatDate(selectedAttachment.uploaded_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1 bg-transparent">
                  <a
                    href={selectedAttachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedAttachment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AttachmentGrid({
  attachments,
  onSelect,
  getFileIcon,
}: {
  attachments: AttachmentWithContext[];
  onSelect: (att: AttachmentWithContext) => void;
  getFileIcon: (type: string) => React.ReactNode;
}) {
  if (attachments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No attachments found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {attachments.map((att) => (
        <Card
          key={att.id}
          className="group cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-ring"
          onClick={() => onSelect(att)}
        >
          <div className="aspect-square relative bg-muted">
            {att.file_type === "IMAGE" ? (
              <img
                src={att.file_url || "/placeholder.svg"}
                alt={att.file_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-muted-foreground">{getFileIcon(att.file_type)}</div>
              </div>
            )}
          </div>
          <div className="p-3 space-y-1">
            <p className="text-sm font-medium truncate">{att.file_name}</p>
            {att.transaction && (
              <p className="text-xs text-muted-foreground truncate">
                {att.transaction.reference}
              </p>
            )}
            {att.entity && (
              <p className="text-xs text-muted-foreground truncate">
                {att.entity.display_name}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
