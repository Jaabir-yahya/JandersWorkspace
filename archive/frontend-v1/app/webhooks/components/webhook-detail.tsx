"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  type WebhookEvent,
  type WebhookStatus,
  getStatusColor,
  getIntegrationColor,
  formatWebhookTime,
} from "@/lib/api/webhooks";

interface WebhookDetailProps {
  event: WebhookEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function WebhookDetail({
  event,
  isOpen,
  onClose,
  onRetry,
  onDelete,
  isLoading = false,
}: WebhookDetailProps) {
  if (!event && !isOpen) return null;

  const handleRetry = async () => {
    if (event) {
      await onRetry(event.id);
    }
  };

  const handleDelete = async () => {
    if (event) {
      await onDelete(event.id);
      onClose();
    }
  };

  const getStatusIcon = (status: WebhookStatus) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "RETRYING":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <>
                  {getStatusIcon(event?.status || "PENDING")}
                  <DialogTitle className="text-lg">
                    Webhook Event Details
                  </DialogTitle>
                </>
              )}
            </div>
          </div>
          <DialogDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-64 mt-2" />
            ) : (
              `Event ID: ${event?.id}`
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : event ? (
          <>
            {/* Event Info Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b">
              <div>
                <label className="text-xs text-muted-foreground">Integration</label>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={getIntegrationColor(event.integrationType)}
                  >
                    {event.integrationType}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Event Type</label>
                <div className="mt-1 font-mono text-sm">{event.eventType}</div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={getStatusColor(event.status)}
                  >
                    {event.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Retry Count</label>
                <div className="mt-1 text-sm">{event.retryCount}</div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Created</label>
                <div className="mt-1 text-sm">
                  {formatWebhookTime(event.createdAt)}
                  <span className="text-muted-foreground ml-2">
                    ({new Date(event.createdAt).toLocaleString()})
                  </span>
                </div>
              </div>
              {event.processedAt && (
                <div>
                  <label className="text-xs text-muted-foreground">Processed</label>
                  <div className="mt-1 text-sm">
                    {formatWebhookTime(event.processedAt)}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {event.errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
                  <AlertCircle className="h-4 w-4" />
                  Error
                </div>
                <p className="text-sm text-red-600 mt-1">{event.errorMessage}</p>
              </div>
            )}

            {/* Tabs for Payload and Headers */}
            <Tabs defaultValue="payload" className="flex-1">
              <TabsList>
                <TabsTrigger value="payload">Payload</TabsTrigger>
                <TabsTrigger value="raw">Raw JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="payload" className="mt-4">
                <ScrollArea className="h-[300px] rounded-md border bg-muted/50 p-4">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="raw" className="mt-4">
                <ScrollArea className="h-[300px] rounded-md border bg-muted/50 p-4">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(event, null, 2)}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              {event.status === "FAILED" && (
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
              <Button size="sm" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// Compact detail view for inline display
interface WebhookDetailCompactProps {
  event: WebhookEvent;
  onRetry: (id: string) => Promise<void>;
}

export function WebhookDetailCompact({ event, onRetry }: WebhookDetailCompactProps) {
  return (
    <div className="p-4 bg-muted/50 rounded-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getIntegrationColor(event.integrationType)}>
            {event.integrationType}
          </Badge>
          <span className="font-mono text-sm">{event.eventType}</span>
        </div>
        <Badge variant="outline" className={getStatusColor(event.status)}>
          {event.status}
        </Badge>
      </div>

      <div className="text-xs text-muted-foreground">
        {formatWebhookTime(event.createdAt)} · {event.retryCount} retries
      </div>

      <ScrollArea className="h-32 rounded border bg-background p-2">
        <pre className="text-xs font-mono whitespace-pre-wrap break-all">
          {JSON.stringify(event.payload, null, 2)}
        </pre>
      </ScrollArea>

      {event.status === "FAILED" && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onRetry(event.id)}
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Retry Webhook
        </Button>
      )}
    </div>
  );
}
