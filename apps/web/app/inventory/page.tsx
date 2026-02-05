'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Package,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Badge } from '@/components/Badge';
import { inventoryApi } from '@/lib/api/inventory';
import { formatCurrency, formatNumber, downloadAsCSV } from '@/lib/utils';
import type { Currency, InventoryItem } from '@/lib/types';
import { toast } from 'sonner';

export default function InventoryPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    unit: 'PIECE' as 'PIECE' | 'KG' | 'LITRE' | 'BOX' | 'CARTON' | 'SACK',
    quantity: 0,
    reorderLevel: 0,
    costPrice: 0,
    sellingPrice: 0,
    currency: 'KES' as Currency,
    isActive: true,
  });

  useEffect(() => {
    fetchItems();
  }, [searchQuery, categoryFilter]);

  // Listen for keyboard shortcut to open add modal
  useEffect(() => {
    const handleOpenAddInventory = () => {
      setShowAddForm(true);
    };

    window.addEventListener('open-add-inventory', handleOpenAddInventory as EventListener);
    return () => {
      window.removeEventListener('open-add-inventory', handleOpenAddInventory as EventListener);
    };
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await inventoryApi.list({
        page: 1,
        pageSize: 100,
        search: searchQuery || undefined,
        category: categoryFilter || undefined,
      });
      setItems(response.data || []);
    } catch {
      toast.error('Failed to load inventory items. You can still add new items below.');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitCreateItem = async (asDraft: boolean) => {
    setIsSubmitting(true);
    try {
      const payload = { ...formData, isActive: !asDraft };
      await inventoryApi.create(payload);
      toast.success(asDraft ? 'Item saved as draft' : 'Item added successfully');
      setShowAddForm(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Failed to create item:', error);
      toast.error('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCreateItem(false);
  };

  const submitUpdateItem = async (asDraft: boolean) => {
    if (!editingItem) return;
    setIsSubmitting(true);
    try {
      const payload = { ...formData, isActive: !asDraft };
      await inventoryApi.update(editingItem.id, payload);
      toast.success(asDraft ? 'Item saved as draft' : 'Item updated successfully');
      setShowEditForm(false);
      setEditingItem(null);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error('Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitUpdateItem(false);
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await inventoryApi.delete(id);
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      description: item.description || '',
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      currency: item.currency,
      isActive: item.isActive,
    });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      unit: 'PIECE',
      quantity: 0,
      reorderLevel: 0,
      costPrice: 0,
      sellingPrice: 0,
      currency: 'KES',
      isActive: true,
    });
  };

  const handleExport = () => {
    const csvData = items.map((item) => ({
      Name: item.name,
      SKU: item.sku,
      Category: item.category,
      Quantity: item.quantity,
      Unit: item.unit,
      'Cost Price': item.costPrice,
      'Selling Price': item.sellingPrice,
      'Total Value': item.quantity * item.costPrice,
      Status: item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock',
    }));
    downloadAsCSV(csvData, 'inventory-export');
  };

  const lowStockItems = items.filter((item) => item.quantity <= item.reorderLevel);
  const outOfStockItems = items.filter((item) => item.quantity === 0);
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);
  const categories = Array.from(new Set(items.map((item) => item.category)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-baobab-900">Inventory</h1>
          <p className="text-baobab-600 mt-1">
            Manage your stock and track movements
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={() => setShowAddForm(true)} shortcut="Ctrl+I">
            <Plus className="h-5 w-5 mr-2" />
            Add Item
          </Button>
          <Link href="/inventory/new">
            <Button variant="secondary">
              Add inventory (full page)
            </Button>
          </Link>
          <Link href="/inventory/containers">
            <Button variant="ghost">
              Containers & batches
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-baobab-600">Total Items</p>
                <p className="text-3xl font-bold text-baobab-900 mt-1">
                  {formatNumber(items.length)}
                </p>
              </div>
              <Package className="h-10 w-10 text-acacia-600" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-baobab-600">Total Value</p>
                <p className="text-3xl font-bold text-baobab-900 mt-1">
                  {formatCurrency(totalValue, 'KES')}
                </p>
              </div>
              <Package className="h-10 w-10 text-acacia-700" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-baobab-600">Low Stock</p>
                <p className="text-3xl font-bold text-clay-700 mt-1">
                  {formatNumber(lowStockItems.length)}
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-clay-600" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-baobab-600">Out of Stock</p>
                <p className="text-3xl font-bold text-clay-700 mt-1">
                  {formatNumber(outOfStockItems.length)}
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-clay-700" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search by name, SKU, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-5 w-5" />}
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map((cat) => ({ value: cat, label: cat })),
              ]}
            />
            <div className="flex gap-2">
              <Button variant="secondary">
                <Filter className="h-5 w-5 mr-2" />
                Filter
              </Button>
              <Button variant="secondary" onClick={handleExport}>
                <Download className="h-5 w-5 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-clay-50 border border-clay-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-clay-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-clay-900">
                {lowStockItems.length} items are running low
              </p>
              <p className="text-sm text-clay-700 mt-1">
                Consider reordering:{' '}
                {lowStockItems.slice(0, 3).map((item) => item.name).join(', ')}
                {lowStockItems.length > 3 && ` and ${lowStockItems.length - 3} more`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <h2 className="font-display font-semibold text-lg">Inventory Items</h2>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-savanna-50 border-b border-baobab-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Item Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Cost Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-baobab-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-baobab-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-acacia-600 border-t-transparent rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ) : items.length > 0 ? (
                  items.map((item) => {
                    const isLowStock = item.quantity <= item.reorderLevel;
                    const isOutOfStock = item.quantity === 0;

                    return (
                      <tr key={item.id} className="hover:bg-savanna-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-baobab-900">
                              {item.name}
                            </div>
                            {item.description && (
                              <div className="text-sm text-baobab-500">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-baobab-600">
                          <span className="font-mono text-xs bg-baobab-100 px-2 py-1 rounded">
                            {item.sku}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-acacia-50 text-acacia-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-baobab-900">
                          {formatNumber(item.quantity)} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-right text-baobab-600">
                          {formatCurrency(item.costPrice, item.currency)}
                        </td>
                        <td className="px-6 py-4 text-right text-baobab-600">
                          {formatCurrency(item.sellingPrice, item.currency)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-baobab-900">
                          {formatCurrency(item.quantity * item.costPrice, item.currency)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isOutOfStock ? (
                            <Badge variant="danger">Out of Stock</Badge>
                          ) : isLowStock ? (
                            <Badge variant="warning">Low Stock</Badge>
                          ) : (
                            <Badge variant="success">In Stock</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="p-2 text-baobab-600 hover:text-acacia-600 hover:bg-acacia-50 rounded transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              className="p-2 text-baobab-600 hover:text-clay-600 hover:bg-clay-50 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-baobab-500">
                      No inventory items found. Add your first item to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-baobab-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-baobab-900">Add New Item</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="p-2 hover:bg-savanna-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-baobab-600" />
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Item Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Rice 25kg Bag"
                  required
                  autoFocus
                />
                <Input
                  label="SKU/Code"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., RICE-25KG"
                  required
                />
              </div>
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional item description"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Food & Beverage"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-baobab-700 mb-2">
                    Unit <span className="text-clay-600">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    required
                    className="w-full px-4 py-3 bg-white border border-baobab-200 rounded-lg text-baobab-900 transition-all duration-200 hover:border-baobab-300 focus:border-acacia-500 focus:ring-2 focus:ring-acacia-200 focus:outline-none"
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
                  label="Initial Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  required
                />
                <Input
                  label="Reorder Level"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  helperText="Alert when quantity reaches this level"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Cost Price (KSh)"
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
                <Input
                  label="Selling Price (KSh)"
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  loading={isSubmitting}
                  onClick={() => submitCreateItem(true)}
                >
                  Save as draft
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Save & add item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditForm && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-baobab-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-baobab-900">Edit Item</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="p-2 hover:bg-savanna-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-baobab-600" />
              </button>
            </div>
            <form onSubmit={handleUpdateItem} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Item Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Rice 25kg Bag"
                  required
                  autoFocus
                />
                <Input
                  label="SKU/Code"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., RICE-25KG"
                  required
                />
              </div>
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional item description"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Food & Beverage"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-baobab-700 mb-2">
                    Unit <span className="text-clay-600">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    required
                    className="w-full px-4 py-3 bg-white border border-baobab-200 rounded-lg text-baobab-900 transition-all duration-200 hover:border-baobab-300 focus:border-acacia-500 focus:ring-2 focus:ring-acacia-200 focus:outline-none"
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
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  required
                />
                <Input
                  label="Reorder Level"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  helperText="Alert when quantity reaches this level"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Cost Price (KSh)"
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
                <Input
                  label="Selling Price (KSh)"
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  loading={isSubmitting}
                  onClick={() => submitUpdateItem(true)}
                >
                  Save as draft
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Save & update item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
