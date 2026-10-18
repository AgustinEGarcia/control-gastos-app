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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* TARJETA TOTAL A COBRAR */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Total a Cobrar a Terceros
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            {summary.activeDebtorsCount} deudor{summary.activeDebtorsCount !== 1 ? 'es' : ''} activo{summary.activeDebtorsCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-2xl font-bold font-mono text-amber-300 mb-2 tracking-tight">
          {formatMoney(summary.totalPendingToCollect)}
        </div>
        <p className="text-xs text-zinc-400 flex items-center justify-between border-t border-zinc-800/80 pt-2.5 mt-2.5 font-mono">
          <span>Consumo total prestado:</span>
          <strong className="text-zinc-300 font-medium">{formatMoney(summary.totalOriginalDebt)}</strong>
        </p>
      </div>

      {/* TARJETA TOTAL COBRADO */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Dinero Ya Recuperado
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            {summary.paidOffDebtorsCount} saldado{summary.paidOffDebtorsCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-2xl font-bold font-mono text-emerald-400 mb-2 tracking-tight">
          {formatMoney(summary.totalCollected)}
        </div>
        <p className="text-xs text-zinc-400 flex items-center justify-between border-t border-zinc-800/80 pt-2.5 mt-2.5 font-mono">
          <span>Recuperación contable:</span>
          <strong className="text-emerald-400 font-medium">
            {summary.totalOriginalDebt > 0
              ? Math.round((summary.totalCollected / summary.totalOriginalDebt) * 100)
              : 100}
            % completado
          </strong>
        </p>
      </div>

      {/* TARJETA TOTAL PERSONAS */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-zinc-300 bg-zinc-800/60 px-2 py-0.5 rounded-full border border-zinc-700/60">
            Agenda de Deudores
          </span>
          <span className="text-xs text-zinc-400 font-mono">Portal Compartido</span>
        </div>
        <div className="text-2xl font-bold font-mono text-white mb-2 tracking-tight">
          {summary.totalPeopleCount}
          <span className="text-xs font-normal text-zinc-400 ml-2 font-sans">personas registradas</span>
        </div>
        <p className="text-xs text-zinc-400 flex items-center justify-between border-t border-zinc-800/80 pt-2.5 mt-2.5 font-mono">
          <span>Transparencia:</span>
          <span className="text-zinc-300">Link público por deudor</span>
        </p>
      </div>
    </div>
  );
}
