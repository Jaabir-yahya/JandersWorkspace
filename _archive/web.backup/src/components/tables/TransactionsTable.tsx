import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  FileText,
  Package,
  DollarSign,
  Eye,
} from "lucide-react";
import { cn } from "@/utils/cn";

export interface Transaction {
  id: string;
  type: "supply" | "invoice" | "payment";
  description: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  entity?: {
    customerName?: string;
    supplier?: string;
    invoiceNumber?: string;
  };
}

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onViewDetails?: (transaction: Transaction) => void;
  onExport?: (format: "csv" | "json") => void;
  className?: string;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  isLoading = false,
  onViewDetails,
  onExport,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterType, setFilterType] = useState<
    "all" | "supply" | "invoice" | "payment"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "pending" | "failed"
  >("all");

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.entity?.customerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      "" ||
      transaction.entity?.supplier
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      "" ||
      transaction.entity?.invoiceNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      "";

    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesStatus =
      filterStatus === "all" || transaction.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "supply":
        return <Package className="w-4 h-4 text-green-600" />;
      case "invoice":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "payment":
        return <DollarSign className="w-4 h-4 text-purple-600" />;
    }
  };

  const getStatusBadge = (status: Transaction["status"]) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  const formatAmount = (amount: number) => {
    return `KES ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-white rounded-lg shadow-sm border border-gray-200",
          className,
        )}
      >
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200",
        className,
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Transactions
          </h3>
          <div className="flex items-center gap-2">
            {onExport && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onExport("csv")}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Export as CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onExport("json")}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Export as JSON"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="supply">Supplies</option>
              <option value="invoice">Invoices</option>
              <option value="payment">Payments</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {paginatedTransactions.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          {filteredTransactions.length === 0 ? (
            <div>
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <p>No transactions on this page</p>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(transaction.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {transaction.id}
                          </p>
                          {transaction.entity?.invoiceNumber && (
                            <p className="text-xs text-blue-600">
                              {transaction.entity.invoiceNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {formatAmount(transaction.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(transaction.status)}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {onViewDetails && (
                        <button
                          onClick={() => onViewDetails(transaction)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(
                    startIndex + itemsPerPage,
                    filteredTransactions.length,
                  )}{" "}
                  of {filteredTransactions.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      const isCurrentPage = page === currentPage;
                      const isNearCurrent =
                        Math.abs(page - currentPage) <= 2 ||
                        page === 1 ||
                        page === totalPages;

                      if (!isNearCurrent && i > 0 && i < totalPages - 1) {
                        return (
                          <span key={i} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }

                      if (!isNearCurrent) return null;

                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "w-8 h-8 text-sm font-medium rounded-lg transition-colors",
                            isCurrentPage
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                          )}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
