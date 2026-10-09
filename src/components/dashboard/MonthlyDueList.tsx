'use client';

import React, { useState } from 'react';
import type { MonthlyDueItem } from '@/lib/services/dashboard';

interface MonthlyDueListProps {
  items: MonthlyDueItem[];
  monthName: string;
  onTogglePaid?: (item: MonthlyDueItem) => Promise<void> | void;
  togglingId?: string | null;
}

export function MonthlyDueList({
  items,
  monthName,
  onTogglePaid,
  togglingId,
}: MonthlyDueListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'recurring' | 'own' | 'shared'>('all');

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'pending') return !item.isPaid;
    if (filter === 'paid') return item.isPaid;
    if (filter === 'recurring') return item.type === 'recurring';
    if (filter === 'own') return item.type === 'installment_own';
    if (filter === 'shared') return item.type === 'installment_shared';
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>📅</span>
            <span>Cronograma de Vencimientos y Pagos — {monthName}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Marca los gastos pagados para actualizar tu balance mensual al instante.
          </p>
        </div>

        {/* FILTROS */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => setFilter('paid')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'paid'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pagados
          </button>
          <button
            type="button"
            onClick={() => setFilter('recurring')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'recurring'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fijos
          </button>
          <button
            type="button"
            onClick={() => setFilter('own')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'own'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cuotas
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs">
          No hay gastos programados para este filtro en {monthName}.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isProcessing = togglingId === item.id;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.isPaid
                    ? 'bg-slate-950/40 border-emerald-950/40 opacity-85 hover:opacity-100'
                    : 'bg-slate-950/90 border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                    item.isPaid
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <span className="text-[10px] uppercase font-semibold">Día</span>
                    <span className="text-base font-bold leading-none text-white">{item.day}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {item.type === 'recurring' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Gasto Fijo
                        </span>
                      )}
                      {item.type === 'installment_own' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Cuota Propia
                        </span>
                      )}
                      {item.type === 'installment_shared' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Compartido ({item.beneficiaryName})
                        </span>
                      )}

                      <span className="text-xs text-slate-400">{item.details}</span>
                    </div>

                    <h4 className={`text-sm font-semibold ${item.isPaid ? 'text-slate-300 line-through decoration-emerald-500/40' : 'text-white'}`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">Vencimiento: {item.fullDate}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0 gap-2">
                  <span className={`text-base font-bold tracking-tight ${item.isPaid ? 'text-emerald-400' : 'text-white'}`}>
                    {formatMoney(item.amount)}
                  </span>

                  {/* BOTÓN INTERACTIVO PARA MARCAR O DESMARCAR PAGO */}
                  {onTogglePaid ? (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => onTogglePaid(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                        item.isPaid
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-slate-800/80'
                      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={item.isPaid ? 'Hacer clic para marcar como pendiente' : 'Hacer clic para marcar como pagado'}
                    >
                      {isProcessing ? (
                        <span className="inline-block w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      ) : item.isPaid ? (
                        <>
                          <span>✓</span>
                          <span>Pagado</span>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-500">○</span>
                          <span>Marcar Pagado</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        item.isPaid
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.isPaid ? 'Pagado' : 'Pendiente'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
