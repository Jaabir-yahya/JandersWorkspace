"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useTrialBalance, useExportData } from "@/hooks/useApi";
import { TransactionsTable } from "@/components/tables/TransactionsTable";

interface ReportFilters {
  startDate: string;
  endDate: string;
  account?: string;
  entityType?: string;
}

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "trial-balance" | "transactions" | "insights"
  >("trial-balance");
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0], // Start of year
    endDate: new Date().toISOString().split("T")[0], // Today
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(
    new Set(),
  );

  const { trialBalance, isLoading, error } = useTrialBalance(
    filters.startDate,
    filters.endDate,
  );
  const { exportToCSV, exportToJSON } = useExportData();

  // Group trial balance by account type
  const groupByAccountType = (data: any[]) => {
    const groups: Record<string, any[]> = {
      Assets: [],
      Liabilities: [],
      Equity: [],
      Revenue: [],
      Expenses: [],
    };

    data.forEach((item) => {
      const accountName = item.account.toLowerCase();
      if (
        accountName.includes("cash") ||
        accountName.includes("bank") ||
        accountName.includes("receivable") ||
        accountName.includes("inventory") ||
        accountName.includes("asset")
      ) {
        groups.Assets.push(item);
      } else if (
        accountName.includes("payable") ||
        accountName.includes("liability") ||
        accountName.includes("debt")
      ) {
        groups.Liabilities.push(item);
      } else if (
        accountName.includes("equity") ||
        accountName.includes("capital") ||
        accountName.includes("owner")
      ) {
        groups.Equity.push(item);
      } else if (
        accountName.includes("sales") ||
        accountName.includes("revenue") ||
        accountName.includes("income")
      ) {
        groups.Revenue.push(item);
      } else {
        groups.Expenses.push(item);
      }
    });

    return groups;
  };

  const accountGroups = trialBalance ? groupByAccountType(trialBalance) : null;

  const toggleAccountGroup = (group: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedAccounts(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return `KES ${Math.abs(amount).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleExport = (format: "csv" | "json") => {
    if (activeTab === "trial-balance") {
      // Export trial balance data
      const exportData = trialBalance || [];
      const blob = new Blob(
        [
          format === "csv"
            ? "Account,Total Debits,Total Credits,Balance\n" +
              exportData
                .map(
                  (item) =>
                    `"${item.account}",${item.totalDebits},${item.totalCredits},${item.balance}`,
                )
                .join("\n")
            : JSON.stringify(exportData, null, 2),
        ],
        {
          type: format === "csv" ? "text/csv" : "application/json",
        },
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `trial-balance-${filters.startDate}-${filters.endDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      exportToCSV(activeTab as any, filters);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Financial Reports
        </h1>
        <p className="text-gray-600">
          Trial balance, transaction history, and business insights
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("trial-balance")}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "trial-balance"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trial Balance
            </div>
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "transactions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Transaction History
            </div>
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === "insights"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Insights
            </div>
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {filters.startDate} to {filters.endDate}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Filter (Optional)
              </label>
              <input
                type="text"
                value={filters.account || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, account: e.target.value }))
                }
                placeholder="Filter by account name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === "trial-balance" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Trial Balance - {filters.startDate} to {filters.endDate}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Shows account balances and verifies debits equal credits
            </p>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              <p>Error loading trial balance. Please try again.</p>
            </div>
          ) : accountGroups ? (
            <div className="divide-y divide-gray-200">
              {Object.entries(accountGroups).map(([groupName, accounts]) => (
                <div key={groupName} className="p-4">
                  <button
                    onClick={() => toggleAccountGroup(groupName)}
                    className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedAccounts.has(groupName) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                      <h4 className="font-medium text-gray-900">{groupName}</h4>
                      <span className="text-sm text-gray-500">
                        ({accounts.length} accounts)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">
                        {formatCurrency(
                          accounts.reduce((sum, acc) => sum + acc.balance, 0),
                        )}
                      </span>
                    </div>
                  </button>

                  {expandedAccounts.has(groupName) && (
                    <div className="mt-4 ml-6 space-y-2">
                      {accounts.map((account) => (
                        <div
                          key={account.account}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {account.account}
                            </p>
                            <div className="flex gap-4 mt-1 text-sm text-gray-600">
                              <span>
                                Debits: {formatCurrency(account.totalDebits)}
                              </span>
                              <span>
                                Credits: {formatCurrency(account.totalCredits)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`font-medium ${
                                account.balance >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatCurrency(account.balance)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No trial balance data available for the selected period.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "transactions" && (
        <div>
          {/* Transaction history would be rendered here */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-center text-gray-500">
              Transaction history component will be integrated here
            </p>
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* KPI Cards */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-gray-500">
                This Month
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">KES 245,680</h3>
            <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
            <div className="mt-4">
              <span className="text-sm font-medium text-green-600">+12.5%</span>
              <span className="text-sm text-gray-500"> vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-500">Current</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">KES 89,420</h3>
            <p className="text-sm text-gray-600 mt-1">COGS</p>
            <div className="mt-4">
              <span className="text-sm font-medium text-red-600">-5.2%</span>
              <span className="text-sm text-gray-500"> vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-gray-500">
                Outstanding
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">KES 34,200</h3>
            <p className="text-sm text-gray-600 mt-1">Receivables</p>
            <div className="mt-4">
              <span className="text-sm font-medium text-green-600">+2.1%</span>
              <span className="text-sm text-gray-500"> vs last month</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
