import React from 'react';
import type { DebtorsGlobalSummary } from '@/lib/services/debtors';

interface DebtorSummaryCardsProps {
  summary: DebtorsGlobalSummary;
}

export function DebtorSummaryCards({ summary }: DebtorSummaryCardsProps) {
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* TARJETA TOTAL A COBRAR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Total a Cobrar a Terceros
          </span>
          <span className="text-xs text-slate-400">
            {summary.activeDebtorsCount} deudor{summary.activeDebtorsCount !== 1 ? 'es' : ''} activo{summary.activeDebtorsCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-3xl font-bold text-amber-300 mb-2 tracking-tight">
          {formatMoney(summary.totalPendingToCollect)}
        </div>
        <p className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3 mt-3">
          <span>Consumo total prestado:</span>
          <strong className="text-slate-200">{formatMoney(summary.totalOriginalDebt)}</strong>
        </p>
      </div>

      {/* TARJETA TOTAL COBRADO */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Dinero Ya Recuperado
          </span>
          <span className="text-xs text-slate-400">
            {summary.paidOffDebtorsCount} saldado{summary.paidOffDebtorsCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-3xl font-bold text-emerald-400 mb-2 tracking-tight">
          {formatMoney(summary.totalCollected)}
        </div>
        <p className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3 mt-3">
          <span>Recuperación contable:</span>
          <strong className="text-emerald-400">
            {summary.totalOriginalDebt > 0
              ? Math.round((summary.totalCollected / summary.totalOriginalDebt) * 100)
              : 100}
            % completado
          </strong>
        </p>
      </div>

      {/* TARJETA TOTAL PERSONAS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Agenda de Deudores
          </span>
          <span className="text-xs text-slate-400">Portal Compartido</span>
        </div>
        <div className="text-3xl font-bold text-slate-100 mb-2 tracking-tight">
          {summary.totalPeopleCount}
          <span className="text-sm font-normal text-slate-400 ml-2">personas registradas</span>
        </div>
        <p className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3 mt-3">
          <span>Transparencia 360°:</span>
          <span className="text-indigo-400 font-medium">Link público para cada deudor</span>
        </p>
      </div>
    </div>
  );
}
