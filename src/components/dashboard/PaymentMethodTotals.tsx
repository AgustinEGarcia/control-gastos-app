'use client';

import React from 'react';
import type { PaymentMethodMonthlyTotal } from '@/lib/services/dashboard';
import { formatCurrency } from '@/components/recurring-expenses/ExpenseSummaryCards';

interface Props {
  totals: PaymentMethodMonthlyTotal[];
  monthName: string;
}

export function PaymentMethodTotals({ totals, monthName }: Props) {
  if (!totals || totals.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <span>Totales por Método de Pago ({monthName})</span>
        </h2>
        <span className="text-xs font-mono text-zinc-500">
          {totals.length} {totals.length === 1 ? 'método' : 'métodos'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {totals.map((t) => (
          <div
            key={t.paymentMethodId}
            className="p-4 rounded-xl border bg-zinc-950 border-zinc-800/80 hover:border-zinc-700/80 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-medium text-zinc-300 truncate">
                  {t.name}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  t.totalAmount < 0
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}>
                  {t.totalAmount < 0 ? 'Crédito a favor' : 'Total'}
                </span>
              </div>

              <div className={`text-lg font-bold font-mono tracking-tight ${t.totalAmount < 0 ? 'text-emerald-400' : 'text-zinc-100'}`}>
                {formatCurrency(t.totalAmount)}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className={t.totalInstallments < 0 ? 'text-emerald-400 font-medium' : ''}>
                {t.totalInstallments !== 0
                  ? `Cuotas: ${formatCurrency(t.totalInstallments)}`
                  : 'Sin cuotas'}
              </span>
              <span>
                {t.totalRecurring > 0
                  ? `Fijos: ${formatCurrency(t.totalRecurring)}`
                  : 'Sin fijos'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
