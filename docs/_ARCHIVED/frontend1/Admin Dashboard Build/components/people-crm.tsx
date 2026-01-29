"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { entityApi, DEFAULT_TENANT_ID, DEFAULT_USER_ID } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { StatusBadge } from "@/components/status-badge";
import type { Entity, EntityWithBalance, EntityType, Transaction, CreateEntityInput } from "@/lib/types";
import {
  Search,
  Plus,
  Phone,
  MapPin,
  User,
  Loader2,
  X,
  LinkIcon,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  FileText,
} from "lucide-react";

interface EntityProfile extends EntityWithBalance {
  transactions: Transaction[];
}

export function PeopleCRM() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntityProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<EntityType | "ALL">("ALL");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddPhoneDialog, setShowAddPhoneDialog] = useState(false);
  const [newPhone, setNewPhone] = useState("");

  // Create entity form state
  const [newEntity, setNewEntity] = useState<Partial<CreateEntityInput>>({
    type: "CUSTOMER",
    display_name: "",
    phone_number: "",
    location: "",
    notes: "",
  });

  const fetchEntities = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await entityApi.list({
        search: searchQuery || undefined,
        type: typeFilter === "ALL" ? undefined : typeFilter,
      });
      setEntities(data);
    } catch (error) {
      console.error("[v0] Failed to fetch entities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, typeFilter]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const loadProfile = async (entityId: string) => {
    setIsLoadingProfile(true);
    try {
      const profile = await entityApi.getProfile(entityId);
      setSelectedEntity(profile as EntityProfile);
    } catch (error) {
      console.error("[v0] Failed to load profile:", error);
      // Fallback: try the legacy endpoint
      try {
        const history = await entityApi.getHistory(entityId);
        setSelectedEntity({
          ...history,
          total_credit: 0,
          total_debit: 0,
          net_balance: 0,
          transaction_count: history.transactions.length,
        } as EntityProfile);
      } catch (fallbackError) {
        console.error("[v0] Fallback also failed:", fallbackError);
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleCreateEntity = async () => {
    if (!newEntity.display_name) return;
    try {
      await entityApi.create({
        tenant_id: DEFAULT_TENANT_ID,
        created_by_user_id: DEFAULT_USER_ID,
        type: newEntity.type as EntityType,
        display_name: newEntity.display_name,
        phone_number: newEntity.phone_number || undefined,
        location: newEntity.location || undefined,
        notes: newEntity.notes || undefined,
      });
      setShowCreateDialog(false);
      setNewEntity({ type: "CUSTOMER", display_name: "", phone_number: "", location: "", notes: "" });
      fetchEntities();
    } catch (error) {
      console.error("[v0] Failed to create entity:", error);
    }
  };

  const handleAddLinkedPhone = async () => {
    if (!selectedEntity || !newPhone) return;
    try {
      await entityApi.addLinkedPhone(selectedEntity.id, newPhone);
      setNewPhone("");
      setShowAddPhoneDialog(false);
      loadProfile(selectedEntity.id);
    } catch (error) {
      console.error("[v0] Failed to add linked phone:", error);
    }
  };

  const getEntityTypeColor = (type: EntityType) => {
    switch (type) {
      case "CUSTOMER":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "SUPPLIER":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "EMPLOYEE":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">People</h1>
          <p className="text-muted-foreground">
            Manage customers, suppliers, and employees - the universal profile
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or alternate name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as EntityType | "ALL")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="CUSTOMER">Customers</SelectItem>
            <SelectItem value="SUPPLIER">Suppliers</SelectItem>
            <SelectItem value="EMPLOYEE">Employees</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchEntities}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity List */}
        <div className="lg:col-span-1 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : entities.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No people found</p>
                <Button variant="link" onClick={() => setShowCreateDialog(true)}>
                  Add your first person
                </Button>
              </CardContent>
            </Card>
          ) : (
            entities.map((entity) => (
              <Card
                key={entity.id}
                className={`bg-card border-border cursor-pointer transition-colors hover:bg-muted/30 ${
                  selectedEntity?.id === entity.id ? "ring-1 ring-emerald-500/50" : ""
                }`}
                onClick={() => loadProfile(entity.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{entity.display_name}</h3>
                        <Badge variant="outline" className={`text-xs ${getEntityTypeColor(entity.type)}`}>
                          {entity.type}
                        </Badge>
                      </div>
                      {entity.phone_number && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span className="font-mono">{entity.phone_number}</span>
                        </div>
                      )}
                      {entity.linked_phones && entity.linked_phones.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <LinkIcon className="h-3 w-3" />
                          <span>+{entity.linked_phones.length} linked</span>
                        </div>
                      )}
                    </div>
                    {entity.balance !== undefined && entity.balance !== 0 && (
                      <span
                        className={`text-sm font-mono font-medium ${
                          entity.balance > 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {entity.balance > 0 ? "+" : ""}
                        {formatCurrency(entity.balance, "KES")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Profile Panel */}
        <div className="lg:col-span-2">
          {selectedEntity ? (
            <Card className="bg-card border-border">
              <CardHeader className="border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{selectedEntity.display_name}</CardTitle>
                      <Badge variant="outline" className={getEntityTypeColor(selectedEntity.type)}>
                        {selectedEntity.type}
                      </Badge>
                    </div>
                    {selectedEntity.alternate_names && selectedEntity.alternate_names.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Also known as: {selectedEntity.alternate_names.join(", ")}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedEntity(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {isLoadingProfile ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Contact</h4>
                        {selectedEntity.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-emerald-400" />
                            <span className="font-mono">{selectedEntity.phone_number}</span>
                            <Badge variant="outline" className="text-xs">Primary</Badge>
                          </div>
                        )}
                        {selectedEntity.linked_phones?.map((phone) => (
                          <div key={phone} className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-muted-foreground">{phone}</span>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddPhoneDialog(true)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Number
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                        {selectedEntity.location ? (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-muted-foreground">{selectedEntity.location}</span>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground/50">No location set</p>
                        )}
                      </div>
                    </div>

                    {/* Balance Summary */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 text-emerald-400 mb-1">
                          <ArrowDownLeft className="h-4 w-4" />
                          <span className="text-xs font-medium">They Owe Us</span>
                        </div>
                        <p className="text-lg font-bold">
                          {formatCurrency(selectedEntity.total_credit || 0, "KES")}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 text-red-400 mb-1">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="text-xs font-medium">We Owe Them</span>
                        </div>
                        <p className="text-lg font-bold">
                          {formatCurrency(selectedEntity.total_debit || 0, "KES")}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 text-foreground mb-1">
                          <FileText className="h-4 w-4" />
                          <span className="text-xs font-medium">Net Balance</span>
                        </div>
                        <p
                          className={`text-lg font-bold ${
                            (selectedEntity.net_balance || 0) >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {formatCurrency(selectedEntity.net_balance || 0, "KES")}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedEntity.notes && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                        <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border whitespace-pre-wrap">
                          {selectedEntity.notes}
                        </p>
                      </div>
                    )}

                    {/* Transaction History */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Transaction History ({selectedEntity.transaction_count || selectedEntity.transactions?.length || 0})
                        </h4>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {selectedEntity.transactions?.length === 0 ? (
                          <p className="text-sm text-muted-foreground/50 py-4 text-center">
                            No transactions yet
                          </p>
                        ) : (
                          selectedEntity.transactions?.map((tx) => (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border"
                            >
                              <div className="flex items-center gap-3">
                                <StatusBadge status={tx.status} />
                                <div>
                                  <p className="text-sm font-medium">{tx.type}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(tx.transaction_date)}
                                    {tx.reference && ` • ${tx.reference}`}
                                  </p>
                                </div>
                              </div>
                              <span className="font-mono font-medium">
                                {formatCurrency(tx.total_amount, tx.currency_code)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center">
                <User className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Person</h3>
                <p className="text-muted-foreground text-sm">
                  Click on a person from the list to view their 360-degree profile
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Entity Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Person</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={newEntity.type}
                onValueChange={(v) => setNewEntity({ ...newEntity, type: v as EntityType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="SUPPLIER">Supplier</SelectItem>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="John Doe"
                value={newEntity.display_name}
                onChange={(e) => setNewEntity({ ...newEntity, display_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Phone (E.164)</Label>
              <Input
                placeholder="+254711111111"
                value={newEntity.phone_number}
                onChange={(e) => setNewEntity({ ...newEntity, phone_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="Karen, Nairobi - Gate B"
                value={newEntity.location}
                onChange={(e) => setNewEntity({ ...newEntity, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any relevant notes about this person..."
                value={newEntity.notes}
                onChange={(e) => setNewEntity({ ...newEntity, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEntity} disabled={!newEntity.display_name}>
              Add Person
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Linked Phone Dialog */}
      <Dialog open={showAddPhoneDialog} onOpenChange={setShowAddPhoneDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Linked Phone</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Phone Number (E.164)</Label>
            <Input
              placeholder="+254722222222"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This allows searching for {selectedEntity?.display_name} using this alternate number.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPhoneDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLinkedPhone} disabled={!newPhone}>
              Add Number
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
