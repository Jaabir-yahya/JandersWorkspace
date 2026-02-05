'use client';

import { formatCurrency } from '@/lib/utils';
import type { LedgerEntry, Currency } from '@/lib/types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface LedgerPreviewProps {
  entries: LedgerEntry[];
  currency: Currency;
  title?: string;
}

export function LedgerPreview({ entries, currency, title = 'Ledger Preview' }: LedgerPreviewProps) {
  const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="ledger-preview animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-baobab-800 flex items-center">
          <span className="w-1 h-6 bg-acacia-600 mr-3 rounded-full"></span>
          {title}
        </h3>
        {isBalanced ? (
          <div className="flex items-center text-sm text-acacia-700">
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Balanced
          </div>
        ) : (
          <div className="flex items-center text-sm text-clay-700">
            <AlertCircle className="h-4 w-4 mr-1.5" />
            Not Balanced
          </div>
        )}
      </div>

      {/* Entries Table */}
      {entries.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-baobab-300 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-baobab-100 text-baobab-700 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">Account</th>
                <th className="px-4 py-3 text-right font-semibold">Debit</th>
                <th className="px-4 py-3 text-right font-semibold">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-baobab-200">
              {entries.map((entry, index) => (
                <tr key={index} className="hover:bg-savanna-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-baobab-900">{entry.accountName}</div>
                    <div className="text-xs text-baobab-500">{entry.accountCode}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {entry.debit > 0 ? (
                      <span className="text-baobab-900 font-semibold">
                        {formatCurrency(entry.debit, currency)}
                      </span>
                    ) : (
                      <span className="text-baobab-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {entry.credit > 0 ? (
                      <span className="text-baobab-900 font-semibold">
                        {formatCurrency(entry.credit, currency)}
                      </span>
                    ) : (
                      <span className="text-baobab-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-savanna-100 border-t-2 border-baobab-300">
              <tr className="font-bold">
                <td className="px-4 py-3 text-baobab-800">Total</td>
                <td className="px-4 py-3 text-right font-mono text-baobab-900">
                  {formatCurrency(totalDebit, currency)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-baobab-900">
                  {formatCurrency(totalCredit, currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-baobab-500">
          <p>No ledger entries yet</p>
          <p className="text-sm mt-1">Fill in the form above to see the accounting entries</p>
        </div>
      )}

      {/* Balance Check */}
      {entries.length > 0 && (
        <div className={`mt-4 p-3 rounded-lg ${isBalanced ? 'bg-acacia-50 border border-acacia-200' : 'bg-clay-50 border border-clay-200'}`}>
          <div className="flex items-center justify-between text-sm">
            <span className={isBalanced ? 'text-acacia-800' : 'text-clay-800'}>
              {isBalanced ? '✓ Transaction is balanced and ready to post' : '⚠ Debits and credits must be equal'}
            </span>
            {!isBalanced && (
              <span className="font-mono font-bold text-clay-700">
                Difference: {formatCurrency(Math.abs(totalDebit - totalCredit), currency)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
