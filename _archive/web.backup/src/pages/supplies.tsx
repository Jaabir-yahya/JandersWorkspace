"use client";

import React, { useState } from "react";
import { Package, Plus, Search, Eye, Edit, Trash2, Filter } from "lucide-react";
import { SupplyForm } from "@/components/forms/SupplyForm";
import { useSupplies } from "@/hooks/useApi";
import { cn } from "@/utils/cn";

interface Supply {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  supplier: string;
  category: string;
  batchNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const SuppliesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSupplier, setFilterSupplier] = useState<string>("all");

  const { supplies, isLoading, createSupply, updateSupply, deleteSupply } =
    useSupplies();

  // Get unique categories and suppliers for filters
  const categories = Array.from(new Set(supplies.map((s) => s.category)));
  const suppliers = Array.from(new Set(supplies.map((s) => s.supplier)));

  // Filter supplies
  const filteredSupplies = supplies.filter((supply) => {
    const matchesSearch =
      supply.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supply.batchNumber &&
        supply.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      filterCategory === "all" || supply.category === filterCategory;
    const matchesSupplier =
      filterSupplier === "all" || supply.supplier === filterSupplier;
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const handleCreateSupply = async (supplyData: any) => {
    try {
      await createSupply(supplyData);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating supply:", error);
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

  const getStockLevel = (quantity: number) => {
    if (quantity <= 10)
      return { label: "Low", color: "bg-red-100 text-red-800" };
    if (quantity <= 50)
      return { label: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Good", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Supplies & Inventory
          </h1>
          <p className="text-gray-600 mt-1">
            Manage supplies, inventory, and stock levels
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Supply
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
                placeholder="Search supplies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier} value={supplier}>
                {supplier}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredSupplies.length}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  filteredSupplies.reduce(
                    (sum, item) => sum + item.totalAmount,
                    0,
                  ),
                )}
              </p>
            </div>
            <Package className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Low Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredSupplies.filter((item) => item.quantity <= 10).length}
              </p>
            </div>
            <Package className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">
                {suppliers.length}
              </p>
            </div>
            <Package className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Supplies Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : filteredSupplies.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No supplies found</p>
            <p className="text-sm">Add your first supply to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSupplies.map((supply) => {
                  const stockLevel = getStockLevel(supply.quantity);
                  return (
                    <tr key={supply.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {supply.itemName}
                          </div>
                          {supply.batchNumber && (
                            <div className="text-xs text-gray-500">
                              Batch: {supply.batchNumber}
                            </div>
                          )}
                          {supply.notes && (
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {supply.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supply.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supply.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {supply.quantity.toLocaleString()}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${stockLevel.color}`}
                          >
                            {stockLevel.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(supply.unitPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(supply.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(supply.createdAt)}
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
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Supply Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowForm(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <SupplyForm
                onSubmit={handleCreateSupply}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliesPage;
