import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings,
  AlertCircle,
  Clock,
  MoreVertical,
} from "lucide-react";
import { useIntegrationsStore } from "../../store";
import type {
  Integration,
  IntegrationStatus,
  IntegrationType,
} from "../../types";

const integrationTypeLabels: Record<IntegrationType, string> = {
  mpesa: "M-Pesa",
  whatsapp: "WhatsApp",
  quickbooks: "QuickBooks",
  sage: "Sage",
  wave: "Wave",
  custom: "Custom",
};

const integrationDescriptions: Record<IntegrationType, string> = {
  mpesa: "Accept M-Pesa payments and sync transactions automatically",
  whatsapp: "Send notifications and reminders via WhatsApp",
  quickbooks: "Sync with QuickBooks accounting software",
  sage: "Integrate with Sage business management",
  wave: "Connect to Wave financial services",
  custom: "Custom API integration",
};

interface IntegrationCardProps {
  integration: Integration;
}

function StatusBadge({ status }: { status: IntegrationStatus }) {
  const styles = {
    connected: "bg-green-100 text-green-800",
    disconnected: "bg-gray-100 text-gray-800",
    error: "bg-red-100 text-red-800",
    syncing: "bg-blue-100 text-blue-800",
  };

  const icons = {
    connected: <CheckCircle2 className="w-3 h-3" />,
    disconnected: <XCircle className="w-3 h-3" />,
    error: <AlertCircle className="w-3 h-3" />,
    syncing: <RefreshCw className="w-3 h-3 animate-spin" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}
    >
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const { syncIntegration, testIntegration, updateIntegration } =
    useIntegrationsStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleConnect = async () => {
    if (integration.status === "connected") {
      updateIntegration(integration.id, { status: "disconnected" });
    } else {
      updateIntegration(integration.id, { status: "syncing" });
      await syncIntegration(integration.id);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    const success = await testIntegration(integration.id);
    setIsTesting(false);
    if (!success) {
      alert("Connection test failed. Please check your settings.");
    }
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              integration.status === "connected"
                ? "bg-green-100 text-green-600"
                : integration.status === "error"
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            {integration.type === "mpesa" ? (
              <span className="text-lg font-bold">M</span>
            ) : integration.type === "whatsapp" ? (
              <span className="text-lg font-bold">W</span>
            ) : (
              <Settings className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {integrationTypeLabels[integration.type]}
            </h3>
            <StatusBadge status={integration.status} />
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleTest();
                }}
                disabled={isTesting}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
              >
                {isTesting ? "Testing..." : "Test Connection"}
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  console.log("Configure", integration.id);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                Configure
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleConnect();
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                {integration.status === "connected" ? "Disconnect" : "Connect"}
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {integrationDescriptions[integration.type]}
      </p>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>Last sync: {formatLastSync(integration.lastSyncAt)}</span>
        </div>
        {integration.lastSyncStatus && (
          <div
            className={`flex items-center gap-1.5 ${
              integration.lastSyncStatus === "success"
                ? "text-green-600"
                : integration.lastSyncStatus === "error"
                  ? "text-red-600"
                  : "text-yellow-600"
            }`}
          >
            {integration.lastSyncStatus === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : integration.lastSyncStatus === "error" ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>
              {integration.lastSyncStatus === "success"
                ? "Success"
                : integration.lastSyncStatus === "error"
                  ? "Failed"
                  : "Partial"}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleConnect}
          disabled={integration.status === "syncing"}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            integration.status === "connected"
              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {integration.status === "syncing"
            ? "Connecting..."
            : integration.status === "connected"
              ? "Disconnect"
              : "Connect"}
        </button>
        <button
          onClick={() => console.log("Configure", integration.id)}
          className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
        >
          Configure
        </button>
      </div>

      {integration.lastError && integration.status === "error" && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {integration.lastError}
          </p>
        </div>
      )}
    </div>
  );
}
