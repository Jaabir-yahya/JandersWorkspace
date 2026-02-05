'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  ArrowLeft,
  Package,
  Warehouse,
  Truck,
  Box,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { containersApi, type InventoryContainer } from '@/lib/api/containers';
import { entitiesApi } from '@/lib/api/entities';
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

export default function ContainersPage() {
  const [containers, setContainers] = useState<InventoryContainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('WAREHOUSE');
  const [newLocation, setNewLocation] = useState('');
  const [newAssignedEntityId, setNewAssignedEntityId] = useState('');
  const [entities, setEntities] = useState<{ id: string; displayName: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchContainers();
  }, []);

  useEffect(() => {
    entitiesApi
      .list()
      .then((list) =>
        setEntities(
          list.map((e: any) => ({
            id: e.id,
            displayName: e.displayName ?? e.display_name ?? e.name ?? e.id,
          })),
        ),
      )
      .catch(() => setEntities([]));
  }, []);

  const fetchContainers = async () => {
    setIsLoading(true);
    try {
      const list = await containersApi.list();
      setContainers(list);
    } catch {
      toast.error('Failed to load containers');
      setContainers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Enter a container name');
      return;
    }
    setIsSubmitting(true);
    try {
      await containersApi.create({
        name: newName.trim(),
        type: newType,
        location: newLocation.trim() || undefined,
        assignedEntityId: newAssignedEntityId.trim() || undefined,
      });
      toast.success('Container created');
      setNewName('');
      setNewLocation('');
      setNewAssignedEntityId('');
      setShowAddForm(false);
      fetchContainers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create container');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/inventory"
            className="p-2 rounded-lg hover:bg-savanna-100 text-baobab-600 transition-colors"
            aria-label="Back to inventory"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-baobab-900">Inventory containers</h1>
            <p className="text-baobab-600 mt-1">
              Warehouses, bins, shipments — hold inventory in batches or moving
            </p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowAddForm(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Add container
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <h2 className="font-display font-semibold text-lg">New container</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleCreate} className="space-y-4 max-w-md">
              <Input
                label="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Main warehouse"
                required
              />
              <div>
                <label className="block text-sm font-medium text-baobab-700 mb-2">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-baobab-200 rounded-lg text-baobab-900 focus:border-acacia-500 focus:ring-2 focus:ring-acacia-200 focus:outline-none"
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Location (optional)"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g., Nairobi, Aisle 3"
              />
              <Select
                label="Assigned to (person/entity) — links container to truth"
                value={newAssignedEntityId}
                onChange={(e) => setNewAssignedEntityId(e.target.value)}
                options={[
                  { value: '', label: 'None' },
                  ...entities.map((e) => ({ value: e.id, label: e.displayName })),
                ]}
              />
              <div className="flex gap-2">
                <Button type="submit" loading={isSubmitting}>
                  Create container
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-display font-semibold text-lg">Containers</h2>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-baobab-500">
              <div className="animate-spin w-8 h-8 border-4 border-acacia-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : containers.length === 0 ? (
            <div className="p-8 text-center text-baobab-500">
              <Package className="h-12 w-12 mx-auto text-baobab-300 mb-3" />
              <p>No containers yet. Add a warehouse, bin, or shipment to hold inventory in batches.</p>
              <Button variant="primary" className="mt-4" onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add container
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-baobab-200">
              {containers.map((c) => {
                const Icon = typeIcons[c.type] || Package;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/inventory/containers/${c.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-savanna-50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-acacia-50 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-acacia-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-baobab-900">{c.name}</p>
                        <p className="text-sm text-baobab-500 flex items-center gap-2">
                          <span>{typeLabels[c.type] ?? c.type}</span>
                          {c.location && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {c.location}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-baobab-400 flex-shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
