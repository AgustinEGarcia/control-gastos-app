'use client';

import React, { useState } from 'react';
import type { MonthlyDueItem } from '@/lib/services/dashboard';

interface MonthlyDueListProps {
  items: MonthlyDueItem[];
  monthName: string;
}

export function MonthlyDueList({ items, monthName }: MonthlyDueListProps) {
  const [filter, setFilter] = useState<'all' | 'recurring' | 'own' | 'shared'>('all');

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const filteredItems = items.filter((item) => {
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
            <span>Cronograma de Vencimientos — {monthName}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Listado unificado de pagos organizados cronológicamente por día de vencimiento.
          </p>
        </div>

        {/* FILTROS DE TIPO */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('recurring')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'own'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cuotas Propias
          </button>
          <button
            type="button"
            onClick={() => setFilter('shared')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'shared'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Compartidas
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs">
          No hay vencimientos programados para este filtro en {monthName}.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Día</span>
                  <span className="text-base font-bold text-white leading-none">{item.day}</span>
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

                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-400">Vencimiento: {item.fullDate}</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                <span className="text-base font-bold text-white tracking-tight">
                  {formatMoney(item.amount)}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full mt-0.5 ${
                    item.isPaid
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.isPaid ? 'Abonado / Facturado' : 'Pendiente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
