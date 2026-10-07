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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* TARJETA TOTAL A PAGAR PROPIO */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            A Pagar de tu Bolsillo
          </span>
          <span className="text-xs text-slate-400">Mes Corriente</span>
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
          {formatMoney(summary.totalOwnToPay)}
        </div>
        <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-3 mt-3 space-y-1">
          <div className="flex justify-between">
            <span>Gastos Fijos:</span>
            <strong className="text-slate-200">{formatMoney(summary.totalRecurring)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Cuotas Propias en Tarjetas:</span>
            <strong className="text-slate-200">{formatMoney(summary.totalInstallmentsOwn)}</strong>
          </div>
        </div>
      </div>

      {/* TARJETA TOTAL A COBRAR A TERCEROS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            A Cobrar a Terceros
          </span>
          <span className="text-xs text-slate-400">Total en la Calle</span>
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 mb-2 tracking-tight">
          {formatMoney(totalPorCobrarGlobal)}
        </div>
        <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-3 mt-3 space-y-1">
          <div className="flex justify-between">
            <span>Cuotas compartidas del mes:</span>
            <strong className="text-slate-200">{formatMoney(summary.totalSharedToCollect)}</strong>
          </div>
          {totalLentPending > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Dinero prestado (a término abierto):</span>
              <strong>{formatMoney(totalLentPending)}</strong>
            </div>
          )}
        </div>
      </div>

      {/* TARJETA PROGRESO Y COMPROMISOS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Cumplimiento del Mes
          </span>
          <span className="text-xs text-slate-400">
            {summary.paidCommitmentsCount}/{summary.totalCommitmentsCount} pagos
          </span>
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-2 tracking-tight">
          {summary.percentageCompleted}%
          <span className="text-sm font-normal text-slate-400 ml-2">cubierto</span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-slate-800 rounded-full h-2 my-2 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${summary.percentageCompleted}%` }}
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
          <span>Abonado: <strong className="text-emerald-400">{formatMoney(summary.paidCommitmentsAmount)}</strong></span>
          <span>Pendiente: <strong className="text-slate-300">{formatMoney(summary.pendingCommitmentsAmount)}</strong></span>
        </div>
      </div>
    </div>
  );
}
