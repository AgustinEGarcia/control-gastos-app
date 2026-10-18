'use client';

import React from 'react';
import type { SubscriptionSummary } from '@/lib/services/subscriptions';
import { formatSubscriptionCurrency } from '@/lib/services/subscriptions';

interface SubscriptionSummaryCardsProps {
  summary: SubscriptionSummary;
}

export function SubscriptionSummaryCards({ summary }: SubscriptionSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* TOTAL ESTIMADO MENSUAL ARS */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Total Mensual
          </span>
          <span className="text-xs text-zinc-400 font-mono">Pesos ARS</span>
        </div>
        <div className="text-2xl font-bold font-mono text-emerald-400 mb-1 tracking-tight">
          {formatSubscriptionCurrency(summary.totalMonthlyArs, 'ARS')}
        </div>
        <p className="text-xs text-zinc-400 font-mono mt-2">
          Gasto estimado por mes en pesos
        </p>
      </div>

      {/* TOTAL ESTIMADO MENSUAL USD */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            Total en Dólares
          </span>
          <span className="text-xs text-zinc-400 font-mono">Dólares USD</span>
        </div>
        <div className="text-2xl font-bold font-mono text-white mb-1 tracking-tight">
          {summary.totalMonthlyUsd > 0
            ? formatSubscriptionCurrency(summary.totalMonthlyUsd, 'USD')
            : 'US$ 0.00'}
        </div>
        <p className="text-xs text-zinc-400 font-mono mt-2">
          Servicios en moneda extranjera
        </p>
      </div>

      {/* ACTIVAS VS PAUSADAS */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-zinc-300 bg-zinc-800/60 px-2 py-0.5 rounded-full border border-zinc-700/60">
            Suscripciones
          </span>
          <span className="text-xs text-zinc-400 font-mono">{summary.totalCount} registradas</span>
        </div>
        <div className="text-2xl font-bold font-mono text-zinc-200 mb-1 tracking-tight">
          {summary.activeCount} <span className="text-xs font-normal text-zinc-400 font-sans">activas</span>
          {summary.pausedCount > 0 && (
            <span className="text-xs font-normal text-zinc-500 ml-2 font-mono">
              ({summary.pausedCount} pausadas)
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 font-mono mt-2">
          Servicios sumando al cálculo
        </p>
      </div>

      {/* PRÓXIMO DÉBITO */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Próximo Débito
          </span>
          <span className="text-xs text-zinc-400 font-mono">Calendario</span>
        </div>
        <div className="text-sm font-semibold text-white mb-1 truncate">
          {summary.nextBillingItem ? summary.nextBillingItem.name : 'Sin cobros'}
        </div>
        <p className="text-xs text-zinc-400 font-mono mt-1">
          {summary.nextBillingItem
            ? `Día ${summary.nextBillingItem.billing_day} • ${formatSubscriptionCurrency(
                summary.nextBillingItem.amount,
                summary.nextBillingItem.currency
              )}`
            : 'No hay servicios activos'}
        </p>
      </div>
    </div>
  );
}
