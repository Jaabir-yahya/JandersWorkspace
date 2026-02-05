import React, { useState, useEffect } from "react";
import { Package, DollarSign, FileText, Eye, Save, X } from "lucide-react";

interface SupplyItem {
  itemName: string;
  quantity: string;
  unitPrice: string;
  totalAmount: string;
  supplier: string;
  category: string;
  batchNumber?: string;
  notes?: string;
}

interface LedgerEntry {
  account: string;
  debit: string;
  credit: string;
  description: string;
}

interface SupplyFormProps {
  onSubmit?: (data: SupplyItem & { ledgerPreview: LedgerEntry[] }) => void;
  onCancel?: () => void;
  initialData?: Partial<SupplyItem>;
}

export const SupplyForm: React.FC<SupplyFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<SupplyItem>({
    itemName: initialData.itemName || "",
    quantity: initialData.quantity || "",
    unitPrice: initialData.unitPrice || "",
    totalAmount: initialData.totalAmount || "",
    supplier: initialData.supplier || "",
    category: initialData.category || "",
    batchNumber: initialData.batchNumber || "",
    notes: initialData.notes || "",
  });

  const [showLedgerPreview, setShowLedgerPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Nairobi commerce common categories
  const commonCategories = [
    "Food Items",
    "Beverages",
    "Packaging",
    "Cleaning Supplies",
    "Office Supplies",
    "Equipment",
    "Raw Materials",
    "Other",
  ];

  // Common suppliers (can be fetched from backend)
  const commonSuppliers = [
    "Nairobi Wholesale Ltd",
    "East Africa Suppliers",
    "Kenyatta Market Vendors",
    "City Market Traders",
    "Industrial Area Distributors",
    "Mombasa Port Imports",
  ];

  // Calculate total amount when quantity or unit price changes
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const total = (quantity * unitPrice).toFixed(2);

    if (quantity > 0 && unitPrice > 0) {
      setFormData((prev) => ({
        ...prev,
        totalAmount: total,
      }));
    }
  }, [formData.quantity, formData.unitPrice]);

  // Generate ledger preview for double-entry accounting
  const generateLedgerPreview = (): LedgerEntry[] => {
    const amount = parseFloat(formData.totalAmount) || 0;
    if (amount === 0) return [];

    return [
      {
        account: "Inventory/Stock",
        debit: `KES ${amount.toLocaleString()}`,
        credit: "",
        description: `${formData.quantity} ${formData.itemName} from ${formData.supplier}`,
      },
      {
        account: "GST/VAT Input (if applicable)",
        debit: `KES ${(amount * 0.16).toFixed(2)}`,
        credit: "",
        description: "Input tax on purchase",
      },
      {
        account: "Accounts Payable",
        debit: "",
        credit: `KES ${amount.toLocaleString()}`,
        description: `Owed to ${formData.supplier}`,
      },
    ];
  };

  const ledgerEntries = generateLedgerPreview();

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = "Item name is required";
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = "Unit price must be greater than 0";
    }
    if (!formData.supplier.trim()) {
      newErrors.supplier = "Supplier is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
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
      } as SupplyItem & { ledgerPreview: LedgerEntry[] };

      if (onSubmit) {
        await onSubmit(submissionData);
      }
    } catch (error) {
      console.error("Error submitting supply:", error);
      setErrors({ submit: "Failed to save supply. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SupplyItem, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Add Supply/Inventory
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Main Supply Information */}
          <div className="space-y-6">
            {/* Item Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Item Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) =>
                      handleInputChange("itemName", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.itemName ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., Sugar packets 1kg"
                  />
                  {errors.itemName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.itemName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.category ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select category</option>
                    {commonCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) =>
                      handleInputChange("batchNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., BATCH-2024-001"
                  />
                </div>
              </div>
            </div>

            {/* Supplier Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Supplier Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier *
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) =>
                      handleInputChange("supplier", e.target.value)
                    }
                    list="suppliers"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.supplier ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Start typing supplier name..."
                  />
                  <datalist id="suppliers">
                    {commonSuppliers.map((supplier) => (
                      <option key={supplier} value={supplier} />
                    ))}
                  </datalist>
                  {errors.supplier && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.supplier}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Financial Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Financial Details
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleInputChange("quantity", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.quantity ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="0"
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.quantity}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price (KES) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) =>
                        handleInputChange("unitPrice", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.unitPrice ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                    {errors.unitPrice && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.unitPrice}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount (KES)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.totalAmount}
                      readOnly
                      className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Additional notes about this supply..."
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
                Enter item details and pricing to see ledger preview
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save Supply"}
          </button>
        </div>
      </form>
    </div>
  );
};
