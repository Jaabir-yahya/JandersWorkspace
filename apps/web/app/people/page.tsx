"use client";

import { useState } from "react";
import { mutate } from "swr";
import {
  useEntities,
  useEntity360View,
  createEntity,
  addLinkedPhone,
  removeLinkedPhone,
} from "@/lib/api-client";
import { formatCurrency } from "@/lib/helpers";
import type { EntityType } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  UserPlus,
  Phone,
  MapPin,
  FileText,
  X,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { DEFAULT_TENANT_ID, DEFAULT_USER_ID } from "@/lib/api-client";
import { StatusBadge, PaymentBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/helpers";
import { ErrorBoundary } from "@/components/error-boundary";
import { FullPageLoader } from "@/components/loading";

export default function PeoplePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [showNewEntityDialog, setShowNewEntityDialog] = useState(false);
  const [newPhone, setNewPhone] = useState("");

  // New entity form
  const [newEntityName, setNewEntityName] = useState("");
  const [newEntityPhone, setNewEntityPhone] = useState("");
  const [newEntityType, setNewEntityType] = useState<EntityType>("CUSTOMER");
  const [newEntityLocation, setNewEntityLocation] = useState("");

  const {
    data: entities,
    isLoading,
    mutate: refreshEntities,
  } = useEntities({
    tenant_id: DEFAULT_TENANT_ID,
    search: searchQuery || undefined,
  });

  const {
    data: entity360,
    isLoading: isLoading360,
    error: error360,
  } = useEntity360View(selectedEntityId || "");

  const filteredEntities = entities?.filter((e) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      e.display_name.toLowerCase().includes(search) ||
      e.phone_number?.includes(search) ||
      e.linked_phones?.some((p) => p.includes(search))
    );
  });

  const handleCreateEntity = async () => {
    if (!newEntityName) return;

    await createEntity({
      tenant_id: DEFAULT_TENANT_ID,
      created_by_user_id: DEFAULT_USER_ID,
      type: newEntityType,
      display_name: newEntityName,
      phone_number: newEntityPhone || undefined,
      location: newEntityLocation || undefined,
    });

    setShowNewEntityDialog(false);
    setNewEntityName("");
    setNewEntityPhone("");
    setNewEntityLocation("");
    refreshEntities();
  };

  const handleAddPhone = async () => {
    if (!selectedEntityId || !newPhone) return;
    try {
      await addLinkedPhone(selectedEntityId, newPhone);
      setNewPhone("");
      // Refresh the 360 view to show updated data
      mutate(
        `/entities/${selectedEntityId}/360-view?tenant_id=${DEFAULT_TENANT_ID}`,
      );
    } catch (error) {
      console.error("Failed to add phone:", error);
    }
  };

  const handleRemovePhone = async (phone: string) => {
    if (!selectedEntityId) return;
    try {
      await removeLinkedPhone(selectedEntityId, phone);
      // Refresh the 360 view to show updated data
      mutate(
        `/entities/${selectedEntityId}/360-view?tenant_id=${DEFAULT_TENANT_ID}`,
      );
    } catch (error) {
      console.error("Failed to remove phone:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            People & CRM
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage customers, suppliers, and view 360° profiles
          </p>
        </div>
        <Dialog
          open={showNewEntityDialog}
          onOpenChange={setShowNewEntityDialog}
        >
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Person</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={newEntityName}
                  onChange={(e) => setNewEntityName(e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={newEntityPhone}
                  onChange={(e) => setNewEntityPhone(e.target.value)}
                  placeholder="+254..."
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newEntityType}
                  onValueChange={(v: EntityType) => setNewEntityType(v)}
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
                <Label>Location</Label>
                <Input
                  value={newEntityLocation}
                  onChange={(e) => setNewEntityLocation(e.target.value)}
                  placeholder="Address or location"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreateEntity}
                disabled={!newEntityName}
              >
                Create Person
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity List */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <div className="max-h-[600px] overflow-y-auto">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 border-b">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))
              ) : filteredEntities?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No people found</p>
                </div>
              ) : (
                filteredEntities?.map((entity) => (
                  <button
                    key={entity.id}
                    className={`w-full text-left p-4 border-b hover:bg-secondary/50 transition-colors ${
                      selectedEntityId === entity.id ? "bg-secondary" : ""
                    }`}
                    onClick={() => setSelectedEntityId(entity.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{entity.display_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {entity.phone_number}
                        </p>
                      </div>
                      <Badge variant="outline">{entity.type}</Badge>
                    </div>
                    {entity.balance !== undefined && entity.balance !== 0 && (
                      <div className="mt-2">
                        <span
                          className={`text-xs font-mono ${
                            entity.balance > 0
                              ? "text-emerald-500"
                              : "text-amber-500"
                          }`}
                        >
                          {entity.balance > 0 ? "Owes: " : "Owed: "}
                          {formatCurrency(Math.abs(entity.balance), "KES")}
                        </span>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 360° View */}
        <div className="lg:col-span-2">
          <ErrorBoundary>
            {selectedEntityId && isLoading360 ? (
              <FullPageLoader message="Loading 360° profile..." />
            ) : error360 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="text-destructive text-lg font-medium mb-2">
                  Failed to load profile
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {error360.message ||
                    "Could not fetch 360° view. Please try again."}
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    mutate(
                      `/entities/${selectedEntityId}/360-view?tenant_id=${DEFAULT_TENANT_ID}`,
                    )
                  }
                >
                  Retry
                </Button>
              </div>
            ) : selectedEntityId && entity360 ? (
              <div className="space-y-6">
                {/* Profile Header */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          {entity360.display_name}
                        </h2>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {entity360.phone_number && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {entity360.phone_number}
                            </div>
                          )}
                          {entity360.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {entity360.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-base px-3 py-1">
                        {entity360.type}
                      </Badge>
                    </div>

                    {/* Balance Cards */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <Card className="bg-secondary/50">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs">
                              Total Credit (Owes Us)
                            </span>
                          </div>
                          <p className="text-xl font-mono font-semibold text-emerald-500">
                            {formatCurrency(entity360.total_credit, "KES")}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-secondary/50">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <TrendingDown className="h-4 w-4" />
                            <span className="text-xs">
                              Total Debit (We Owe)
                            </span>
                          </div>
                          <p className="text-xl font-mono font-semibold text-amber-500">
                            {formatCurrency(entity360.total_debit, "KES")}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-secondary/50">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Wallet className="h-4 w-4" />
                            <span className="text-xs">Net Balance</span>
                          </div>
                          <p
                            className={`text-xl font-mono font-semibold ${
                              entity360.net_balance >= 0
                                ? "text-emerald-500"
                                : "text-amber-500"
                            }`}
                          >
                            {formatCurrency(entity360.net_balance, "KES")}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="transactions">
                  <TabsList>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="phones">Linked Phones</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="transactions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Transaction History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {entity360.transactions?.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            No transactions yet
                          </p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-right">
                                  Amount
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {entity360.transactions?.map((tx) => (
                                <TableRow key={tx.id}>
                                  <TableCell className="text-muted-foreground">
                                    {formatDateTime(tx.transaction_date)}
                                  </TableCell>
                                  <TableCell>{tx.type}</TableCell>
                                  <TableCell>
                                    <StatusBadge status={tx.status} />
                                  </TableCell>
                                  <TableCell>
                                    <PaymentBadge status={tx.payment_status} />
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {formatCurrency(
                                      tx.total_amount,
                                      tx.currency_code,
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="phones" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Linked Phone Numbers
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add phone number..."
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                          />
                          <Button onClick={handleAddPhone} disabled={!newPhone}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {entity360.phone_number && (
                            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{entity360.phone_number}</span>
                                <Badge variant="secondary" className="text-xs">
                                  Primary
                                </Badge>
                              </div>
                            </div>
                          )}
                          {entity360.linked_phones?.map((phone) => (
                            <div
                              key={phone}
                              className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{phone}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRemovePhone(phone)}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                          {!entity360.phone_number &&
                            (!entity360.linked_phones ||
                              entity360.linked_phones.length === 0) && (
                              <p className="text-center text-muted-foreground py-4">
                                No phone numbers added
                              </p>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Notes & Communication Log
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {entity360.notes ? (
                          <p className="whitespace-pre-wrap">
                            {entity360.notes}
                          </p>
                        ) : (
                          <p className="text-center text-muted-foreground py-8">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            No notes yet
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
                <Users className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg">
                  Select a person to view their 360° profile
                </p>
              </div>
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
