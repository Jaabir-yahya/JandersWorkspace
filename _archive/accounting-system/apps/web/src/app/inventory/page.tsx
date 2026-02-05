'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Package,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { InventoryItem } from '@/types';

export default function InventoryPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory', searchQuery],
    queryFn: async () => {
      const response = await api.inventory.list({ page: 1, pageSize: 50 });
      return response.data as InventoryItem[];
    },
  });

  const createItem = useMutation({
    mutationFn: (data: Partial<InventoryItem>) => api.inventory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item added successfully');
      setShowAddForm(false);
    },
    onError: () => {
      toast.error('Failed to add item');
    },
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => api.inventory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete item');
    },
  });

  const lowStockItems = items?.filter(
    (item) => item.quantity <= item.reorderLevel
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Inventory & Supplies
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage your stock and track movements
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          shortcut="Ctrl+N"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Items</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {formatNumber(items?.length || 0)}
              </p>
            </div>
            <Package className="w-10 h-10 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Value</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {formatCurrency(
                  items?.reduce(
                    (sum, item) => sum + item.quantity * item.costPrice,
                    0
                  ) || 0
                )}
              </p>
            </div>
            <Package className="w-10 h-10 text-success-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Low Stock</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">
                {formatNumber(lowStockItems?.length || 0)}
              </p>
            </div>
            <AlertTriangle className="w-10 h-10 text-warning-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Out of Stock</p>
              <p className="text-2xl font-bold text-danger-600 mt-1">
                {formatNumber(
                  items?.filter((item) => item.quantity === 0).length || 0
                )}
              </p>
            </div>
            <AlertTriangle className="w-10 h-10 text-danger-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Filter className="w-5 h-5" />
            Filter
          </Button>
          <Button variant="secondary">
            <Download className="w-5 h-5" />
            Export
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems && lowStockItems.length > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning-900">
                {lowStockItems.length} items are running low
              </p>
              <p className="text-sm text-warning-700 mt-1">
                Consider reordering:{' '}
                {lowStockItems.slice(0, 3).map((item) => item.name).join(', ')}
                {lowStockItems.length > 3 && ` and ${lowStockItems.length - 3} more`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Cost Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Selling Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
                    </div>
                  </td>
                </tr>
              ) : items && items.length > 0 ? (
                items.map((item) => {
                  const isLowStock = item.quantity <= item.reorderLevel;
                  const isOutOfStock = item.quantity === 0;
                  
                  return (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-neutral-900">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-sm text-neutral-500">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-neutral-900">
                        {formatNumber(item.quantity)} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-right text-neutral-600">
                        {formatCurrency(item.costPrice, item.currency)}
                      </td>
                      <td className="px-6 py-4 text-right text-neutral-600">
                        {formatCurrency(item.sellingPrice, item.currency)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-neutral-900">
                        {formatCurrency(
                          item.quantity * item.costPrice,
                          item.currency
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isOutOfStock ? (
                          <span className="badge-danger">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="badge-warning">Low Stock</span>
                        ) : (
                          <span className="badge-success">In Stock</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this item?')) {
                                deleteItem.mutate(item.id);
                              }
                            }}
                            className="p-2 text-neutral-600 hover:text-danger-600 hover:bg-danger-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-neutral-500">
                    No inventory items found. Add your first item to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">
                Add New Item
              </h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createItem.mutate({
                  name: formData.get('name') as string,
                  sku: formData.get('sku') as string,
                  description: formData.get('description') as string,
                  category: formData.get('category') as string,
                  unit: formData.get('unit') as any,
                  quantity: Number(formData.get('quantity')),
                  reorderLevel: Number(formData.get('reorderLevel')),
                  costPrice: Number(formData.get('costPrice')),
                  sellingPrice: Number(formData.get('sellingPrice')),
                  currency: 'KES',
                  isActive: true,
                });
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="name"
                  label="Item Name"
                  required
                  placeholder="e.g., Rice 25kg Bag"
                  autoFocus
                />
                <Input
                  name="sku"
                  label="SKU/Code"
                  required
                  placeholder="e.g., RICE-25KG"
                />
              </div>
              <Input
                name="description"
                label="Description"
                placeholder="Optional item description"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="category"
                  label="Category"
                  required
                  placeholder="e.g., Food & Beverage"
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Unit <span className="text-danger-500">*</span>
                  </label>
                  <select
                    name="unit"
                    required
                    className="flex h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="PIECE">Piece</option>
                    <option value="KG">Kilogram</option>
                    <option value="LITRE">Litre</option>
                    <option value="BOX">Box</option>
                    <option value="CARTON">Carton</option>
                    <option value="SACK">Sack</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="quantity"
                  label="Initial Quantity"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
                <Input
                  name="reorderLevel"
                  label="Reorder Level"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0"
                  helperText="Alert when quantity reaches this level"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="costPrice"
                  label="Cost Price (KSh)"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                <Input
                  name="sellingPrice"
                  label="Selling Price (KSh)"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={createItem.isPending}>
                  Add Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
