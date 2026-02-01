"use client";

import { useState } from "react";
import { QuickAddTransaction } from "@/components/QuickAddTransaction";
import { VoiceRecording } from "@/components/VoiceRecording";
import { FeatureGate } from "@/components/FeatureGate";
import { useTenant } from "@/context/TenantContext";
import { Transaction } from "@/types";

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<"add" | "list">("add");
  const { tenant, isLoading, error } = useTenant();

  const handleTransactionAdd = (
    transaction: Omit<Transaction, "id" | "timestamp">,
  ) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleVoiceTranscript = (text: string) => {
    // Parse voice input like "Kes 500 mboga maize"
    const amountMatch = text.match(/Kes\s+(\d+)/i);
    const descriptionMatch = text.match(/mboga\s+(.+)/i);

    if (amountMatch && descriptionMatch) {
      const amount = parseInt(amountMatch[1]);
      const description = descriptionMatch[1];

      handleTransactionAdd({
        amount,
        description,
        type: "sale",
        currency: "KES",
        method: "cash",
        category: "Agriculture",
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Unable to load tenant
          </h2>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-red-500 mt-2">
            Please check your URL or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Tab Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("add")}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "add"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Add Transaction
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "list"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Today's Sales ({transactions.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {activeTab === "add" ? (
          <div className="space-y-6">
            {/* Quick Add - Available to all tiers */}
            <FeatureGate feature="manual_transactions">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Quick Add
                </h2>
                <QuickAddTransaction onAdd={handleTransactionAdd} />
              </div>
            </FeatureGate>

            {/* Voice Recording - Available to all tiers */}
            <FeatureGate feature="manual_transactions">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Voice Recording
                </h2>
                <VoiceRecording onTranscript={handleVoiceTranscript} />
              </div>
            </FeatureGate>

            {/* M-Pesa Integration - Enterprise only */}
            <FeatureGate
              feature="mpesa_integration"
              fallback={
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    M-Pesa Auto-Sync
                  </h3>
                  <p className="text-sm text-purple-700">
                    Upgrade to automatically sync M-Pesa transactions.
                  </p>
                </div>
              }
            >
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  M-Pesa Integration
                </h2>
                <p className="text-gray-600">
                  Your M-Pesa transactions are automatically synced.
                </p>
              </div>
            </FeatureGate>

            {/* WhatsApp Integration - Enterprise only */}
            <FeatureGate
              feature="whatsapp_integration"
              fallback={
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    WhatsApp Business
                  </h3>
                  <p className="text-sm text-purple-700">
                    Upgrade to send invoices via WhatsApp.
                  </p>
                </div>
              }
            >
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  WhatsApp Integration
                </h2>
                <p className="text-gray-600">
                  Send invoices and receive payments via WhatsApp.
                </p>
              </div>
            </FeatureGate>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 p-6 border-b">
              Today's Transactions
            </h2>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No transactions today. Start by adding one above!
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`p-4 border-l-4 ${
                      transaction.type === "sale"
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        {transaction.category && (
                          <p className="text-sm text-gray-500">
                            Category: {transaction.category}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {transaction.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold">
                          {transaction.type === "sale" ? "+" : "-"}KES{" "}
                          {transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 uppercase">
                          {transaction.method}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
