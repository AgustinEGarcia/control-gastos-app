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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* 1. TARJETA TOTAL GASTOS DEL MES */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-3xl -mr-6 -mt-6 pointer-events-none" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Total Gastos del Mes
            </span>
            <span className="text-xs text-slate-400">Presupuesto</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1 tracking-tight">
            {formatMoney(summary.totalOwnToPay)}
          </div>
          <p className="text-xs text-slate-400">
            Compromisos propios de este mes
          </p>
        </div>
        <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 mt-3 space-y-1">
          <div className="flex justify-between">
            <span>Gastos Fijos:</span>
            <strong className="text-slate-200">{formatMoney(summary.totalRecurring)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Cuotas Propias:</span>
            <strong className="text-slate-200">{formatMoney(summary.totalInstallmentsOwn)}</strong>
          </div>
        </div>
      </div>

      {/* 2. TARJETA TOTAL YA PAGADO */}
      <div className="bg-slate-900/80 border border-emerald-950/60 rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/15 rounded-full blur-3xl -mr-6 -mt-6 pointer-events-none" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              ✓ Total Ya Pagado
            </span>
            <span className="text-xs text-emerald-400/80 font-medium">
              {summary.percentageCompleted}% cubierto
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mb-1 tracking-tight">
            {formatMoney(summary.paidOwnAmount)}
          </div>
          <p className="text-xs text-slate-400">
            {summary.paidCommitmentsCount} de {summary.totalCommitmentsCount} pagos abonados
          </p>
        </div>
        <div className="border-t border-slate-800/80 pt-2.5 mt-3">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${summary.percentageCompleted}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. TARJETA TOTAL PENDIENTE POR PAGAR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-3xl -mr-6 -mt-6 pointer-events-none" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${
              summary.pendingOwnAmount > 0
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            }`}>
              {summary.pendingOwnAmount > 0 ? '⏳ Pendiente por Pagar' : '🎉 Al Día'}
            </span>
            <span className="text-xs text-slate-400">Restante</span>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold mb-1 tracking-tight ${
            summary.pendingOwnAmount > 0 ? 'text-amber-300' : 'text-emerald-400'
          }`}>
            {formatMoney(summary.pendingOwnAmount)}
          </div>
          <p className="text-xs text-slate-400">
            {summary.pendingOwnAmount > 0
              ? 'Saldo que te resta abonar en el mes'
              : '¡Felicitaciones! Todo está saldado'}
          </p>
        </div>
        <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 mt-3 flex justify-between">
          <span>Estado general:</span>
          <strong className={summary.pendingOwnAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}>
            {summary.pendingOwnAmount > 0 ? 'Pagos pendientes' : '100% Cubierto'}
          </strong>
        </div>
      </div>

      {/* 4. TARJETA TOTAL A COBRAR A TERCEROS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-3xl -mr-6 -mt-6 pointer-events-none" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              A Cobrar a Terceros
            </span>
            <span className="text-xs text-slate-400">En la Calle</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-300 mb-1 tracking-tight">
            {formatMoney(totalPorCobrarGlobal)}
          </div>
          <p className="text-xs text-slate-400">
            Dinero que deben reintegrarte
          </p>
        </div>
        <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 mt-3 space-y-1">
          <div className="flex justify-between">
            <span>Cuotas compartidas mes:</span>
            <strong className="text-slate-200">{formatMoney(summary.totalSharedToCollect)}</strong>
          </div>
          {totalLentPending > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Dinero prestado:</span>
              <strong>{formatMoney(totalLentPending)}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
