"use client";

import React from "react";
import {
  DashboardKPICards,
  DashboardQuickActions,
  DashboardPendingTasks,
} from "../components/dashboard/DashboardComponents";
import { useAuthStore } from "../hooks/useAuth";
import { useRouter } from "next/navigation";

interface RecentTransaction {
  id: string;
  type: "supply" | "invoice" | "payment";
  description: string;
  amount: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const router = useRouter();

  // Mock recent transactions - replace with real API calls
  const recentTransactions: RecentTransaction[] = [
    {
      id: "1",
      type: "supply",
      description: "Sugar packets from Supplier XYZ",
      amount: "KES 12,000",
      date: "2024-02-03",
      status: "completed",
    },
    {
      id: "2",
      type: "invoice",
      description: "Invoice INV-2024-001 to Customer ABC",
      amount: "KES 15,000",
      date: "2024-02-02",
      status: "pending",
    },
    {
      id: "3",
      type: "payment",
      description: "Payment for INV-2024-001",
      amount: "KES 15,000",
      date: "2024-02-01",
      status: "completed",
    },
    {
      id: "4",
      type: "supply",
      description: "Flour bags from Supplier ABC",
      amount: "KES 8,500",
      date: "2024-01-31",
      status: "completed",
    },
  ];

  const handleAddSupply = () => {
    router.push("/supplies");
  };

  const handleAddInvoice = () => {
    router.push("/invoices");
  };

  const handleAddPayment = () => {
    router.push("/payments");
  };

  const onViewReports = () => {
    router.push("/reports");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "supply":
        return "📦";
      case "invoice":
        return "🧾";
      case "payment":
        return "💰";
      default:
        return "📄";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isAdmin ? "Admin Dashboard" : "Dashboard"}
              </h1>
              <p className="text-sm text-gray-500">
                Welcome back, {user?.name}. Here's what's happening with your
                business today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Export Data
              </button>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="mb-8">
          <DashboardKPICards isAdmin={isAdmin} />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <DashboardQuickActions
            onAddSupply={handleAddSupply}
            onAddInvoice={handleAddInvoice}
            onAddPayment={handleAddPayment}
            onViewReports={onViewReports}
            isAdmin={isAdmin}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Transactions
                </h3>
                <button
                  onClick={() => router.push("/transactions")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          router.push(`/transactions/${transaction.id}`)
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <span>{getTypeIcon(transaction.type)}</span>
                            <span className="capitalize">
                              {transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              transaction.status,
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="lg:col-span-1">
            <DashboardPendingTasks isAdmin={isAdmin} />
          </div>
        </div>

        {/* Admin-only features */}
        {isAdmin && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Admin Quick Stats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-gray-500">Active Tenants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1,247</div>
                  <div className="text-sm text-gray-500">
                    Total Transactions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    99.8%
                  </div>
                  <div className="text-sm text-gray-500">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
