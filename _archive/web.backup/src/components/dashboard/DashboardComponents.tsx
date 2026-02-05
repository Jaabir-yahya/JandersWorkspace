"use client";

import React from "react";
import {
  DollarSign,
  Package,
  FileText,
  AlertCircle,
  TrendingUp,
  Users,
} from "lucide-react";

interface KPICard {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

interface DashboardKPICardsProps {
  isAdmin?: boolean;
}

export const DashboardKPICards: React.FC<DashboardKPICardsProps> = ({
  isAdmin = false,
}) => {
  // Mock data - replace with real API calls
  const kpiCards: KPICard[] = [
    {
      title: "Total Balance",
      value: "KES 245,680",
      change: "+12.5%",
      icon: <DollarSign className="w-5 h-5" />,
      color: "bg-blue-500",
    },
    {
      title: "COGS",
      value: "KES 89,420",
      change: "-5.2%",
      icon: <Package className="w-5 h-5" />,
      color: "bg-green-500",
    },
    {
      title: "Supplier Payables",
      value: "KES 34,200",
      change: "+2.1%",
      icon: <FileText className="w-5 h-5" />,
      color: "bg-orange-500",
    },
    {
      title: "Cash Balance",
      value: "KES 122,060",
      change: "+8.7%",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-purple-500",
    },
    ...(isAdmin
      ? [
          {
            title: "Active Tenants",
            value: "24",
            change: "+3",
            icon: <Users className="w-5 h-5" />,
            color: "bg-indigo-500",
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {kpiCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div className={`${card.color} text-white p-3 rounded-lg`}>
              {card.icon}
            </div>
            {card.change && (
              <span
                className={`text-sm font-medium ${
                  card.change.startsWith("+")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {card.change}
              </span>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

interface QuickActionsProps {
  onAddSupply: () => void;
  onAddInvoice: () => void;
  onAddPayment: () => void;
  onViewReports: () => void;
  isAdmin?: boolean;
}

export const DashboardQuickActions: React.FC<QuickActionsProps> = ({
  onAddSupply,
  onAddInvoice,
  onAddPayment,
  onViewReports,
  isAdmin = false,
}) => {
  const quickActions: QuickAction[] = [
    {
      label: "Add Supply",
      icon: <Package className="w-5 h-5" />,
      onClick: onAddSupply,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      label: "Create Invoice",
      icon: <FileText className="w-5 h-5" />,
      onClick: onAddInvoice,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Record Payment",
      icon: <DollarSign className="w-5 h-5" />,
      onClick: onAddPayment,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      label: "View Reports",
      icon: <TrendingUp className="w-5 h-5" />,
      onClick: onViewReports,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    ...(isAdmin
      ? [
          {
            label: "Admin Panel",
            icon: <Users className="w-5 h-5" />,
            onClick: () => {},
            color: "bg-indigo-500 hover:bg-indigo-600",
          },
        ]
      : []),
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`${action.color} text-white px-4 py-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors duration-200`}
          >
            {action.icon}
            <span className="text-xs font-medium text-center">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

interface PendingTask {
  id: string;
  type: "unpaid" | "low_stock" | "overdue";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
}

interface PendingTasksProps {
  isAdmin?: boolean;
}

export const DashboardPendingTasks: React.FC<PendingTasksProps> = ({
  isAdmin = false,
}) => {
  // Mock data - replace with real API calls
  const pendingTasks: PendingTask[] = [
    {
      id: "1",
      type: "unpaid",
      title: "Unpaid Invoice INV-2024-001",
      description: "KES 15,000 from Customer ABC - 3 days overdue",
      priority: "high",
      createdAt: "2024-02-01",
    },
    {
      id: "2",
      type: "low_stock",
      title: "Low Inventory Alert",
      description: "Sugar packets running low (12 units remaining)",
      priority: "medium",
      createdAt: "2024-02-02",
    },
    {
      id: "3",
      type: "overdue",
      title: "Supplier Payment Due",
      description: "KES 8,500 to Supplier XYZ - due tomorrow",
      priority: "high",
      createdAt: "2024-02-03",
    },
    ...(isAdmin
      ? [
          {
            id: "4",
            type: "unpaid" as const,
            title: "New Tenant Registration",
            description: "3 new tenant applications pending approval",
            priority: "medium" as const,
            createdAt: "2024-02-03",
          },
        ]
      : []),
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "unpaid":
        return <DollarSign className="w-4 h-4" />;
      case "low_stock":
        return <Package className="w-4 h-4" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pending Tasks</h3>
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {pendingTasks.length} pending
        </span>
      </div>
      <div className="space-y-3">
        {pendingTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="mt-0.5">{getTaskIcon(task.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {task.title}
                </p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}
                >
                  {task.priority}
                </span>
              </div>
              <p className="text-sm text-gray-500">{task.description}</p>
              <p className="text-xs text-gray-400 mt-1">{task.createdAt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
