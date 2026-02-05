import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid } from "date-fns";
import type { Currency, CurrencyInfo } from "./types";

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Currency information for African and international currencies
 */
export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  KES: { code: "KES", symbol: "KSh", name: "Kenyan Shilling", decimals: 2 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", decimals: 2 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", decimals: 2 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", decimals: 2 },
  UGX: { code: "UGX", symbol: "USh", name: "Ugandan Shilling", decimals: 0 },
  TZS: { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", decimals: 0 },
  RWF: { code: "RWF", symbol: "RF", name: "Rwandan Franc", decimals: 0 },
};

/**
 * Format currency amount with proper symbol and decimals
 */
export function formatCurrency(
  amount: number,
  currency: Currency = "KES",
  options: { showSymbol?: boolean; showCode?: boolean } = {},
): string {
  const { showSymbol = true, showCode = false } = options;
  const currencyInfo = CURRENCIES[currency];

  const formatted = new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  }).format(amount);

  if (showSymbol && showCode) {
    return `${currencyInfo.symbol} ${formatted} ${currencyInfo.code}`;
  }

  if (showSymbol) {
    return `${currencyInfo.symbol} ${formatted}`;
  }

  if (showCode) {
    return `${formatted} ${currencyInfo.code}`;
  }

  return formatted;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and non-numeric characters except . and -
  const cleaned = value.replace(/[^\d.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  formatStr: string = "dd MMM yyyy",
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, formatStr) : "Invalid date";
}

/**
 * Format datetime for display
 */
export function formatDateTime(
  date: Date | string,
  formatStr: string = "dd MMM yyyy HH:mm",
): string {
  return formatDate(date, formatStr);
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) return "Invalid date";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(dateObj, "dd MMM yyyy");
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Format percentage with % sign
 * @param value - The percentage value to format
 * @param decimals - Number of decimal places to display (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Generate unique ID (fallback for client-side)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Validate phone number (East African format)
 */
export function validatePhoneNumber(phone: string): boolean {
  // Supports formats: +254..., 254..., 07..., 01...
  const cleaned = phone.replace(/\s+/g, "");
  const regex = /^(\+?254|0)[17]\d{8}$/;
  return regex.test(cleaned);
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "");

  // Convert to international format
  if (cleaned.startsWith("0")) {
    return `+254${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith("254")) {
    return `+${cleaned}`;
  }

  return cleaned;
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Calculate tax amount
 */
export function calculateTax(amount: number, taxRate: number): number {
  return (amount * taxRate) / 100;
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(
  amount: number,
  discountRate: number,
): number {
  return (amount * discountRate) / 100;
}

/**
 * Round to decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Check if date is overdue
 */
export function isOverdue(dueDate: Date | string): boolean {
  const date = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  return isValid(date) && date < new Date();
}

/**
 * Get days until/since date
 */
export function getDaysUntil(date: Date | string): number {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) return 0;

  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Format number with thousands separator
 * @param value - The number to format
 * @param decimals - Number of decimal places to display (default: 0)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals: number = 0): string {
  if (isNaN(value)) return '0';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Get invoice status color
 */
export function getInvoiceStatusColor(
  status: string,
): "success" | "warning" | "danger" | "neutral" {
  switch (status.toLowerCase()) {
    case "paid":
      return "success";
    case "partially_paid":
    case "sent":
      return "warning";
    case "overdue":
    case "void":
      return "danger";
    default:
      return "neutral";
  }
}

/**
 * Get payment method display name
 */
export function getPaymentMethodName(method: string): string {
  const names: Record<string, string> = {
    CASH: "Cash",
    BANK_TRANSFER: "Bank Transfer",
    CHEQUE: "Cheque",
    MPESA: "M-Pesa",
    CARD: "Card",
    OTHER_MOBILE_MONEY: "Mobile Money",
  };

  return names[method] || method;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Generate reference number
 */
export function generateReference(prefix: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Calculate subtotal for items
 */
export function calculateSubtotal(
  items: Array<{ quantity: number; unitPrice?: number; unitCost?: number }>,
): number {
  return items.reduce(
    (total, item) => total + item.quantity * (item.unitPrice ?? item.unitCost ?? 0),
    0,
  );
}

/**
 * Storage utilities for offline support
 */
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },

  clear: (): void => {
    if (typeof window === "undefined") return;

    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};

/**
 * Download data as CSV file
 */
export function downloadAsCSV<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export'
): void {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle strings with commas by wrapping in quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Get status color for badges
 */
export function getStatusColor(
  status: string
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (status.toUpperCase()) {
    case 'PAID':
    case 'APPROVED':
    case 'COMPLETED':
      return 'success';
    case 'PENDING':
    case 'SENT':
    case 'DRAFT':
      return 'warning';
    case 'OVERDUE':
    case 'VOID':
    case 'CANCELLED':
    case 'FAILED':
      return 'danger';
    case 'INFO':
      return 'info';
    default:
      return 'neutral';
  }
}
