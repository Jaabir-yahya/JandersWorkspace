"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
} from "lucide-react";
import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { PaymentForm } from "@/components/forms/PaymentForm";
import { useInvoices, usePayments } from "@/hooks/useApi";
import { cn } from "@/utils/cn";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: "unpaid" | "partial" | "paid";
  issueDate: string;
  dueDate: string;
}

const InvoicesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "unpaid" | "partial" | "paid"
  >("all");

  const { invoices, isLoading, createInvoice, updateInvoice, deleteInvoice } =
    useInvoices();
  const { createPayment } = usePayments();

  // Transform invoices data to match our interface
  const processedInvoices: Invoice[] = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customerName,
    totalAmount: inv.totalAmount,
    paidAmount: inv.paidAmount || 0,
    balanceAmount: inv.totalAmount - (inv.paidAmount || 0),
    paymentStatus: inv.paymentStatus,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
  }));

  // Filter invoices
  const filteredInvoices = processedInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || invoice.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = async (invoiceData: any) => {
    try {
      await createInvoice(invoiceData);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleRecordPayment = async (paymentData: any) => {
    try {
      await createPayment(paymentData);
      setShowPaymentForm(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error("Error recording payment:", error);
    }
  };

  const handleNewPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentForm(true);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "paid":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "partial":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "unpaid":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
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

  const getOverdueStatus = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">
            Manage customer invoices and payments
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Invoice
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
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partially Paid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No invoices found</p>
            <p className="text-sm">Create your first invoice to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
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
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div
                        className={cn(
                          "text-sm",
                          getOverdueStatus(invoice.dueDate) &&
                            invoice.paymentStatus !== "paid"
                            ? "text-red-600 font-medium"
                            : "text-gray-500",
                        )}
                      >
                        {formatDate(invoice.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span
                        className={cn(
                          invoice.balanceAmount > 0
                            ? "text-red-600"
                            : "text-green-600",
                        )}
                      >
                        {formatCurrency(invoice.balanceAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(invoice.paymentStatus)}>
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.balanceAmount > 0 && (
                          <button
                            onClick={() => handleNewPayment(invoice)}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                            title="Record Payment"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
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

      {/* Invoice Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowForm(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <InvoiceForm
                onSubmit={handleCreateInvoice}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => {
                setShowPaymentForm(false);
                setSelectedInvoice(null);
              }}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <PaymentForm
                linkedInvoice={selectedInvoice}
                availableInvoices={processedInvoices}
                onSubmit={handleRecordPayment}
                onCancel={() => {
                  setShowPaymentForm(false);
                  setSelectedInvoice(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
