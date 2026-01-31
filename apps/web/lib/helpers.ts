import type { TransactionStatus, PaymentStatus } from "./types";

export function formatCurrency(amount: number | null | undefined, currency: string = "KES"): string {
  if (amount === null || amount === undefined) return "N/A";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
  }).format(amount / 100);
}

export function formatDate(dateValue: string | number | Date | null | undefined): string {
  // Handle null, undefined, or empty string
  if (dateValue === null || dateValue === undefined || dateValue === "") {
    return "N/A";
  }

  // Convert to Date object
  let date: Date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === "number") {
    date = new Date(dateValue);
  } else {
    date = new Date(dateValue);
  }

  // Validate the date
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(dateValue: string | number | Date | null | undefined): string {
  // Handle null, undefined, or empty string
  if (dateValue === null || dateValue === undefined || dateValue === "") {
    return "N/A";
  }

  // Convert to Date object
  let date: Date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === "number") {
    date = new Date(dateValue);
  } else {
    date = new Date(dateValue);
  }

  // Validate the date
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getStatusColor(status: TransactionStatus): string {
  const colors: Record<TransactionStatus, string> = {
    DRAFT: "bg-muted text-muted-foreground",
    POSTED: "bg-blue-500/10 text-blue-400",
    REVERSED: "bg-red-500/10 text-red-400",
    RECONCILED: "bg-emerald-500/10 text-emerald-400",
    VOIDED: "bg-zinc-500/10 text-zinc-400",
    ARCHIVED: "bg-zinc-500/10 text-zinc-500",
  };
  return colors[status] || "bg-muted text-muted-foreground";
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    PENDING: "bg-amber-500/10 text-amber-400",
    PARTIAL: "bg-orange-500/10 text-orange-400",
    PAID: "bg-emerald-500/10 text-emerald-400",
    OVERDUE: "bg-red-500/10 text-red-400",
    CREDIT: "bg-purple-500/10 text-purple-400",
  };
  return colors[status] || "bg-muted text-muted-foreground";
}

export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    RETAIL: "bg-cyan-500/10 text-cyan-400",
    SERVICE: "bg-violet-500/10 text-violet-400",
    RENTAL: "bg-pink-500/10 text-pink-400",
    EXPENSE: "bg-rose-500/10 text-rose-400",
  };
  return colors[type] || "bg-muted text-muted-foreground";
}

export function toISODateString(date: Date): string {
  return date.toISOString().split("T")[0];
}
