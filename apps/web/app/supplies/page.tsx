'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LedgerPreview } from '@/components/LedgerPreview';
import { formatCurrency, getTodayDate, generateReference, calculateSubtotal } from '@/lib/utils';
import type { SupplyPurchaseForm, PurchaseItem, LedgerEntry, Supplier, SupplyItem, PaymentMethod } from '@/lib/types';
import { containersApi } from '@/lib/api/containers';
import { suppliesApi } from '@/lib/api/supplies';
import toast from 'react-hot-toast';

export default function SuppliesPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplyItems, setSupplyItems] = useState<SupplyItem[]>([]);
  const [formData, setFormData] = useState<SupplyPurchaseForm>({
    date: getTodayDate(),
    reference: generateReference('PUR'),
    supplierId: '',
    items: [],
    paymentMethod: 'CASH',
    paymentReference: '',
    notes: '',
    containerId: '',
  });
  const [containers, setContainers] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    containersApi.list().then((list) => setContainers(list.map((c) => ({ id: c.id, name: c.name })))).catch(() => setContainers([]));
  }, []);

  // Load mock data
  useEffect(() => {
    setSuppliers([
      { id: '1', name: 'Kenya Supplies Ltd', code: 'SUP001', currency: 'KES', balance: 0, isActive: true },
      { id: '2', name: 'East Africa Traders', code: 'SUP002', currency: 'KES', balance: 0, isActive: true },
      { id: '3', name: 'Global Imports Co', code: 'SUP003', currency: 'USD', balance: 0, isActive: true },
    ]);

    setSupplyItems([
      { id: '1', name: 'Office Paper A4', code: 'ITM001', unit: 'Ream', currentStock: 50, unitCost: 500, currency: 'KES' },
      { id: '2', name: 'Printer Ink Cartridge', code: 'ITM002', unit: 'Unit', currentStock: 10, unitCost: 2500, currency: 'KES' },
      { id: '3', name: 'Desk Chair', code: 'ITM003', unit: 'Unit', currentStock: 5, unitCost: 8500, currency: 'KES' },
    ]);
  }, []);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { supplyItemId: '', supplyItemName: '', quantity: 1, unitCost: 0, total: 0 },
      ],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Update item name and cost when item is selected
    if (field === 'supplyItemId') {
      const item = supplyItems.find(i => i.id === value);
      if (item) {
        newItems[index].supplyItemName = item.name;
        newItems[index].unitCost = item.unitCost;
      }
    }

    // Calculate total
    newItems[index].total = newItems[index].quantity * (newItems[index].unitCost ?? 0);

    setFormData({ ...formData, items: newItems });
  };

  // Calculate ledger entries
  const ledgerEntries = useMemo((): LedgerEntry[] => {
    if (!formData.supplierId || formData.items.length === 0) return [];

    const subtotal = calculateSubtotal(formData.items);
    const supplier = suppliers.find(s => s.id === formData.supplierId);
    
    if (!supplier) return [];

    const entries: LedgerEntry[] = [
      // Debit: Inventory or Expense
      {
        id: '1',
        date: formData.date,
        reference: formData.reference,
        description: `Supply purchase from ${supplier.name}`,
        debit: subtotal,
        credit: 0,
        balance: subtotal,
        category: 'Inventory',
        accountId: 'acc-inventory',
        accountCode: '1300',
        accountName: 'Inventory',
        currency: supplier.currency,
      },
    ];

    // Credit depends on payment method
    if (formData.paymentMethod === 'CASH') {
      entries.push({
        id: '2',
        date: formData.date,
        reference: formData.reference,
        description: `Cash payment for supply purchase`,
        debit: 0,
        credit: subtotal,
        balance: 0,
        category: 'Cash',
        accountId: 'acc-cash',
        accountCode: '1100',
        accountName: 'Cash',
        currency: supplier.currency,
      });
    } else if (formData.paymentMethod === 'MPESA') {
      entries.push({
        id: '2',
        date: formData.date,
        reference: formData.reference,
        description: 'MPesa payment for supply purchase',
        debit: 0,
        credit: subtotal,
        balance: 0,
        category: 'MPesa',
        accountId: 'acc-mpesa',
        accountCode: '1110',
        accountName: 'MPesa Account',
        currency: supplier.currency,
      });
    } else {
      // Credit to Accounts Payable
      entries.push({
        id: '2',
        date: formData.date,
        reference: formData.reference,
        description: `Accounts Payable - ${supplier.name}`,
        debit: 0,
        credit: subtotal,
        balance: 0,
        category: 'Payable',
        accountId: 'acc-payable',
        accountCode: '2100',
        accountName: `Accounts Payable - ${supplier.name}`,
        currency: supplier.currency,
      });
    }

    return entries;
  }, [formData, suppliers, supplyItems]);

  const handleSaveDraft = () => {
    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return;
    }
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    // TODO: Persist draft to API or localStorage
    toast.success('Purchase saved as draft');
  };

  const handleSubmit = async () => {
    if (!formData.supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (formData.items.some(item => !item.supplyItemId || item.quantity <= 0)) {
      toast.error('Please complete all item details');
      return;
    }

    if (formData.paymentMethod === 'MPESA' && !formData.paymentReference) {
      toast.error('Please enter MPesa transaction code');
      return;
    }

    const supplier = suppliers.find(s => s.id === formData.supplierId);
    if (!supplier) {
      toast.error('Invalid supplier');
      return;
    }

    setIsSubmitting(true);
    try {
      for (const item of formData.items) {
        const supplyItem = supplyItems.find(si => si.id === item.supplyItemId);
        await suppliesApi.create({
          supplierName: supplier.name,
          itemType: item.supplyItemName || supplyItem?.name || 'Item',
          quantity: item.quantity,
          unitPrice: item.unitCost ?? 0,
          unit: supplyItem?.unit || 'PCS',
          entityId: formData.supplierId,
          containerId: formData.containerId || undefined,
          notes: formData.notes || undefined,
        });
      }
      toast.success('Purchase recorded successfully!');
      setFormData({
        date: getTodayDate(),
        reference: generateReference('PUR'),
        supplierId: '',
        items: [],
        paymentMethod: 'CASH',
        paymentReference: '',
        notes: '',
        containerId: '',
      });
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to record purchase';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = calculateSubtotal(formData.items);
  const supplier = suppliers.find(s => s.id === formData.supplierId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-baobab-900">Record Purchase</h1>
          <p className="text-baobab-600 mt-1">
            Add supplies, inventory, or expense purchases
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={() => setFormData({ date: getTodayDate(), reference: generateReference('PUR'), supplierId: '', items: [], paymentMethod: 'CASH', paymentReference: '', notes: '', containerId: '' })}>
            <X className="h-5 w-5 mr-2" />
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleSaveDraft}>
            <Save className="h-5 w-5 mr-2" />
            Save draft
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="h-5 w-5 mr-2" />
            {isSubmitting ? 'Posting…' : 'Save & post purchase'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <h2 className="font-display font-semibold text-lg">Purchase Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
                <Input
                  label="Reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  required
                />
              </div>

              <Select
                label="Supplier"
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                options={[
                  { value: '', label: 'Select supplier...' },
                  ...suppliers.map(s => ({ value: s.id, label: `${s.name} (${s.code})` })),
                ]}
                required
              />
              <Select
                label="Receive into container (links to ledger truth)"
                value={formData.containerId ?? ''}
                onChange={(e) => setFormData({ ...formData, containerId: e.target.value || undefined })}
                options={[
                  { value: '', label: 'None' },
                  ...containers.map(c => ({ value: c.id, label: c.name })),
                ]}
              />
            </CardBody>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="font-display font-semibold text-lg">Items</h2>
                <Button variant="primary" onClick={addItem} className="shrink-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {formData.items.length === 0 ? (
                <div className="text-center py-8 rounded-lg border-2 border-dashed border-baobab-200 bg-savanna-50">
                  <p className="text-baobab-600 mb-3">No items added yet</p>
                  <Button variant="primary" onClick={addItem}>
                    <Plus className="h-5 w-5 mr-2" />
                    Add your first item
                  </Button>
                </div>
              ) : (
                formData.items.map((item, index) => (
                  <div key={index} className="p-4 bg-savanna-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-baobab-700">Item #{index + 1}</span>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-clay-600 hover:text-clay-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <Select
                      value={item.supplyItemId}
                      onChange={(e) => updateItem(index, 'supplyItemId', e.target.value)}
                      options={[
                        { value: '', label: 'Select item...' },
                        ...supplyItems.map(si => ({ 
                          value: si.id, 
                          label: `${si.name} (${si.code}) - ${formatCurrency(si.unitCost ?? 0, si.currency ?? 'KES')}/${si.unit ?? ''}` 
                        })),
                      ]}
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Quantity"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        label="Unit Cost"
                        type="number"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        label="Total"
                        value={formatCurrency(item.total, supplier?.currency || 'KES')}
                        disabled
                      />
                    </div>
                  </div>
                ))
              )}

              {formData.items.length > 0 && (
                <>
                  <div className="flex justify-center pt-2">
                    <Button variant="secondary" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add another item
                    </Button>
                  </div>
                  <div className="pt-4 border-t border-baobab-200">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span className="text-baobab-700">Subtotal</span>
                      <span className="currency text-baobab-900">
                        {formatCurrency(subtotal, supplier?.currency || 'KES')}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <h2 className="font-display font-semibold text-lg">Payment Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Select
                label="Payment Method"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                options={[
                  { value: 'CASH', label: 'Cash' },
                  { value: 'MPESA', label: 'MPesa' },
                  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                  { value: 'CHEQUE', label: 'Cheque' },
                  { value: 'CARD', label: 'Card' },
                  { value: 'OTHER', label: 'On Account (Payable)' },
                ]}
              />

              {formData.paymentMethod === 'MPESA' && (
                <Input
                  label="MPesa Transaction Code"
                  placeholder="e.g., RXF345GH89 (10-character code)"
                  value={formData.paymentReference}
                  onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value.toUpperCase() })}
                  required
                />
              )}

              {formData.paymentMethod === 'BANK_TRANSFER' && (
                <Input
                  label="Bank Reference"
                  value={formData.paymentReference}
                  onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                />
              )}

              <Input
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
              />
            </CardBody>
          </Card>
        </div>

        {/* Ledger Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <LedgerPreview 
              entries={ledgerEntries} 
              currency={supplier?.currency || 'KES'}
              title="Transaction Preview"
            />

            {ledgerEntries.length > 0 && (
              <div className="mt-4 p-4 bg-acacia-50 border border-acacia-200 rounded-lg">
                <h3 className="font-medium text-acacia-800 mb-2">What happens:</h3>
                <ul className="text-sm text-acacia-700 space-y-1.5">
                  <li>• Inventory increases by {formatCurrency(subtotal, supplier?.currency || 'KES')}</li>
                  <li>• {formData.paymentMethod !== 'CASH' && formData.paymentMethod !== 'MPESA' ? 'Payable created' : 'Payment recorded'}</li>
                  <li>• Stock levels updated automatically</li>
                  <li>• Audit log entry created</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
