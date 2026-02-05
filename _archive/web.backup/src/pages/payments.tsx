"use client";

import React, { useState } from "react";
import { DollarSign, Plus, Search, Eye, Filter, Download } from "lucide-react";
import { PaymentForm } from "@/components/forms/PaymentForm";
import { usePayments, useInvoices } from "@/hooks/useApi";
import { cn } from "@/utils/cn";

interface EnrichedPayment {
  id: string;
  invoiceId?: string;
  amount: number;
  paymentMethod: "cash" | "mpesa" | "bank" | "check" | "other";
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  invoice?: {
    invoiceNumber: string;
    customerName: string;
  };
}

const PaymentsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");

  const { payments, isLoading, createPayment } = usePayments();
  const { invoices } = useInvoices();

  // Enrich payments with invoice data
  const enrichedPayments: EnrichedPayment[] = payments.map((payment) => ({
    ...payment,
    invoice: payment.invoiceId
      ? invoices.find((inv) => inv.id === payment.invoiceId)
      : undefined,
  }));

  // Filter payments
  const filteredPayments = enrichedPayments.filter((payment) => {
    const matchesSearch =
      (payment.invoice?.invoiceNumber &&
        payment.invoice.invoiceNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (payment.invoice?.customerName &&
        payment.invoice.customerName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (payment.referenceNumber &&
        payment.referenceNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesMethod =
      filterMethod === "all" || payment.paymentMethod === filterMethod;

    let matchesDateRange = true;
    if (filterDateRange !== "all") {
      const paymentDate = new Date(payment.paymentDate);
      const today = new Date();

      switch (filterDateRange) {
        case "today":
          matchesDateRange =
            paymentDate.toDateString() === today.toDateString();
          break;
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDateRange = paymentDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDateRange = paymentDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesMethod && matchesDateRange;
  });

  const handleCreatePayment = async (paymentData: any) => {
    try {
      await createPayment(paymentData);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return "💵";
      case "mpesa":
        return "📱";
      case "bank":
        return "🏦";
      case "check":
        return "📄";
      default:
        return "💳";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">
            Record and track all payment transactions
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="mpesa">M-Pesa</option>
            <option value="bank">Bank Transfer</option>
            <option value="check">Check</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Payments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredPayments.length}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  filteredPayments.reduce(
                    (sum, payment) => sum + payment.amount,
                    0,
                  ),
                )}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Average Payment
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  filteredPayments.length > 0
                    ? filteredPayments.reduce(
                        (sum, payment) => sum + payment.amount,
                        0,
                      ) / filteredPayments.length
                    : 0,
                )}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                M-Pesa Payments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  filteredPayments.filter((p) => p.paymentMethod === "mpesa")
                    .length
                }
              </p>
            </div>
            <div className="text-2xl">📱</div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No payments found</p>
            <p className="text-sm">Record your first payment to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getPaymentMethodLabel(payment.paymentMethod)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {payment.id.slice(-8)}
                          </div>
                          {payment.notes && (
                            <div className="text-xs text-gray-500 max-w-xs truncate mt-1">
                              {payment.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {getPaymentMethodLabel(payment.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.invoice ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {payment.invoice.invoiceNumber}
                          </div>
                          <div className="text-gray-500">
                            {payment.invoice.customerName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">General Payment</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.referenceNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Download Receipt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowForm(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <PaymentForm
                availableInvoices={invoices
                  .map((inv) => ({
                    ...inv,
                    paidAmount: inv.paidAmount || 0,
                    balanceAmount: inv.totalAmount - (inv.paidAmount || 0),
                  }))
                  .filter((inv) => inv.balanceAmount > 0)}
                onSubmit={handleCreatePayment}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
