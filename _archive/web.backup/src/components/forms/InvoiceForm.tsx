import React, { useState, useEffect } from "react";
import {
  FileText,
  DollarSign,
  Calendar,
  User,
  Eye,
  Save,
  X,
  Plus,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  totalAmount: string;
}

interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  totalAmount: string;
  notes?: string;
  paymentStatus: "unpaid" | "partial" | "paid";
  paidAmount?: string;
}

interface LedgerEntry {
  account: string;
  debit: string;
  credit: string;
  description: string;
}

interface InvoiceFormProps {
  onSubmit?: (data: InvoiceData & { ledgerPreview: LedgerEntry[] }) => void;
  onCancel?: () => void;
  initialData?: Partial<InvoiceData>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<InvoiceData>({
    invoiceNumber:
      initialData.invoiceNumber ||
      `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    customerName: initialData.customerName || "",
    customerEmail: initialData.customerEmail || "",
    customerPhone: initialData.customerPhone || "",
    issueDate: initialData.issueDate || new Date().toISOString().split("T")[0],
    dueDate:
      initialData.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    items: initialData.items || [
      {
        id: "1",
        description: "",
        quantity: "1",
        unitPrice: "0",
        totalAmount: "0",
      },
    ],
    subtotal: initialData.subtotal || "0",
    taxRate: initialData.taxRate || "16",
    taxAmount: initialData.taxAmount || "0",
    totalAmount: initialData.totalAmount || "0",
    notes: initialData.notes || "",
    paymentStatus: initialData.paymentStatus || "unpaid",
    paidAmount: initialData.paidAmount || "0",
  });

  const [showLedgerPreview, setShowLedgerPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Nairobi commerce common customers (can be fetched from backend)
  const commonCustomers = [
    "John Kamau - Kikuyu Shop",
    "Mary Wanjiru - Mama Ntilie",
    "James Muriuki - School Canteen",
    "Grace Nyokabi - Hotel Services",
    "Peter Njoroge - Retail Shop",
    "Esther Muthoni - Restaurant",
  ];

  // Calculate totals whenever items or tax rate changes
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => {
      return (
        sum +
        (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
      );
    }, 0);

    const taxAmount = (subtotal * (parseFloat(formData.taxRate) || 0)) / 100;
    const totalAmount = subtotal + taxAmount;

    setFormData((prev) => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    }));
  }, [formData.items, formData.taxRate]);

  // Generate ledger preview for double-entry accounting
  const generateLedgerPreview = (): LedgerEntry[] => {
    const amount = parseFloat(formData.totalAmount) || 0;
    if (amount === 0) return [];

    return [
      {
        account: "Accounts Receivable",
        debit: `KES ${amount.toLocaleString()}`,
        credit: "",
        description: `Invoice ${formData.invoiceNumber} - ${formData.customerName}`,
      },
      {
        account: "Sales Revenue",
        debit: "",
        credit: `KES ${(amount / 1.16).toFixed(2).toLocaleString()}`,
        description: "Revenue from sale",
      },
      {
        account: "VAT/Sales Tax",
        debit: "",
        credit: `KES ${((amount / 1.16) * 0.16).toFixed(2).toLocaleString()}`,
        description: "VAT collected",
      },
    ];
  };

  const ledgerEntries = generateLedgerPreview();

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      description: "",
      quantity: "1",
      unitPrice: "0",
      totalAmount: "0",
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (id: string) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Calculate total amount if quantity or unit price changes
          if (field === "quantity" || field === "unitPrice") {
            const quantity = parseFloat(updatedItem.quantity) || 0;
            const unitPrice = parseFloat(updatedItem.unitPrice) || 0;
            updatedItem.totalAmount = (quantity * unitPrice).toFixed(2);
          }

          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }
    if (!formData.issueDate) {
      newErrors.issueDate = "Issue date is required";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    // Check if all items have description and positive prices
    const invalidItems = formData.items.filter(
      (item) => !item.description.trim() || parseFloat(item.unitPrice) <= 0,
    );

    if (invalidItems.length > 0) {
      newErrors.items = "All items must have description and positive price";
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
      } as InvoiceData & { ledgerPreview: LedgerEntry[] };

      if (onSubmit) {
        await onSubmit(submissionData);
      }
    } catch (error) {
      console.error("Error submitting invoice:", error);
      setErrors({ submit: "Failed to save invoice. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Create Invoice
            </h2>
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
        {/* Invoice Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerName: e.target.value,
                  }))
                }
                list="customers"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.customerName ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter customer name..."
              />
              <datalist id="customers">
                {commonCustomers.map((customer) => (
                  <option key={customer} value={customer} />
                ))}
              </datalist>
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customerName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Email (Optional)
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerEmail: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="customer@email.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerPhone: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+254 7XX XXX XXX"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        issueDate: e.target.value,
                      }))
                    }
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.issueDate ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.issueDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.issueDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.dueDate ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Unit Price (KES)
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Total (KES)
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Item description"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(item.id, "unitPrice", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.totalAmount}
                        readOnly
                        className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded text-gray-900 font-medium"
                      />
                    </td>
                    <td className="px-4 py-2">
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {errors.items && (
            <p className="mt-2 text-sm text-red-600">{errors.items}</p>
          )}
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes about this invoice..."
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taxRate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentStatus: e.target.value as
                        | "unpaid"
                        | "partial"
                        | "paid",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium text-gray-900">
                  KES {parseFloat(formData.subtotal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Tax ({formData.taxRate}%):
                </span>
                <span className="text-sm font-medium text-gray-900">
                  KES {parseFloat(formData.taxAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-base font-semibold text-gray-900">
                  Total:
                </span>
                <span className="text-base font-bold text-gray-900">
                  KES {parseFloat(formData.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Preview */}
        {showLedgerPreview && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                Add items and pricing to see ledger preview
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
};
