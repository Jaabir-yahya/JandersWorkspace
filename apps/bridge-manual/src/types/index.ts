// Shared types for Project Bridge Manual Frontend
export interface Transaction {
  id: string;
  type: "sale" | "expense" | "purchase";
  amount: number;
  description: string;
  currency: string;
  method: "cash" | "mpesa" | "bank";
  timestamp: Date;
  voiceNote?: string;
  receiptImage?: string;
  customer?: string;
  category?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalPurchases: number;
  lastTransaction?: Date;
  preferredCurrency: "KES" | "UGX" | "TZS" | "NGN";
}

export interface VoiceRecording {
  isRecording: boolean;
  transcript: string;
  confidence: number;
  duration: number;
}

export interface ReceiptData {
  amount: number;
  vendor: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  date: Date;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalExpenses: number;
  transactionCount: number;
  topCategories: string[];
  currency: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
