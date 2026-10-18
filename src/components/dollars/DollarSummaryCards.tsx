'use client';

import React from 'react';
import type { DollarSummary } from '@/lib/services/dollarPurchases';
import { formatMoneyArs, formatMoneyUsd } from '@/lib/services/dollarPurchases';

interface DollarSummaryCardsProps {
  summary: DollarSummary;
}

export function DollarSummaryCards({ summary }: DollarSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* TOTAL STOCK USD */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Stock Total
          </span>
          <span className="text-xs text-zinc-400 font-mono">Tenencia</span>
        </div>
        <div className="text-2xl font-bold font-mono text-emerald-400 mb-1 tracking-tight">
          {formatMoneyUsd(summary.totalUsd)}
        </div>
        <p className="text-xs text-zinc-400 font-mono mt-2">
          Dólares disponibles acumulados
        </p>
      </div>

      {/* COTIZACIÓN PROMEDIO PONDERADA */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            Costo Promedio
          </span>
          <span className="text-xs text-zinc-400 font-mono">Ponderado</span>
        </div>
        <div className="text-2xl font-bold font-mono text-white mb-1 tracking-tight">
          {summary.averageRate > 0 ? formatMoneyArs(summary.averageRate) : '—'}
        </div>
        <p className="text-xs text-zinc-400 font-mono mt-2">
          Promedio pagado por cada USD
        </p>
      </div>

      {/* TOTAL INVERTIDO EN ARS */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-zinc-300 bg-zinc-800/60 px-2 py-0.5 rounded-full border border-zinc-700/60">
            Capital Invertido
          </span>
          <span className="text-xs text-zinc-400 font-mono">Total Pesos</span>
        </div>
        <div className="text-2xl font-bold font-mono text-zinc-200 mb-1 tracking-tight">
          {formatMoneyArs(summary.totalArs)}
        </div>
        <p className="text-xs text-zinc-400 font-mono mt-2">
          Monto total en pesos desembolsado
        </p>
      </div>

      {/* OPERACIONES REGISTRADAS */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Operaciones
          </span>
          <span className="text-xs text-zinc-400 font-mono">Historial</span>
        </div>
        <div className="text-2xl font-bold font-mono text-amber-300 mb-1 tracking-tight">
          {summary.operationsCount}
          <span className="text-xs font-normal text-zinc-400 ml-2 font-sans">compras</span>
        </div>
        <p className="text-xs text-zinc-400 font-mono mt-2">
          Compras registradas en la cuenta
        </p>
      </div>
    </div>
  );
}
