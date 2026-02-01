"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEntities, createTransaction, createEntity } from "@/lib/api-client";
import { formatCurrency } from "@/lib/helpers";
import type {
  CreateTransactionInput,
  CreateTransactionLineInput,
  CreatePaymentInput,
  Entity,
  TransactionType,
  PaymentMethod,
  EntityType,
} from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Trash2, UserPlus, Search, CreditCard, X } from "lucide-react";
import { DEFAULT_TENANT_ID, DEFAULT_USER_ID } from "@/lib/api-client";

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: "RETAIL", label: "Retail Sale" },
  { value: "SERVICE", label: "Service" },
  { value: "RENTAL", label: "Rental" },
  { value: "EXPENSE", label: "Expense" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "MPESA", label: "M-Pesa" },
  { value: "BANK", label: "Bank Transfer" },
  { value: "CARD", label: "Card" },
  { value: "CREDIT", label: "Credit / Udhaari" },
  { value: "OTHER", label: "Other" },
];

export default function CreateTransactionPage() {
  const router = useRouter();
  const { data: entities, mutate: refreshEntities } = useEntities({
    tenant_id: DEFAULT_TENANT_ID,
  });

  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [entitySearch, setEntitySearch] = useState("");
  const [isCredit, setIsCredit] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [transactionType, setTransactionType] = useState<TransactionType>("RETAIL");
  const [reference, setReference] = useState("");
  const [context, setContext] = useState("");
  const [lines, setLines] = useState<CreateTransactionLineInput[]>([
    { description: "", quantity: 1, unit_price: 0, account_code: "SALES" },
  ]);
  const [payments, setPayments] = useState<CreatePaymentInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewEntityDialog, setShowNewEntityDialog] = useState(false);

  // New entity form
  const [newEntityName, setNewEntityName] = useState("");
  const [newEntityPhone, setNewEntityPhone] = useState("");
  const [newEntityType, setNewEntityType] = useState<EntityType>("CUSTOMER");

  const totalAmount = lines.reduce((sum, line) => sum + line.quantity * line.unit_price, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalAmount - totalPaid;

  const filteredEntities = entities?.filter((e) => {
    if (!entitySearch) return true;
    const search = entitySearch.toLowerCase();
    return (
      e.display_name.toLowerCase().includes(search) ||
      e.phone_number?.includes(search) ||
      e.linked_phones?.some((p) => p.includes(search))
    );
  });

  const addLine = () => {
    setLines([...lines, { description: "", quantity: 1, unit_price: 0, account_code: "SALES" }]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof CreateTransactionLineInput, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const addPayment = () => {
    setPayments([...payments, { method: "CASH", amount: remaining > 0 ? remaining : 0 }]);
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const updatePayment = (index: number, field: keyof CreatePaymentInput, value: any) => {
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    setPayments(newPayments);
  };

  const handleCreateEntity = async () => {
    if (!newEntityName) return;

    const entity = await createEntity({
      tenant_id: DEFAULT_TENANT_ID,
      created_by_user_id: DEFAULT_USER_ID,
      type: newEntityType,
      display_name: newEntityName,
      phone_number: newEntityPhone || undefined,
    });

    setSelectedEntity(entity);
    setShowNewEntityDialog(false);
    setNewEntityName("");
    setNewEntityPhone("");
    refreshEntities();
  };

  const handleSubmit = async () => {
    if (!selectedEntity) return;
    if (lines.length === 0 || lines.some((l) => !l.description)) return;

    setIsSubmitting(true);

    try {
      const data: CreateTransactionInput = {
        tenant_id: DEFAULT_TENANT_ID,
        created_by_user_id: DEFAULT_USER_ID,
        entity_id: selectedEntity.id,
        type: transactionType,
        currency_code: "KES",
        transaction_date: new Date().toISOString(),
        reference: reference || undefined,
        due_date: isCredit && dueDate ? new Date(dueDate).toISOString() : undefined,
        context: context || undefined,
        lines,
        payments: payments.length > 0 ? payments : undefined,
      };

      await createTransaction(data);
      router.push("/");
    } catch (error) {
      console.error("Failed to create transaction:", error);
      alert("Failed to create transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Transaction</h1>
        <p className="text-sm text-muted-foreground">Record a new sale, service, or expense</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Entity & Details */}
        <div className="space-y-6">
          {/* Entity Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer / Entity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEntity ? (
                <div className="p-3 bg-secondary rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{selectedEntity.display_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedEntity.phone_number}</p>
                      <Badge variant="outline" className="mt-1">
                        {selectedEntity.type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setSelectedEntity(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or phone..."
                      className="pl-9"
                      value={entitySearch}
                      onChange={(e) => setEntitySearch(e.target.value)}
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredEntities?.map((entity) => (
                      <button
                        key={entity.id}
                        className="w-full text-left p-2 rounded-md hover:bg-secondary transition-colors"
                        onClick={() => setSelectedEntity(entity)}
                      >
                        <p className="font-medium text-sm">{entity.display_name}</p>
                        <p className="text-xs text-muted-foreground">{entity.phone_number}</p>
                      </button>
                    ))}
                  </div>

                  <Dialog open={showNewEntityDialog} onOpenChange={setShowNewEntityDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add New Customer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            value={newEntityName}
                            onChange={(e) => setNewEntityName(e.target.value)}
                            placeholder="Customer name"
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
                        <Button
                          className="w-full"
                          onClick={handleCreateEntity}
                          disabled={!newEntityName}
                        >
                          Create Customer
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={transactionType}
                  onValueChange={(v: TransactionType) => setTransactionType(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reference (Optional)</Label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Invoice #, Receipt #, etc."
                />
              </div>

              <div className="space-y-2">
                <Label>Notes / Context</Label>
                <Textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Credit / Udhaari</Label>
                </div>
                <Switch checked={isCredit} onCheckedChange={setIsCredit} />
              </div>

              {isCredit && (
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Line Items & Payments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Line Items</CardTitle>
              <Button variant="outline" size="sm" onClick={addLine}>
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Description</TableHead>
                    <TableHead className="w-[15%]">Qty</TableHead>
                    <TableHead className="w-[25%]">Unit Price</TableHead>
                    <TableHead className="w-[15%]">Total</TableHead>
                    <TableHead className="w-[5%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={line.description}
                          onChange={(e) => updateLine(index, "description", e.target.value)}
                          placeholder="Item description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(index, "quantity", parseInt(e.target.value) || 0)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={line.unit_price}
                          onChange={(e) =>
                            updateLine(index, "unit_price", parseInt(e.target.value) || 0)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(line.quantity * line.unit_price, "KES")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeLine(index)}
                          disabled={lines.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end pt-4 border-t mt-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-mono font-semibold">{formatCurrency(totalAmount, "KES")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Split Payments */}
          {!isCredit && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Payments</CardTitle>
                <Button variant="outline" size="sm" onClick={addPayment}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Payment
                </Button>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No payments recorded. Add a payment or enable credit.
                  </p>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Method</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Select
                                value={payment.method}
                                onValueChange={(v: PaymentMethod) =>
                                  updatePayment(index, "method", v)
                                }
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PAYMENT_METHODS.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                      {m.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={payment.reference || ""}
                                onChange={(e) =>
                                  updatePayment(index, "reference", e.target.value)
                                }
                                placeholder="M-Pesa code, etc."
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={payment.amount}
                                onChange={(e) =>
                                  updatePayment(index, "amount", parseInt(e.target.value) || 0)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => removePayment(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="flex justify-end gap-8 pt-4 border-t mt-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="text-lg font-mono">{formatCurrency(totalPaid, "KES")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p
                          className={`text-lg font-mono ${remaining > 0 ? "text-amber-500" : "text-emerald-500"}`}
                        >
                          {formatCurrency(remaining, "KES")}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !selectedEntity ||
                lines.some((l) => !l.description) ||
                isSubmitting ||
                (!isCredit && remaining > 0 && payments.length === 0)
              }
            >
              {isSubmitting ? "Creating..." : "Create Transaction"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
