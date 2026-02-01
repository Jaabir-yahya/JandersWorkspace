import { useState } from "react";
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { FeatureGate } from "../tenant/FeatureGate";

interface Transaction {
  id: string;
  type: "incoming" | "outgoing";
  amount: number;
  phoneNumber: string;
  name: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  reference: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "incoming",
    amount: 15000,
    phoneNumber: "+254712345678",
    name: "John Doe",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: "completed",
    reference: "MPESA123456",
  },
  {
    id: "2",
    type: "incoming",
    amount: 8500,
    phoneNumber: "+254723456789",
    name: "Jane Smith",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: "completed",
    reference: "MPESA123457",
  },
  {
    id: "3",
    type: "outgoing",
    amount: 5000,
    phoneNumber: "+254734567890",
    name: "Supplier A",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    status: "completed",
    reference: "MPESA123458",
  },
];

export function MpesaDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus] = useState<"connected" | "disconnected" | "error">(
    "connected",
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === "incoming" ? "+" : "-";
    return `${prefix}KES ${amount.toLocaleString()}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <FeatureGate
      feature="mpesa_integration"
      fallback={
        <div className="p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">
                M-Pesa Integration Not Enabled
              </span>
            </div>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              This feature is not available on your current plan. Please upgrade
              to access M-Pesa integration.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">M-Pesa Integration</h2>
              <div className="flex items-center gap-2">
                {connectionStatus === "connected" ? (
                  <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Connected
                  </span>
                ) : connectionStatus === "error" ? (
                  <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    Error
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    Disconnected
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh transactions"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              <Settings className="w-4 h-4" />
              Configure
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Today's Incoming
              </span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-2">KES 45,250</p>
            <p className="text-sm text-green-600 mt-1">+12% from yesterday</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Today's Outgoing
              </span>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold mt-2">KES 12,500</p>
            <p className="text-sm text-red-600 mt-1">+5% from yesterday</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Net Balance</span>
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold mt-2">KES 32,750</p>
            <p className="text-sm text-muted-foreground mt-1">
              23 transactions today
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-border">
            {mockTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === "incoming"
                        ? "bg-green-500/20 text-green-600"
                        : "bg-red-500/20 text-red-600"
                    }`}
                  >
                    {transaction.type === "incoming" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.phoneNumber} • {transaction.reference}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-medium ${
                      transaction.type === "incoming"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatAmount(transaction.amount, transaction.type)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(transaction.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <button className="flex items-center gap-2 text-sm text-primary hover:underline">
              View all transactions
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Configuration</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Shortcode:</span>
              <span className="ml-2 font-mono">123456</span>
            </div>
            <div>
              <span className="text-muted-foreground">Passkey:</span>
              <span className="ml-2 font-mono">••••••••</span>
            </div>
            <div>
              <span className="text-muted-foreground">Environment:</span>
              <span className="ml-2 text-green-600">Production</span>
            </div>
            <div>
              <span className="text-muted-foreground">Callback URL:</span>
              <span className="ml-2 font-mono text-xs">
                https://api.bridge.app/webhooks/mpesa
              </span>
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
