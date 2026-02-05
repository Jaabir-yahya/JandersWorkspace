'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Save, X, Send } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LedgerPreview } from '@/components/LedgerPreview';
import { formatCurrency, getTodayDate, generateReference, calculateSubtotal } from '@/lib/utils';
import type { InvoiceForm, InvoiceItem, LedgerEntry, Customer } from '@/lib/types';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState<InvoiceForm>({
    date: getTodayDate(),
    dueDate: '',
    customerId: '',
    items: [],
    notes: '',
  });

  useEffect(() => {
    setCustomers([
      { id: '1', name: 'ABC Limited', currency: 'KES', balance: 0, isActive: true },
      { id: '2', name: 'XYZ Corporation', currency: 'KES', balance: 0, isActive: true },
      { id: '3', name: 'Global Ventures', currency: 'USD', balance: 0, isActive: true },
    ]);
  }, []);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: '', quantity: 1, unitPrice: 0, total: 0 },
      ],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    setFormData({ ...formData, items: newItems });
  };

  const ledgerEntries = useMemo((): LedgerEntry[] => {
    if (!formData.customerId || formData.items.length === 0) return [];

    const subtotal = calculateSubtotal(formData.items);
    const customer = customers.find(c => c.id === formData.customerId);
    
    if (!customer) return [];

    return [
      {
        id: '1',
        date: formData.date,
        reference: '',
        description: `Accounts Receivable - ${customer.name}`,
        debit: subtotal,
        credit: 0,
        balance: subtotal,
        category: 'receivable',
      },
      {
        id: '2',
        date: formData.date,
        reference: '',
        description: 'Sales Revenue',
        debit: 0,
        credit: subtotal,
        balance: -subtotal,
        category: 'revenue',
      },
    ];
  }, [formData, customers]);

  const handleSubmit = async (status: 'DRAFT' | 'SENT') => {
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (formData.items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Please complete all item details');
      return;
    }

    toast.success(status === 'DRAFT' ? 'Invoice saved as draft!' : 'Invoice sent successfully!');
    
    // Reset form
    setFormData({
      date: getTodayDate(),
      dueDate: '',
      customerId: '',
      items: [],
      notes: '',
    });
  };

  const subtotal = calculateSubtotal(formData.items);
  const customer = customers.find(c => c.id === formData.customerId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-baobab-900">Create Invoice</h1>
          <p className="text-baobab-600 mt-1">
            Generate invoice for customer sales
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={() => setFormData({ date: getTodayDate(), dueDate: '', customerId: '', items: [], notes: '' })}>
            <X className="h-5 w-5 mr-2" />
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => handleSubmit('DRAFT')}>
            <Save className="h-5 w-5 mr-2" />
            Save Draft
          </Button>
          <Button variant="primary" onClick={() => handleSubmit('SENT')}>
            <Send className="h-5 w-5 mr-2" />
            Send Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <h2 className="font-display font-semibold text-lg">Invoice Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Invoice Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  helperText="Optional"
                />
              </div>

              <Select
                label="Customer"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                options={[
                  { value: '', label: 'Select customer...' },
                  ...customers.map(c => ({ value: c.id, label: `${c.name} (${c.code})` })),
                ]}
                required
              />
            </CardBody>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="font-display font-semibold text-lg">Line Items</h2>
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

                    <Input
                      label="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="e.g., Consulting Services - January 2024"
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
                        label="Unit Price"
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        label="Total"
                        value={formatCurrency(item.total, customer?.currency || 'KES')}
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
                      <span className="text-baobab-700">Total Amount</span>
                      <span className="currency text-baobab-900">
                        {formatCurrency(subtotal, customer?.currency || 'KES')}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <h2 className="font-display font-semibold text-lg">Additional Notes</h2>
            </CardHeader>
            <CardBody>
              <Input
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Payment terms, thank you message, etc..."
              />
            </CardBody>
          </Card>
        </div>

        {/* Ledger Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <LedgerPreview 
              entries={ledgerEntries} 
              currency={customer?.currency || 'KES'}
              title="Accounting Impact"
            />

            {ledgerEntries.length > 0 && (
              <div className="mt-4 p-4 bg-acacia-50 border border-acacia-200 rounded-lg">
                <h3 className="font-medium text-acacia-800 mb-2">What happens:</h3>
                <ul className="text-sm text-acacia-700 space-y-1.5">
                  <li>• Revenue recognized: {formatCurrency(subtotal, customer?.currency || 'KES')}</li>
                  <li>• Receivable created for {customer?.name}</li>
                  <li>• Invoice sent to customer email</li>
                  <li>• Dashboard KPIs updated</li>
                </ul>
              </div>
            )}

            {/* Invoice Preview Card */}
            {formData.customerId && formData.items.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <h3 className="font-display font-semibold">Invoice Preview</h3>
                </CardHeader>
                <CardBody className="text-sm space-y-2">
                  <div>
                    <p className="text-baobab-600">Customer</p>
                    <p className="font-medium">{customer?.name}</p>
                  </div>
                  <div>
                    <p className="text-baobab-600">Date</p>
                    <p className="font-medium">{formData.date}</p>
                  </div>
                  <div>
                    <p className="text-baobab-600">Items</p>
                    <p className="font-medium">{formData.items.length} line items</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-baobab-600">Amount Due</p>
                    <p className="text-xl font-bold currency text-acacia-700">
                      {formatCurrency(subtotal, customer?.currency || 'KES')}
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
