"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusColor, getPaymentStatusColor, getTypeColor } from "@/lib/helpers";
import type { TransactionStatus, PaymentStatus, TransactionType } from "@/lib/types";

interface StatusBadgeProps {
  status: TransactionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", getStatusColor(status))}>
      {status}
    </Badge>
  );
}

interface PaymentBadgeProps {
  status: PaymentStatus;
}

export function PaymentBadge({ status }: PaymentBadgeProps) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", getPaymentStatusColor(status))}>
      {status}
    </Badge>
  );
}

interface TypeBadgeProps {
  type: TransactionType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", getTypeColor(type))}>
      {type}
    </Badge>
  );
}
