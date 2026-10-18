import React from 'react';
import type { LoansSummaryResult } from '@/lib/services/loans';

interface LoanSummaryCardsProps {
  summary: LoansSummaryResult;
}

export function LoanSummaryCards({ summary }: LoanSummaryCardsProps) {
  const formatMoney = (val: number, currency: 'ARS' | 'USD') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'ARS',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {/* TARJETA DEUDA ARS */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono font-medium tracking-wider uppercase text-zinc-300 bg-zinc-900 px-2.5 py-0.5 rounded border border-zinc-800">
            Deuda en Pesos (ARS)
          </span>
          <span className="text-xs font-mono text-zinc-500">
            {summary.ARS.activeCount} activo{summary.ARS.activeCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 mb-2 tracking-tight">
          {formatMoney(summary.ARS.remainingBalance, 'ARS')}
        </div>
        <p className="text-xs font-mono text-zinc-400 flex items-center justify-between border-t border-zinc-800/80 pt-3 mt-3">
          <span>Amortizado: <strong className="text-emerald-400">{formatMoney(summary.ARS.totalRepaid, 'ARS')}</strong></span>
          <span>Inicial: {formatMoney(summary.ARS.totalInitial, 'ARS')}</span>
        </p>
      </div>

      {/* TARJETA DEUDA USD */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono font-medium tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            Deuda en Dólares (USD)
          </span>
          <span className="text-xs font-mono text-zinc-500">
            {summary.USD.activeCount} activo{summary.USD.activeCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mb-2 tracking-tight">
          {formatMoney(summary.USD.remainingBalance, 'USD')}
        </div>
        <p className="text-xs font-mono text-zinc-400 flex items-center justify-between border-t border-zinc-800/80 pt-3 mt-3">
          <span>Amortizado: <strong className="text-emerald-400">{formatMoney(summary.USD.totalRepaid, 'USD')}</strong></span>
          <span>Inicial: {formatMoney(summary.USD.totalInitial, 'USD')}</span>
        </p>
      </div>

      {/* TARJETA CONTEO Y ESTADO */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors md:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono font-medium tracking-wider uppercase text-zinc-300 bg-zinc-900 px-2.5 py-0.5 rounded border border-zinc-800">
            Liquidaciones & Progreso
          </span>
          <span className="text-xs font-mono text-zinc-500">Total: {summary.totalLoansCount}</span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 mb-2 tracking-tight">
          {summary.ARS.paidOffCount + summary.USD.paidOffCount}
          <span className="text-xs font-normal text-zinc-500 ml-2">préstamos saldados</span>
        </div>
        <div className="text-xs font-mono text-zinc-400 border-t border-zinc-800/80 pt-3 mt-3 flex items-center justify-between">
          <span>Total Activos: <strong className="text-amber-400">{summary.ARS.activeCount + summary.USD.activeCount}</strong></span>
          <span className="text-zinc-500">Multi-divisa 360°</span>
        </div>
      </div>
    </div>
  );
}
