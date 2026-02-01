'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, ShoppingCart } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());
import { Transaction, DailySummary } from '../types';

export default function Dashboard() {
  // Apply Vercel best practices: SWR for automatic deduplication
  const { data: transactions, error, isLoading } = useSWR<Transaction[]>('/transactions', fetcher);

  // Apply Vercel best practices: derived state subscriptions
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Calculate daily summary with proper typing
  const calculateDailySummary = (date: string, transactionList: Transaction[] = []): DailySummary => {
    const todayTransactions = transactionList.filter(t => 
      t.timestamp.toISOString().startsWith(date)
    );

    if (todayTransactions.length === 0) {
      return {
        date,
        totalSales: 0,
        totalExpenses: 0,
        transactionCount: 0,
        topCategories: [],
        currency: 'KES',
      };
    }

    const sales = todayTransactions
      .filter((t: Transaction) => t.type === 'sale')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = todayTransactions
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<string, number>();
    todayTransactions.forEach((t: Transaction) => {
      const category = t.category || 'Other';
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + t.amount);
    });

    const topCategories = Array.from(categoryMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name);

    return {
      date,
      totalSales: sales,
      totalExpenses: expenses,
      transactionCount: todayTransactions.length,
      topCategories,
      currency: 'KES',
    };
  };

  const [summary, setSummary] = useState<DailySummary | null>(() => 
    calculateDailySummary(selectedDate, transactions || [])
  );

  // Apply Vercel best practices: effect dependencies minimization
  useEffect(() => {
    setSummary(calculateDailySummary(selectedDate, transactions || []));
  }, [selectedDate, transactions]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-600">Unable to load transactions. Please try again.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Date Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              max={today}
            />
          </div>
        </div>

        {summary && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Today's Sales</h3>
                  {summary.totalSales > 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <p className="text-3xl font-bold text-green-600">KES {summary.totalSales.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Today's Expenses</h3>
                  {summary.totalExpenses > 0 ? (
                    <TrendingUp className="h-6 w-6 text-red-600 rotate-180" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <p className="text-3xl font-bold text-red-600">KES {summary.totalExpenses.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Net Profit</h3>
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">KES {(summary.totalSales - summary.totalExpenses).toLocaleString()}</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                <span className="text-sm text-gray-500">{summary.transactionCount} today</span>
              </div>

              <div className="space-y-4">
                {transactions?.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`border-l-4 p-4 rounded-r-lg ${
                      transaction.type === 'sale' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {transaction.type === 'sale' ? '+' : '-'}KES {transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.method}</p>
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-gray-500 py-8">No transactions today</p>
                )}
              </div>
            </div>

            {/* Top Categories */}
            {summary.topCategories.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Top Categories</h2>
                <div className="space-y-3">
                  {summary.topCategories.map((category, index) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-green-500' : 
                          index === 2 ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {(() => {
                          const catMap = new Map();
                          transactions?.forEach(t => {
                            const cat = t.category || 'Other';
                            catMap.set(cat, (catMap.get(cat) || 0) + 1);
                          });
                          const count = catMap.get(category) || 0;
                          const total = transactions?.length || 1;
                          const percentage = Math.round((count / total) * 100);
                          return `${percentage}%`;
                        })()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}