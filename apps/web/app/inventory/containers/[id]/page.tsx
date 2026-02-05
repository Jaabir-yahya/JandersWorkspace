'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Package,
  Warehouse,
  Truck,
  Box,
  MapPin,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { containersApi, type InventoryContainer, type ContainerItem } from '@/lib/api/containers';
import { inventoryApi } from '@/lib/api/inventory';
import type { InventoryItem } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  WAREHOUSE: Warehouse,
  BIN: Box,
  SHELF: Box,
  SHIPMENT: Truck,
  VEHICLE: Truck,
};

const typeLabels: Record<string, string> = {
  WAREHOUSE: 'Warehouse',
  BIN: 'Bin',
  SHELF: 'Shelf',
  SHIPMENT: 'Shipment',
  VEHICLE: 'Vehicle',
};

export default function ContainerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [container, setContainer] = useState<InventoryContainer | null>(null);
  const [items, setItems] = useState<ContainerItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [addItemId, setAddItemId] = useState('');
  const [addQuantity, setAddQuantity] = useState(1);
  const [addBatchRef, setAddBatchRef] = useState('');
  const [addExpiryAt, setAddExpiryAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const [c, list, invRes] = await Promise.all([
          containersApi.get(id).catch(() => null),
          containersApi.getItems(id).catch(() => []),
          inventoryApi.list({ pageSize: 500 }).then((r) => r.data ?? []).catch(() => []),
        ]);
        if (!cancelled) {
          setContainer(c);
          setItems(Array.isArray(list) ? list : []);
          setInventoryItems(Array.isArray(invRes) ? invRes : []);
        }
      } catch {
        if (!cancelled) {
          setContainer(null);
          setItems([]);
          setInventoryItems([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addItemId || addQuantity <= 0) {
      toast.error('Select an item and enter quantity');
      return;
    }
    setIsSubmitting(true);
    try {
      await containersApi.addItem(id, {
        itemId: addItemId,
        quantity: addQuantity,
        batchRef: addBatchRef.trim() || undefined,
        expiryAt: addExpiryAt || undefined,
      });
      toast.success('Item added to container');
      setAddItemId('');
      setAddQuantity(1);
      setAddBatchRef('');
      setAddExpiryAt('');
      setShowAddItem(false);
      const list = await containersApi.getItems(id);
      setItems(list);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !container) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin w-8 h-8 border-4 border-acacia-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!container) {
    return (
      <div className="space-y-4">
        <Link href="/inventory/containers" className="text-acacia-600 hover:underline">
          ← Back to containers
        </Link>
        <p className="text-baobab-500">Container not found.</p>
      </div>
    );
  }

  const Icon = typeIcons[container.type] || Package;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/inventory/containers"
            className="p-2 rounded-lg hover:bg-savanna-100 text-baobab-600 transition-colors"
            aria-label="Back to containers"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-acacia-50 flex items-center justify-center">
              <Icon className="h-6 w-6 text-acacia-600" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-baobab-900">{container.name}</h1>
              <p className="text-baobab-600 text-sm flex items-center gap-2">
                <span>{typeLabels[container.type] ?? container.type}</span>
                {container.location && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {container.location}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowAddItem(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Add item / batch
        </Button>
      </div>

      {showAddItem && (
        <Card>
          <CardHeader>
            <h2 className="font-display font-semibold text-lg">Add item or batch</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleAddItem} className="space-y-4 max-w-md">
              <Select
                label="Item"
                value={addItemId}
                onChange={(e) => setAddItemId(e.target.value)}
                options={[
                  { value: '', label: 'Select item...' },
                  ...inventoryItems.map((i) => ({ value: i.id, label: `${i.name} (${i.sku})` })),
                ]}
                required
              />
              <Input
                label="Quantity"
                type="number"
                value={addQuantity}
                onChange={(e) => setAddQuantity(Number(e.target.value))}
                min={0.0001}
                step="any"
                required
              />
              <Input
                label="Batch reference (optional)"
                value={addBatchRef}
                onChange={(e) => setAddBatchRef(e.target.value)}
                placeholder="e.g., LOT-2024-001"
              />
              <Input
                label="Expiry date (optional)"
                type="date"
                value={addExpiryAt}
                onChange={(e) => setAddExpiryAt(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="submit" loading={isSubmitting}>
                  Add to container
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowAddItem(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-display font-semibold text-lg">Items & batches</h2>
        </CardHeader>
        <CardBody className="p-0">
          {items.length === 0 ? (
            <div className="p-8 text-center text-baobab-500">
              <Package className="h-12 w-12 mx-auto text-baobab-300 mb-3" />
              <p>No items in this container yet. Add inventory items or batches above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-savanna-50 border-b border-baobab-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-baobab-600 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-baobab-600 uppercase">Batch</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-baobab-600 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-baobab-600 uppercase">Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-baobab-200">
                  {items.map((row) => (
                    <tr key={row.id} className="hover:bg-savanna-50/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-baobab-900">{row.itemName ?? row.itemId}</p>
                          {row.itemSku && (
                            <p className="text-xs text-baobab-500 font-mono">{row.itemSku}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {row.batchRef ? (
                          <span className="font-mono text-xs bg-baobab-100 px-2 py-1 rounded">{row.batchRef}</span>
                        ) : (
                          <span className="text-baobab-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{row.quantity}</td>
                      <td className="px-4 py-3 text-baobab-600">
                        {row.expiryAt ? formatDate(row.expiryAt) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
