"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { transactionApi, entityApi, DEFAULT_TENANT_ID, DEFAULT_USER_ID } from "@/lib/api";
import { formatCurrency, toISODateString } from "@/lib/helpers";
import type {
  Entity,
  TransactionType,
  PaymentMethod,
  CreateTransactionLineInput,
  CreatePaymentInput,
} from "@/lib/types";
import {
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Save,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  AlertCircle,
} from "lucide-react";

interface LineItem extends CreateTransactionLineInput {
  tempId: string;
}

interface PaymentLine extends CreatePaymentInput {
  tempId: string;
}

const transactionTypes: { value: TransactionType; label: string; description: string }[] = [
  { value: "RETAIL", label: "Retail Sale", description: "Product sale to customer" },
  { value: "SERVICE", label: "Service", description: "Service provided to customer" },
  { value: "RENTAL", label: "Rental", description: "Asset rental to customer" },
  { value: "EXPENSE", label: "Expense", description: "Business expense (purchase)" },
  { value: "EXPENSE_RETURN", label: "Expense Return", description: "Return of bad goods to supplier" },
];

const currencies = ["KES", "USD", "NGN", "TZS", "UGX"];

const accountCodes = [
  { value: "200-SALES", label: "200-SALES (Sales Revenue)" },
  { value: "300-SERVICE", label: "300-SERVICE (Service Revenue)" },
  { value: "400-RENTAL", label: "400-RENTAL (Rental Revenue)" },
  { value: "500-EXPENSE", label: "500-EXPENSE (Business Expenses)" },
  { value: "510-COGS", label: "510-COGS (Cost of Goods Sold)" },
];

const paymentMethods: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "MPESA", label: "M-Pesa", icon: Smartphone },
  { value: "BANK", label: "Bank Transfer", icon: Building },
  { value: "CARD", label: "Card", icon: CreditCard },
  { value: "OTHER", label: "Other", icon: CreditCard },
];

export function CreateTransactionForm() {
  const router = useRouter();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [entityId, setEntityId] = useState("");
  const [type, setType] = useState<TransactionType>("RETAIL");
  const [transactionDate, setTransactionDate] = useState(toISODateString(new Date()));
  const [reference, setReference] = useState("");
  const [currencyCode, setCurrencyCode] = useState("KES");
  const [context, setContext] = useState(""); // Free-form notes for observation
  const [linkedTransactionId, setLinkedTransactionId] = useState(""); // For returns

  // Credit/Udhaari state
  const [isCredit, setIsCredit] = useState(false);
  const [dueDate, setDueDate] = useState("");

  // Line items
  const [lines, setLines] = useState<LineItem[]>([
    {
      tempId: crypto.randomUUID(),
      description: "",
      quantity: 1,
      unit_price: 0,
      sku: "",
      account_code: "200-SALES",
    },
  ]);

  // Payment records (split payments)
  const [payments, setPayments] = useState<PaymentLine[]>([]);

  useEffect(() => {
    async function fetchEntities() {
      try {
        const data = await entityApi.list();
        // Filter based on transaction type
        if (type === "EXPENSE" || type === "EXPENSE_RETURN") {
          setEntities(data.filter((e) => e.type === "SUPPLIER"));
        } else {
          setEntities(data.filter((e) => e.type === "CUSTOMER"));
        }
      } catch (error) {
        console.error("[v0] Failed to fetch entities:", error);
      } finally {
        setIsLoadingEntities(false);
      }
    }
    fetchEntities();
  }, [type]);

  // Update account codes when type changes
  useEffect(() => {
    const defaultAccount =
      type === "SERVICE"
        ? "300-SERVICE"
        : type === "RENTAL"
          ? "400-RENTAL"
          : type === "EXPENSE" || type === "EXPENSE_RETURN"
            ? "500-EXPENSE"
            : "200-SALES";

    setLines((prev) =>
      prev.map((line) => ({
        ...line,
        account_code: line.account_code.startsWith("200") || line.account_code.startsWith("300") || line.account_code.startsWith("400") || line.account_code.startsWith("500")
          ? defaultAccount
          : line.account_code,
      }))
    );
  }, [type]);

  const addLine = () => {
    const defaultAccount =
      type === "SERVICE"
        ? "300-SERVICE"
        : type === "RENTAL"
          ? "400-RENTAL"
          : type === "EXPENSE" || type === "EXPENSE_RETURN"
            ? "500-EXPENSE"
            : "200-SALES";

    setLines([
      ...lines,
      {
        tempId: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unit_price: 0,
        sku: "",
        account_code: defaultAccount,
      },
    ]);
  };

  const removeLine = (tempId: string) => {
    if (lines.length > 1) {
      setLines(lines.filter((line) => line.tempId !== tempId));
    }
  };

  const updateLine = (tempId: string, field: keyof LineItem, value: string | number) => {
    setLines(
      lines.map((line) => (line.tempId === tempId ? { ...line, [field]: value } : line))
    );
  };

  const calculateLineTotal = (line: LineItem) => {
    return line.quantity * line.unit_price;
  };

  const calculateTotal = () => {
    return lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
  };

  // Payment methods
  const addPayment = () => {
    setPayments([
      ...payments,
      {
        tempId: crypto.randomUUID(),
        method: "CASH",
        amount: 0,
        reference: "",
      },
    ]);
  };

  const removePayment = (tempId: string) => {
    setPayments(payments.filter((p) => p.tempId !== tempId));
  };

  const updatePayment = (tempId: string, field: keyof PaymentLine, value: string | number) => {
    setPayments(
      payments.map((p) => (p.tempId === tempId ? { ...p, [field]: value } : p))
    );
  };

  const calculateTotalPaid = () => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const handleSubmit = async () => {
    if (!entityId || lines.some((line) => !line.description || line.unit_price <= 0)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await transactionApi.create({
        tenant_id: DEFAULT_TENANT_ID,
        created_by_user_id: DEFAULT_USER_ID,
        entity_id: entityId,
        type,
        currency_code: currencyCode,
        transaction_date: transactionDate,
        reference: reference || undefined,
        linked_transaction_id: linkedTransactionId || undefined,
        due_date: isCredit && dueDate ? dueDate : undefined,
        context: context || undefined,
        lines: lines.map(({ description, quantity, unit_price, sku, account_code }) => ({
          description,
          quantity,
          unit_price,
          sku: sku || undefined,
          account_code,
        })),
        payments:
          payments.length > 0
            ? payments.map(({ method, amount, reference: ref }) => ({
                method,
                amount,
                reference: ref || undefined,
              }))
            : undefined,
      });
      router.push("/");
    } catch (error) {
      console.error("[v0] Failed to create transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setEntityId("");
    setType("RETAIL");
    setTransactionDate(toISODateString(new Date()));
    setReference("");
    setCurrencyCode("KES");
    setContext("");
    setLinkedTransactionId("");
    setIsCredit(false);
    setDueDate("");
    setLines([
      {
        tempId: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unit_price: 0,
        sku: "",
        account_code: "200-SALES",
      },
    ]);
    setPayments([]);
  };

  const isValid = entityId && lines.every((line) => line.description && line.unit_price > 0);
  const total = calculateTotal();
  const totalPaid = calculateTotalPaid();
  const remaining = total - totalPaid;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create Transaction</h1>
          <p className="text-muted-foreground">Record a new transaction with full details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Details */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex flex-col">
                          <span>{t.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer">
                  {type === "EXPENSE" || type === "EXPENSE_RETURN" ? "Supplier" : "Customer"} *
                </Label>
                <Select value={entityId} onValueChange={setEntityId} disabled={isLoadingEntities}>
                  <SelectTrigger id="customer">
                    <SelectValue
                      placeholder={isLoadingEntities ? "Loading..." : "Select..."}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        <div className="flex items-center gap-2">
                          <span>{entity.display_name}</span>
                          {entity.phone_number && (
                            <span className="text-muted-foreground text-xs font-mono">
                              {entity.phone_number}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  max={toISODateString(new Date())}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currencyCode} onValueChange={setCurrencyCode}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="INV-001, wa_me_12345, etc."
                />
              </div>

              {type === "EXPENSE_RETURN" && (
                <div className="space-y-2">
                  <Label htmlFor="linked">Linked Purchase ID</Label>
                  <Input
                    id="linked"
                    value={linkedTransactionId}
                    onChange={(e) => setLinkedTransactionId(e.target.value)}
                    placeholder="Original purchase transaction ID"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Line Items</CardTitle>
              <Button variant="outline" size="sm" onClick={addLine}>
                <Plus className="h-4 w-4 mr-1" />
                Add Line
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lines.map((line) => (
                  <div
                    key={line.tempId}
                    className="grid grid-cols-12 gap-3 items-end p-4 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="col-span-12 md:col-span-4 space-y-1">
                      <Label className="text-xs text-muted-foreground">Description *</Label>
                      <Input
                        value={line.description}
                        onChange={(e) => updateLine(line.tempId, "description", e.target.value)}
                        placeholder="Product or service name"
                      />
                    </div>

                    <div className="col-span-4 md:col-span-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(line.tempId, "quantity", parseInt(e.target.value) || 1)
                        }
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2 space-y-1">
                      <Label className="text-xs text-muted-foreground">Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        value={line.unit_price}
                        onChange={(e) =>
                          updateLine(line.tempId, "unit_price", parseInt(e.target.value) || 0)
                        }
                      />
                    </div>

                    {type === "RETAIL" && (
                      <div className="col-span-4 md:col-span-2 space-y-1">
                        <Label className="text-xs text-muted-foreground">SKU</Label>
                        <Input
                          value={line.sku}
                          onChange={(e) => updateLine(line.tempId, "sku", e.target.value)}
                          placeholder="SKU"
                        />
                      </div>
                    )}

                    <div className={`col-span-8 md:col-span-${type === "RETAIL" ? "2" : "4"} space-y-1`}>
                      <Label className="text-xs text-muted-foreground">Account</Label>
                      <Select
                        value={line.account_code}
                        onValueChange={(value) => updateLine(line.tempId, "account_code", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {accountCodes.map((ac) => (
                            <SelectItem key={ac.value} value={ac.value}>
                              {ac.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-4 md:col-span-1 flex items-center justify-end gap-2">
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Total</span>
                        <span className="font-mono text-sm font-medium">
                          {formatCurrency(calculateLineTotal(line), currencyCode)}
                        </span>
                      </div>
                      {lines.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeLine(line.tempId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods (Split Payments) */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Payment Methods</CardTitle>
                <CardDescription>
                  Add multiple payment methods for split payments (Cash + M-Pesa)
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addPayment} disabled={isCredit}>
                <Plus className="h-4 w-4 mr-1" />
                Add Payment
              </Button>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Banknote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No payments recorded yet</p>
                  <p className="text-xs">Add payment methods or mark as credit</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => {
                    const MethodIcon =
                      paymentMethods.find((m) => m.value === payment.method)?.icon || Banknote;
                    return (
                      <div
                        key={payment.tempId}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <MethodIcon className="h-5 w-5 text-emerald-400" />
                          </div>
                          <Select
                            value={payment.method}
                            onValueChange={(v) =>
                              updatePayment(payment.tempId, "method", v as PaymentMethod)
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {paymentMethods.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Amount"
                            value={payment.amount || ""}
                            onChange={(e) =>
                              updatePayment(
                                payment.tempId,
                                "amount",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-[120px]"
                          />
                          {(payment.method === "MPESA" || payment.method === "BANK") && (
                            <Input
                              placeholder={payment.method === "MPESA" ? "M-Pesa Code" : "Bank Ref"}
                              value={payment.reference || ""}
                              onChange={(e) =>
                                updatePayment(payment.tempId, "reference", e.target.value)
                              }
                              className="flex-1"
                            />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removePayment(payment.tempId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Context / Notes */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Context</CardTitle>
              <CardDescription>
                Free-form notes - delivery instructions, WhatsApp refs, agreements, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Deliver to Karen, Gate B. Customer will pay balance on Friday. wa_me_12345..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Credit Toggle */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Udhaari (Credit)</CardTitle>
                  <CardDescription>Customer pays later</CardDescription>
                </div>
                <Switch checked={isCredit} onCheckedChange={setIsCredit} />
              </div>
            </CardHeader>
            {isCredit && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={toISODateString(new Date())}
                  />
                </div>
                <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5" />
                    <p className="text-xs text-amber-400">
                      This will be recorded as a liability (money owed to you)
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{formatCurrency(total, currencyCode)}</span>
                </div>
                {payments.length > 0 && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Paid</span>
                      <span className="font-mono text-emerald-400">
                        -{formatCurrency(totalPaid, currencyCode)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                      <span className="text-muted-foreground">Remaining</span>
                      <span
                        className={`font-mono font-medium ${remaining > 0 ? "text-amber-400" : "text-emerald-400"}`}
                      >
                        {formatCurrency(remaining, currencyCode)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <p className="text-2xl font-bold">{formatCurrency(total, currencyCode)}</p>
              </div>

              {/* Status Preview */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">DRAFT</Badge>
                {isCredit && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                    CREDIT
                  </Badge>
                )}
                {payments.length > 0 && totalPaid > 0 && totalPaid < total && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    PARTIAL
                  </Badge>
                )}
                {payments.length > 0 && totalPaid >= total && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    PAID
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button onClick={handleSubmit} disabled={!isValid || isSubmitting} className="w-full">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save as Draft
            </Button>
            <Button variant="outline" onClick={handleClear} className="w-full bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Clear Form
            </Button>
            <Button variant="ghost" onClick={() => router.push("/")} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
