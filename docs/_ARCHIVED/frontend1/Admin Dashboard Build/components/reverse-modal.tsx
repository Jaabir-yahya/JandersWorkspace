"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactionApi, DEFAULT_USER_ID } from "@/lib/api";
import type { Transaction, ReasonCode } from "@/lib/types";
import { Loader2, AlertTriangle } from "lucide-react";

interface ReverseModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const reasonCodes: { value: ReasonCode; label: string }[] = [
  { value: "RETURN", label: "Customer Return" },
  { value: "ERROR", label: "Entry Error" },
  { value: "CANCELLATION", label: "Cancellation" },
  { value: "OTHER", label: "Other" },
];

export function ReverseModal({
  transaction,
  open,
  onOpenChange,
  onSuccess,
}: ReverseModalProps) {
  const [reasonCode, setReasonCode] = useState<ReasonCode>("RETURN");
  const [reasonText, setReasonText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!transaction || !reasonText.trim()) return;

    setIsSubmitting(true);
    try {
      await transactionApi.reverse(transaction.id, {
        user_id: DEFAULT_USER_ID,
        reason_code: reasonCode,
        reason_text: reasonText.trim(),
      });
      onSuccess();
      onOpenChange(false);
      setReasonCode("RETURN");
      setReasonText("");
    } catch (error) {
      console.error("[v0] Failed to reverse transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Reverse Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            This will create a reversal transaction with negative amounts. This
            action cannot be undone.
          </p>

          <div className="space-y-2">
            <Label htmlFor="reason-code">Reason Code</Label>
            <Select
              value={reasonCode}
              onValueChange={(value) => setReasonCode(value as ReasonCode)}
            >
              <SelectTrigger id="reason-code">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reasonCodes.map((code) => (
                  <SelectItem key={code.value} value={code.value}>
                    {code.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason-text">Reason Description</Label>
            <Textarea
              id="reason-text"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Explain why this transaction is being reversed..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting || !reasonText.trim()}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirm Reversal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
