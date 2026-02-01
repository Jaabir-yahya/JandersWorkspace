"use client";

import { useState, useCallback } from "react";
import { DollarSign, Plus, X } from "lucide-react";
import { Transaction } from "../types";

interface QuickAddTransactionProps {
  onAdd: (
    transaction: Omit<Transaction, "id" | "created_at" | "updated_at">,
  ) => void;
  className?: string;
}

export const QuickAddTransaction = ({
  onAdd,
  className,
}: QuickAddTransactionProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"sale" | "expense">("sale");

  // Apply Vercel best practice: useCallback for stable references
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const numAmount = parseFloat(amount);
      if (!numAmount || !description.trim()) {
        return;
      }

      onAdd({
        amount: numAmount,
        description: description.trim(),
        type,
        currency: "KES",
        method: "cash",
        timestamp: new Date(),
      });

      // Reset form (efficient state update)
      setAmount("");
      setDescription("");
    },
    [amount, description, type, onAdd],
  );

  const handleQuickAmount = useCallback((value: number) => {
    setAmount(value.toString());
  }, []);

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type - Large touch targets */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setType("sale")}
            className={`flex-1 py-4 px-6 rounded-lg font-medium transition-colors ${
              type === "sale"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <Plus className="h-5 w-5" />
            <span className="ml-2">Sale</span>
          </button>
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`flex-1 py-4 px-6 rounded-lg font-medium transition-colors ${
              type === "expense"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <X className="h-5 w-5" />
            <span className="ml-2">Expense</span>
          </button>
        </div>

        {/* Amount Input - Large for mobile */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-4xl text-gray-500">KES</span>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-5xl font-bold p-4 pl-16 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: "2rem", height: "80px" }}
          />
        </div>

        {/* Description Input */}
        <textarea
          placeholder="What did you sell or buy?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-4 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          style={{ fontSize: "1.25rem" }}
        />

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[100, 200, 500, 1000].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleQuickAmount(value)}
              className="py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-medium transition-colors"
            >
              {value}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!amount || !description.trim()}
          className="w-full py-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xl font-bold rounded-lg transition-colors"
        >
          <DollarSign className="h-6 w-6" />
          <span className="ml-2">Add Transaction</span>
        </button>
      </form>
    </div>
  );
};
