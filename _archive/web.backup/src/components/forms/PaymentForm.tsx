import React, { useState, useEffect } from "react";
import {
  DollarSign,
  FileText,
  Calendar,
  CreditCard,
  Eye,
  Save,
  X,
} from "lucide-react";

interface PaymentData {
  invoiceId?: string;
  amount: string;
  paymentMethod: "cash" | "mpesa" | "bank" | "check" | "other";
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: "unpaid" | "partial" | "paid";
}

interface LedgerEntry {
  account: string;
  debit: string;
  credit: string;
  description: string;
}

interface PaymentFormProps {
  onSubmit?: (data: PaymentData & { ledgerPreview: LedgerEntry[] }) => void;
  onCancel?: () => void;
  initialData?: Partial<PaymentData>;
  linkedInvoice?: Invoice;
  availableInvoices?: Invoice[];
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  linkedInvoice,
  availableInvoices = [],
}) => {
  const [formData, setFormData] = useState<PaymentData>({
    invoiceId: linkedInvoice?.id || initialData.invoiceId || "",
    amount:
      initialData.amount || linkedInvoice?.balanceAmount?.toString() || "0",
    paymentMethod: initialData.paymentMethod || "cash",
    referenceNumber: initialData.referenceNumber || "",
    paymentDate:
      initialData.paymentDate || new Date().toISOString().split("T")[0],
    notes: initialData.notes || "",
  });

  const [showLedgerPreview, setShowLedgerPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Nairobi commerce common payment methods
  const paymentMethods = [
    { value: "cash", label: "Cash", icon: "💵" },
    { value: "mpesa", label: "M-Pesa", icon: "📱" },
    { value: "bank", label: "Bank Transfer", icon: "🏦" },
    { value: "check", label: "Check", icon: "📄" },
    { value: "other", label: "Other", icon: "💳" },
  ];

  // Generate ledger preview for double-entry accounting
  const generateLedgerPreview = (): LedgerEntry[] => {
    const amount = parseFloat(formData.amount) || 0;
    if (amount === 0) return [];

    const selectedInvoice = availableInvoices.find(
      (inv) => inv.id === formData.invoiceId,
    );
    const customerName = selectedInvoice?.customerName || "Unknown Customer";

    return [
      {
        account:
          formData.paymentMethod === "cash"
            ? "Cash on Hand"
            : formData.paymentMethod === "mpesa"
              ? "M-Pesa Account"
              : formData.paymentMethod === "bank"
                ? "Bank Account"
                : formData.paymentMethod === "check"
                  ? "Checks Receivable"
                  : "Other Payment Methods",
        debit: `KES ${amount.toLocaleString()}`,
        credit: "",
        description: `Payment received${selectedInvoice ? ` for ${selectedInvoice.invoiceNumber}` : ""} from ${customerName}`,
      },
      {
        account: "Accounts Receivable",
        debit: "",
        credit: `KES ${amount.toLocaleString()}`,
        description: `Reduction of receivable${selectedInvoice ? ` for ${selectedInvoice.invoiceNumber}` : ""}`,
      },
    ];
  };

  const ledgerEntries = generateLedgerPreview();

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (linkedInvoice && formData.invoiceId === linkedInvoice.id) {
      const amount = parseFloat(formData.amount);
      const maxAmount = linkedInvoice.balanceAmount;
      if (amount > maxAmount) {
        newErrors.amount = `Amount cannot exceed balance of KES ${maxAmount.toLocaleString()}`;
      }
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = "Payment date is required";
    }

    if (
      (formData.paymentMethod === "mpesa" ||
        formData.paymentMethod === "bank") &&
      !formData.referenceNumber
    ) {
      newErrors.referenceNumber =
        "Reference number is required for this payment method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const submissionData = {
        ...formData,
        ledgerPreview: ledgerEntries,
      } as PaymentData & { ledgerPreview: LedgerEntry[] };

      if (onSubmit) {
        await onSubmit(submissionData);
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      setErrors({ submit: "Failed to save payment. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const selectedInvoice = availableInvoices.find(
    (inv) => inv.id === formData.invoiceId,
  );
  const currentInvoiceBalance = selectedInvoice?.balanceAmount || 0;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Record Payment
            </h2>
            {linkedInvoice && (
              <span className="text-sm text-gray-500">
                for {linkedInvoice.invoiceNumber}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowLedgerPreview(!showLedgerPreview)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
          >
            <Eye className="w-4 h-4" />
            {showLedgerPreview ? "Hide" : "Show"} Ledger Preview
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Payment Information */}
          <div className="space-y-6">
            {/* Invoice Selection */}
            {!linkedInvoice && availableInvoices.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Invoice Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Invoice (Optional)
                    </label>
                    <select
                      value={formData.invoiceId}
                      onChange={(e) =>
                        handleInputChange("invoiceId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">General Payment (no invoice)</option>
                      {availableInvoices
                        .filter((inv) => inv.balanceAmount > 0)
                        .map((invoice) => (
                          <option key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNumber} - {invoice.customerName} -
                            Balance: KES{" "}
                            {invoice.balanceAmount.toLocaleString()}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Details (if selected) */}
            {selectedInvoice && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  Invoice Details
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Invoice:</span>{" "}
                    {selectedInvoice.invoiceNumber}
                  </p>
                  <p>
                    <span className="font-medium">Customer:</span>{" "}
                    {selectedInvoice.customerName}
                  </p>
                  <p>
                    <span className="font-medium">Total Amount:</span> KES{" "}
                    {selectedInvoice.totalAmount.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Already Paid:</span> KES{" "}
                    {selectedInvoice.paidAmount.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Current Balance:</span> KES{" "}
                    {selectedInvoice.balanceAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Method
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() =>
                          handleInputChange(
                            "paymentMethod",
                            method.value as PaymentData["paymentMethod"],
                          )
                        }
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formData.paymentMethod === method.value
                            ? "border-purple-500 bg-purple-50 text-purple-900"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-lg mb-1">{method.icon}</div>
                        <div className="text-sm font-medium">
                          {method.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {(formData.paymentMethod === "mpesa" ||
                  formData.paymentMethod === "bank") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Number *
                    </label>
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) =>
                        handleInputChange("referenceNumber", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.referenceNumber
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder={
                        formData.paymentMethod === "mpesa"
                          ? "e.g., ABC123XYZ"
                          : "e.g., Bank Ref #12345"
                      }
                    />
                    {errors.referenceNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.referenceNumber}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Financial Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Financial Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Amount (KES) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        handleInputChange("amount", e.target.value)
                      }
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.amount ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                  {selectedInvoice && (
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum allowed: KES{" "}
                      {currentInvoiceBalance.toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) =>
                      handleInputChange("paymentDate", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.paymentDate ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.paymentDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.paymentDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Additional notes about this payment..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Preview */}
        {showLedgerPreview && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Ledger Preview
              </h3>
              <span className="text-sm text-gray-500">
                (Double-Entry Accounting)
              </span>
            </div>

            {ledgerEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Account
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Debit
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Credit
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ledgerEntries.map((entry, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {entry.account}
                        </td>
                        <td className="px-4 py-2 text-sm text-green-600 font-medium">
                          {entry.debit}
                        </td>
                        <td className="px-4 py-2 text-sm text-red-600 font-medium">
                          {entry.credit}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {entry.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Enter payment details to see ledger preview
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Saving..." : "Record Payment"}
          </button>
        </div>
      </form>
    </div>
  );
};
