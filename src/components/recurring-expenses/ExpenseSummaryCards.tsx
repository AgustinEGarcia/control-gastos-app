'use client';

import React from 'react';
import type { ExpenseTotals } from '@/lib/services/recurringExpenses';

interface Props {
  totals: ExpenseTotals;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function ExpenseSummaryCards({ totals }: Props) {
  const isDiffPositive = totals.difference > 0;
  const isDiffNegative = totals.difference < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {/* Total Estimado */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-mono font-medium uppercase tracking-wider">Presupuesto Estimado</span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-zinc-100 font-mono tracking-tight">
          {formatCurrency(totals.totalEstimated)}
        </p>
        <span className="text-[11px] font-mono text-zinc-500 mt-1 block">
          {totals.countActive} gastos activos este mes
        </span>
      </div>

      {/* Total Real Facturado */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-mono font-medium uppercase tracking-wider">Total Facturado Real</span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono tracking-tight">
          {formatCurrency(totals.totalActual)}
        </p>
        <span className="text-[11px] font-mono text-zinc-500 mt-1 block">
          Actualizado con facturas recibidas
        </span>
      </div>

      {/* Variación / Diferencia */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-mono font-medium uppercase tracking-wider">Variación Presupuestaria</span>
        </div>
        <div className="flex items-baseline gap-2">
          <p
            className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
              isDiffPositive
                ? 'text-rose-400'
                : isDiffNegative
                ? 'text-emerald-400'
                : 'text-zinc-300'
            }`}
          >
            {isDiffPositive ? '+' : ''}
            {formatCurrency(totals.difference)}
          </p>
        </div>
        <span
          className={`text-[11px] font-mono mt-1 inline-block ${
            isDiffPositive
              ? 'text-rose-400'
              : isDiffNegative
              ? 'text-emerald-400'
              : 'text-zinc-500'
          }`}
        >
          {isDiffPositive
            ? '▲ Gasto real superior a lo proyectado'
            : isDiffNegative
            ? '▼ Ahorro respecto a lo proyectado'
            : 'Sin desvíos en lo presupuestado'}
        </span>
      </div>
    </div>
  );
}
