import { useState } from "react";
import {
  MessageCircle,
  Send,
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  MessageSquare,
  ArrowRight,
  Plus,
  LayoutTemplate,
} from "lucide-react";
import { FeatureGate } from "../tenant/FeatureGate";

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: "transaction" | "reminder" | "marketing" | "support";
  usageCount: number;
}

interface RecentMessage {
  id: string;
  phoneNumber: string;
  name: string;
  content: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read" | "failed";
  direction: "incoming" | "outgoing";
}

const mockTemplates: MessageTemplate[] = [
  {
    id: "1",
    name: "Payment Confirmation",
    content:
      "Thank you for your payment of KES {amount}. Your transaction reference is {reference}.",
    category: "transaction",
    usageCount: 145,
  },
  {
    id: "2",
    name: "Credit Reminder",
    content:
      "Hi {name}, this is a friendly reminder that you have an outstanding balance of KES {amount} due on {dueDate}.",
    category: "reminder",
    usageCount: 89,
  },
  {
    id: "3",
    name: "Welcome Message",
    content:
      "Welcome to {businessName}! Thank you for choosing us. Reply STOP to unsubscribe.",
    category: "marketing",
    usageCount: 234,
  },
];

const mockMessages: RecentMessage[] = [
  {
    id: "1",
    phoneNumber: "+254712345678",
    name: "John Doe",
    content: "Thank you for the receipt. When will my order be ready?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: "read",
    direction: "incoming",
  },
  {
    id: "2",
    phoneNumber: "+254712345678",
    name: "John Doe",
    content: "Your order will be ready for pickup tomorrow at 10 AM.",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    status: "delivered",
    direction: "outgoing",
  },
  {
    id: "3",
    phoneNumber: "+254723456789",
    name: "Jane Smith",
    content: "Can I get a discount on my next purchase?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    status: "read",
    direction: "incoming",
  },
];

export function WhatsAppDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus] = useState<"connected" | "disconnected" | "error">(
    "connected",
  );
  const [activeTab, setActiveTab] = useState<"messages" | "templates">(
    "messages",
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "read":
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case "delivered":
        return <CheckCircle2 className="w-4 h-4 text-gray-400" />;
      case "sent":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <FeatureGate
      feature="whatsapp_integration"
      fallback={
        <div className="p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">
                WhatsApp Integration Not Enabled
              </span>
            </div>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              This feature is not available on your current plan. Please upgrade
              to access WhatsApp Business integration.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-700 dark:text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">WhatsApp Business</h2>
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
              title="Refresh messages"
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Messages
              </span>
              <MessageSquare className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold mt-2">1,234</p>
            <p className="text-sm text-muted-foreground mt-1">
              +45 from yesterday
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Active Chats
              </span>
              <Users className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-2">89</p>
            <p className="text-sm text-green-600 mt-1">+12 new today</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Delivery Rate
              </span>
              <Send className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold mt-2">98.5%</p>
            <p className="text-sm text-muted-foreground mt-1">
              23 failed messages
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Templates Used
              </span>
              <LayoutTemplate className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold mt-2">456</p>
            <p className="text-sm text-muted-foreground mt-1">
              12 templates active
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "messages"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Recent Messages
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "templates"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Message Templates
            </button>
          </div>

          {activeTab === "messages" ? (
            <div className="divide-y divide-border">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.direction === "incoming"
                          ? "bg-blue-500/20 text-blue-600"
                          : "bg-green-500/20 text-green-600"
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{message.name}</p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(message.status)}
                          <span className="text-sm text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {message.phoneNumber}
                      </p>
                      <p className="mt-1 text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {mockTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{template.name}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            template.category === "transaction"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : template.category === "reminder"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : template.category === "marketing"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {template.category}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {template.content}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Used {template.usageCount} times
                      </p>
                    </div>
                    <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="p-4">
                <button className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Plus className="w-4 h-4" />
                  Create new template
                </button>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-border">
            <button className="flex items-center gap-2 text-sm text-primary hover:underline">
              View all {activeTab === "messages" ? "messages" : "templates"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">WhatsApp Business API Config</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Phone Number ID:</span>
              <span className="ml-2 font-mono">123456789012345</span>
            </div>
            <div>
              <span className="text-muted-foreground">
                Business Account ID:
              </span>
              <span className="ml-2 font-mono">987654321098765</span>
            </div>
            <div>
              <span className="text-muted-foreground">Environment:</span>
              <span className="ml-2 text-green-600">Production</span>
            </div>
            <div>
              <span className="text-muted-foreground">Webhook URL:</span>
              <span className="ml-2 font-mono text-xs">
                https://api.bridge.app/webhooks/whatsapp
              </span>
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
