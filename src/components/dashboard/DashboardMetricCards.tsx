import React from 'react';
import type { MonthlyConsolidatedSummary } from '@/lib/services/dashboard';

interface DashboardMetricCardsProps {
  summary: MonthlyConsolidatedSummary;
  totalLentPending?: number;
}

export function DashboardMetricCards({
  summary,
  totalLentPending = 0,
}: DashboardMetricCardsProps) {
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const totalPorCobrarGlobal = summary.totalSharedToCollect + totalLentPending;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. TARJETA TOTAL GASTOS DEL MES */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-colors">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-medium tracking-wider uppercase text-zinc-300 bg-zinc-900 px-2.5 py-0.5 rounded border border-zinc-800">
              Total Gastos del Mes
            </span>
            <span className="text-xs text-zinc-500">Presupuesto</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 mb-1 tracking-tight">
            {formatMoney(summary.totalOwnToPay)}
          </div>
          <p className="text-xs text-zinc-400">
            Compromisos propios de este mes
          </p>
        </div>
        <div className="text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2.5 mt-3 space-y-1">
          <div className="flex justify-between">
            <span>Gastos Fijos:</span>
            <strong className="font-mono text-zinc-200">{formatMoney(summary.totalRecurring)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Cuotas Propias:</span>
            <strong className="font-mono text-zinc-200">{formatMoney(summary.totalInstallmentsOwn)}</strong>
          </div>
          {summary.totalVariable > 0 && (
            <div className="flex justify-between text-zinc-300">
              <span>Gastos Variables:</span>
              <strong className="font-mono">{formatMoney(summary.totalVariable)}</strong>
            </div>
          )}
        </div>
      </div>

      {/* 2. TARJETA TOTAL YA PAGADO */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-colors">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-medium tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              ✓ Total Ya Pagado
            </span>
            <span className="text-xs font-mono text-emerald-400/80">
              {summary.percentageCompleted}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mb-1 tracking-tight">
            {formatMoney(summary.paidOwnAmount)}
          </div>
          <p className="text-xs text-zinc-400">
            {summary.paidCommitmentsCount} de {summary.totalCommitmentsCount} pagos abonados
          </p>
        </div>
        <div className="border-t border-zinc-800/80 pt-2.5 mt-3">
          <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${summary.percentageCompleted}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. TARJETA TOTAL PENDIENTE POR PAGAR */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-colors">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-mono font-medium tracking-wider uppercase px-2.5 py-0.5 rounded border ${
              summary.pendingOwnAmount > 0
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            }`}>
              {summary.pendingOwnAmount > 0 ? '⏳ Pendiente por Pagar' : '✓ Al Día'}
            </span>
            <span className="text-xs text-zinc-500">Restante</span>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold font-mono mb-1 tracking-tight ${
            summary.pendingOwnAmount > 0 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {formatMoney(summary.pendingOwnAmount)}
          </div>
          <p className="text-xs text-zinc-400">
            {summary.pendingOwnAmount > 0
              ? 'Saldo que te resta abonar en el mes'
              : 'Todo cubierto para este mes'}
          </p>
        </div>
        <div className="text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2.5 mt-3 flex justify-between">
          <span>Estado:</span>
          <strong className={`font-mono ${summary.pendingOwnAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {summary.pendingOwnAmount > 0 ? 'Pendiente' : '100% Cubierto'}
          </strong>
        </div>
      </div>

      {/* 4. TARJETA TOTAL A COBRAR A TERCEROS */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-colors">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-medium tracking-wider uppercase text-zinc-300 bg-zinc-900 px-2.5 py-0.5 rounded border border-zinc-800">
              A Cobrar a Terceros
            </span>
            <span className="text-xs text-zinc-500">Por reintegrar</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 mb-1 tracking-tight">
            {formatMoney(totalPorCobrarGlobal)}
          </div>
          <p className="text-xs text-zinc-400">
            Dinero que deben reintegrarte
          </p>
        </div>
        <div className="text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2.5 mt-3 space-y-1">
          <div className="flex justify-between">
            <span>Cuotas compartidas mes:</span>
            <strong className="font-mono text-zinc-200">{formatMoney(summary.totalSharedToCollect)}</strong>
          </div>
          {totalLentPending > 0 && (
            <div className="flex justify-between text-zinc-300">
              <span>Dinero prestado:</span>
              <strong className="font-mono text-emerald-400">{formatMoney(totalLentPending)}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
