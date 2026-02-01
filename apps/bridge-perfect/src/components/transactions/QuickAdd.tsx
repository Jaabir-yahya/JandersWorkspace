import { useState } from "react";
import { useTransactionsStore, useAppStore, usePeopleStore } from "../../store";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Card } from "../common/Card";
import type { TransactionType, PaymentMethod } from "../../types";
import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

export function QuickAdd() {
  const { addTransaction } = useTransactionsStore();
  const { setCurrentScreen } = useAppStore();
  const { people, addPerson } = usePeopleStore();

  const [type, setType] = useState<TransactionType>("sale");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [personId, setPersonId] = useState<string>("");
  const [isCredit, setIsCredit] = useState(false);
  const [showNewPerson, setShowNewPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonPhone, setNewPersonPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) return;
    if (!description.trim()) return;

    setIsSubmitting(true);

    try {
      let finalPersonId = personId;
      let finalPersonName = "";

      // Create new person if needed
      if (showNewPerson && newPersonName.trim()) {
        const person = addPerson({
          name: newPersonName.trim(),
          phone: newPersonPhone.trim() || undefined,
          type:
            type === "sale"
              ? "customer"
              : type === "purchase"
                ? "supplier"
                : "other",
        });
        finalPersonId = person.id;
        finalPersonName = person.name;
      } else if (personId) {
        const person = people.find((p) => p.id === personId);
        finalPersonName = person?.name || "";
      }

      addTransaction({
        type,
        amount: parseFloat(amount),
        description: description.trim(),
        paymentMethod,
        personId: finalPersonId || undefined,
        personName: finalPersonName || undefined,
        isCredit: isCredit && !!finalPersonId,
      });

      // Reset form
      setAmount("");
      setDescription("");
      setPersonId("");
      setIsCredit(false);
      setShowNewPerson(false);
      setNewPersonName("");
      setNewPersonPhone("");

      // Navigate back
      setCurrentScreen("dashboard");
    } catch (error) {
      console.error("Failed to add transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "";
    return `KES ${num.toLocaleString()}`;
  };

  const typeOptions: { value: TransactionType; label: string; icon: string }[] =
    [
      { value: "sale", label: "Sale", icon: "💰" },
      { value: "expense", label: "Expense", icon: "💸" },
      { value: "purchase", label: "Purchase", icon: "📦" },
    ];

  const paymentOptions: { value: PaymentMethod; label: string }[] = [
    { value: "cash", label: "Cash" },
    { value: "mpesa", label: "M-Pesa" },
    { value: "credit", label: "Credit" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quick Add</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentScreen("dashboard")}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type */}
        <div className="grid grid-cols-3 gap-2">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setType(option.value);
                if (option.value === "expense") {
                  setIsCredit(false);
                }
              }}
              className={cn(
                "p-4 rounded-xl border-2 text-center transition-all min-h-[48px]",
                type === option.value
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
              )}
            >
              <span className="text-2xl block mb-1">{option.icon}</span>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <Card className="p-4 bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">
              KES
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-16 pr-4 py-4 text-3xl font-bold text-gray-900 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[48px]"
              min="0"
              step="0.01"
              required
            />
          </div>
          {amount && (
            <p className="text-sm text-gray-500 mt-2 text-right">
              {formatCurrency(amount)}
            </p>
          )}
        </Card>

        {/* Description */}
        <Input
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="What was this for?"
          className="min-h-[48px]"
        />

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {paymentOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setPaymentMethod(option.value);
                  if (option.value === "credit") {
                    setIsCredit(true);
                  }
                }}
                className={cn(
                  "py-3 px-4 rounded-lg border text-sm font-medium transition-colors min-h-[48px]",
                  paymentMethod === option.value
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer/Person Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {type === "sale"
              ? "Customer"
              : type === "purchase"
                ? "Supplier"
                : "Person"}{" "}
            (Optional)
          </label>

          {!showNewPerson ? (
            <>
              <select
                value={personId}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setShowNewPerson(true);
                    setPersonId("");
                  } else {
                    setPersonId(e.target.value);
                  }
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[48px]"
              >
                <option value="">Select a person...</option>
                {people
                  .filter((p) =>
                    type === "sale"
                      ? p.type === "customer" || p.type === "other"
                      : type === "purchase"
                        ? p.type === "supplier" || p.type === "other"
                        : true,
                  )
                  .map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                <option value="__new__">+ Add new person...</option>
              </select>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  New Person
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewPerson(false);
                    setNewPersonName("");
                    setNewPersonPhone("");
                  }}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Cancel
                </button>
              </div>
              <Input
                value={newPersonName}
                onChange={setNewPersonName}
                placeholder="Name"
              />
              <Input
                value={newPersonPhone}
                onChange={setNewPersonPhone}
                placeholder="Phone number"
                type="tel"
              />
            </div>
          )}
        </div>

        {/* Credit Toggle */}
        {personId && type !== "expense" && (
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="text-yellow-600">
                <span className="text-lg">⏰</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Credit</p>
                <p className="text-sm text-gray-500">Mark as unpaid</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCredit(!isCredit)}
              className={cn(
                "w-12 h-7 rounded-full transition-colors relative",
                isCredit ? "bg-green-500" : "bg-gray-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform",
                  isCredit ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!amount || !description.trim() || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            "Saving..."
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Save Transaction
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
