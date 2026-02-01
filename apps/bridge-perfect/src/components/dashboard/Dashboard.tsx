import { useTransactionsStore, useAppStore, usePeopleStore } from "../../store";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import {
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
  Plus,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { format } from "date-fns";

export function Dashboard() {
  const { selectedDate, setCurrentScreen } = useAppStore();
  const { getDailySummary, getPendingCredit, getTransactionsByDate } =
    useTransactionsStore();
  const { getPeopleWithCredit } = usePeopleStore();

  const summary = getDailySummary(selectedDate);
  const pendingCredit = getPendingCredit();
  const todaysTransactions = getTransactionsByDate(selectedDate);
  const peopleWithCredit = getPeopleWithCredit();

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {format(selectedDate, "EEEE, MMMM do, yyyy")}
          </p>
        </div>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Revenue</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(summary.revenue)}
            </p>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Expenses</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(summary.expenses)}
            </p>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Profit</p>
            <p
              className={cn(
                "text-lg font-bold",
                summary.profit >= 0 ? "text-blue-600" : "text-red-600",
              )}
            >
              {formatCurrency(summary.profit)}
            </p>
          </div>
        </Card>
      </div>

      {/* Pending Credit Alerts */}
      {(pendingCredit.length > 0 || peopleWithCredit.length > 0) && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg shrink-0">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Credit Alerts</h3>
              {pendingCredit.length > 0 && (
                <p className="text-sm text-yellow-700 mt-1">
                  {pendingCredit.length} pending sale
                  {creditCountText(pendingCredit.length)} to collect
                </p>
              )}
              {peopleWithCredit.length > 0 && (
                <p className="text-sm text-yellow-700 mt-1">
                  {peopleWithCredit.length} person
                  {peopleCountText(peopleWithCredit.length)} with outstanding
                  credit
                </p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-yellow-700 hover:text-yellow-800"
                onClick={() => setCurrentScreen("people")}
              >
                View details →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => setCurrentScreen("add-transaction")}
          className="h-auto py-4 flex flex-col gap-2"
        >
          <Plus className="w-6 h-6" />
          <span>Quick Add</span>
        </Button>
        <Button
          variant="secondary"
          onClick={() => setCurrentScreen("people")}
          className="h-auto py-4 flex flex-col gap-2"
        >
          <Users className="w-6 h-6" />
          <span>People</span>
        </Button>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Today's Transactions</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen("transactions")}
          >
            View all →
          </Button>
        </div>

        {todaysTransactions.length === 0 ? (
          <Card className="py-8 text-center">
            <p className="text-gray-500">No transactions today</p>
            <Button
              variant="primary"
              onClick={() => setCurrentScreen("add-transaction")}
              className="mt-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {todaysTransactions.slice(0, 5).map((transaction) => (
              <Card
                key={transaction.id}
                className="flex items-center justify-between"
                onClick={() => {}}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {transaction.personName || transaction.type}
                  </p>
                </div>
                <div className="text-right">
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
                  {transaction.isCredit && (
                    <span className="text-xs text-yellow-600">Credit</span>
                  )}
                </div>
              </Card>
            ))}
            {todaysTransactions.length > 5 && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setCurrentScreen("transactions")}
              >
                +{todaysTransactions.length - 5} more transactions
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function creditCountText(count: number): string {
  return count === 1 ? "" : "s";
}

function peopleCountText(count: number): string {
  return count === 1 ? "" : "s";
}
