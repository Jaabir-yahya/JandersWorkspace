import { useTransactionsStore } from "../../store";
import { Card } from "../common/Card";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { useState, useMemo } from "react";
import type { Transaction } from "../../types";

export function TransactionList() {
  const { transactions } = useTransactionsStore();
  const [filterType, setFilterType] = useState<string>("all");

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const filtered =
      filterType === "all"
        ? transactions
        : transactions.filter((t) => t.type === filterType);

    // Sort by date descending
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Group by date
    const grouped = sorted.reduce(
      (acc, transaction) => {
        const dateKey = format(new Date(transaction.date), "yyyy-MM-dd");
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: new Date(transaction.date),
            transactions: [],
          };
        }
        acc[dateKey].transactions.push(transaction);
        return acc;
      },
      {} as Record<string, { date: Date; transactions: Transaction[] }>,
    );

    return Object.values(grouped);
  }, [transactions, filterType]);

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Today";
    }
    if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
      return "Yesterday";
    }
    return format(date, "EEEE, MMMM do, yyyy");
  };

  const getTransactionIcon = (type: Transaction["type"]) => {
    const icons: Record<string, string> = {
      sale: "💰",
      expense: "💸",
      purchase: "📦",
      income: "💵",
      refund: "↩️",
    };
    return icons[type] || "💰";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: "all", label: "All" },
          { value: "sale", label: "Sales" },
          { value: "expense", label: "Expenses" },
          { value: "purchase", label: "Purchases" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterType(option.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap min-h-[48px]",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
              filterType === option.value
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Transactions by Date */}
      {groupedTransactions.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-gray-500 text-lg">
            {filterType === "all"
              ? "No transactions yet"
              : `No ${filterType} transactions`}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Start by adding a new transaction
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map((group) => (
            <div key={format(group.date, "yyyy-MM-dd")}>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 px-1">
                {formatDate(group.date)}
              </h3>
              <div className="space-y-2">
                {group.transactions.map((transaction) => (
                  <Card
                    key={transaction.id}
                    className="flex items-start gap-3"
                    onClick={() => {}}
                  >
                    <div className="text-2xl shrink-0">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {transaction.description}
                          </p>
                          {transaction.personName && (
                            <p className="text-sm text-gray-500">
                              {transaction.personName}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className={cn(
                              "font-semibold",
                              transaction.type === "sale" ||
                                transaction.type === "income"
                                ? "text-green-600"
                                : "text-red-600",
                            )}
                          >
                            {transaction.type === "sale" ||
                            transaction.type === "income"
                              ? "+"
                              : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <div className="flex items-center gap-1 justify-end mt-1">
                            {transaction.isCredit && (
                              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                                Credit
                              </span>
                            )}
                            <span className="text-xs text-gray-400 capitalize">
                              {transaction.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
