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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* TARJETA DEUDA ARS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Deuda en Pesos (ARS)
          </span>
          <span className="text-xs text-slate-400">
            {summary.ARS.activeCount} activo{summary.ARS.activeCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-3xl font-bold text-white mb-2 tracking-tight">
          {formatMoney(summary.ARS.remainingBalance, 'ARS')}
        </div>
        <p className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3 mt-3">
          <span>Amortizado: <strong className="text-emerald-400">{formatMoney(summary.ARS.totalRepaid, 'ARS')}</strong></span>
          <span>Inicial: {formatMoney(summary.ARS.totalInitial, 'ARS')}</span>
        </p>
      </div>

      {/* TARJETA DEUDA USD */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Deuda en Dólares (USD)
          </span>
          <span className="text-xs text-slate-400">
            {summary.USD.activeCount} activo{summary.USD.activeCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-3xl font-bold text-emerald-300 mb-2 tracking-tight">
          {formatMoney(summary.USD.remainingBalance, 'USD')}
        </div>
        <p className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3 mt-3">
          <span>Amortizado: <strong className="text-emerald-400">{formatMoney(summary.USD.totalRepaid, 'USD')}</strong></span>
          <span>Inicial: {formatMoney(summary.USD.totalInitial, 'USD')}</span>
        </p>
      </div>

      {/* TARJETA CONTEO Y ESTADO */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden md:col-span-2 lg:col-span-1">
        <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Liquidaciones & Progreso
          </span>
          <span className="text-xs text-slate-400">Total: {summary.totalLoansCount}</span>
        </div>
        <div className="text-3xl font-bold text-slate-200 mb-2 tracking-tight">
          {summary.ARS.paidOffCount + summary.USD.paidOffCount}
          <span className="text-sm font-normal text-slate-400 ml-2">préstamos saldados</span>
        </div>
        <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-3 mt-3 flex items-center justify-between">
          <span>Total Activos: <strong className="text-amber-400">{summary.ARS.activeCount + summary.USD.activeCount}</strong></span>
          <span className="text-emerald-400">Multi-divisa 360°</span>
        </div>
      </div>
    </div>
  );
}
