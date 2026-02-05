'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { inventoryApi } from '@/lib/api/inventory';
import type { Currency } from '@/lib/types';
import { toast } from 'sonner';

const defaultForm = {
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
};

export default function AddInventoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, isActive: !asDraft };
      await inventoryApi.create(payload);
      toast.success(asDraft ? 'Item saved as draft' : 'Item added successfully');
      router.push('/inventory');
    } catch (error) {
      console.error('Failed to create item:', error);
      toast.error('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/inventory"
          className="p-2 rounded-lg hover:bg-savanna-100 text-baobab-600 transition-colors"
          aria-label="Back to inventory"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-baobab-900">Add inventory item</h1>
          <p className="text-baobab-600 mt-1">Create a new item in your inventory catalog</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-acacia-600" />
            <h2 className="font-display font-semibold text-lg">Item details</h2>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Item name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Rice 25kg Bag"
                required
                autoFocus
              />
              <Input
                label="SKU / Code"
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
              placeholder="Optional"
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
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as typeof formData.unit })}
                  required
                  className="w-full px-4 py-3 bg-white border border-baobab-200 rounded-lg text-baobab-900 focus:border-acacia-500 focus:ring-2 focus:ring-acacia-200 focus:outline-none"
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
                label="Initial quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                min={0}
                step="0.01"
                placeholder="0"
                required
              />
              <Input
                label="Reorder level"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                min={0}
                step="0.01"
                placeholder="0"
                helperText="Alert when stock reaches this level"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Cost price (KSh)"
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                min={0}
                step="0.01"
                placeholder="0.00"
                required
              />
              <Input
                label="Selling price (KSh)"
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                min={0}
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-baobab-200">
              <Link href="/inventory">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
              <Button
                type="button"
                variant="secondary"
                loading={isSubmitting}
                onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as draft
              </Button>
              <Button type="submit" loading={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                Save & add item
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <p className="text-sm text-baobab-500">
        After adding an item, you can assign it to containers and batches from the{' '}
        <Link href="/inventory/containers" className="text-acacia-600 hover:underline">
          Containers
        </Link>{' '}
        page.
      </p>
    </div>
  );
}
