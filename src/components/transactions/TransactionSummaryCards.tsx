'use client';

import React from 'react';
import type { TransactionSummaries } from '@/lib/services/transactions';
import { formatCurrency } from '@/components/recurring-expenses/ExpenseSummaryCards';

interface Props {
  summaries: TransactionSummaries;
}

export function TransactionSummaryCards({ summaries }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {/* Total Propio Pendiente */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Mis Cuotas Pendientes</span>
          <span className="text-base">💳</span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
          {formatCurrency(summaries.totalPendingOwn)}
        </p>
        <span className="text-[11px] text-zinc-500 mt-1 block">
          Total por pagar de consumos propios
        </span>
      </div>

      {/* A Cobrar a Terceros */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">A Cobrar a Terceros</span>
          <span className="text-base">🤝</span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-cyan-400 font-mono tracking-tight">
          {formatCurrency(summaries.totalPendingToCollect)}
        </p>
        <span className="text-[11px] text-zinc-500 mt-1 block">
          Compras prestadas a amigos o familiares
        </span>
      </div>

      {/* Total Financiado */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Financiado Global</span>
          <span className="text-base">📈</span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono tracking-tight">
          {formatCurrency(summaries.totalFinanced)}
        </p>
        <span className="text-[11px] text-zinc-500 mt-1 block">
          {summaries.countTransactions} compras registradas en cuotas
        </span>
      </div>
    </div>
  );
}
