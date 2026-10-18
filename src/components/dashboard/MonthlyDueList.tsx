'use client';

import React, { useState } from 'react';
import type { MonthlyDueItem } from '@/lib/services/dashboard';

interface MonthlyDueListProps {
  items: MonthlyDueItem[];
  monthName: string;
  paymentMethods?: { id: string; name: string }[];
  onTogglePaid?: (item: MonthlyDueItem) => Promise<void> | void;
  onEditVariable?: () => void;
  togglingId?: string | null;
  onShiftInstallment?: (item: MonthlyDueItem, monthsDelta: number) => Promise<void> | void;
  onAdvanceNextInstallment?: (item: MonthlyDueItem) => Promise<void> | void;
  shiftingId?: string | null;
}

export function MonthlyDueList({
  items,
  monthName,
  paymentMethods = [],
  onTogglePaid,
  onEditVariable,
  togglingId,
  onShiftInstallment,
  onAdvanceNextInstallment,
  shiftingId,
}: MonthlyDueListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'recurring' | 'own' | 'shared' | 'variable'>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Métodos de pago disponibles (de props o de items)
  const availableMethods = React.useMemo(() => {
    if (paymentMethods && paymentMethods.length > 0) return paymentMethods;
    const map = new Map<string, string>();
    for (const it of items) {
      if (it.paymentMethodId && it.paymentMethodName) {
        map.set(it.paymentMethodId, it.paymentMethodName);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [paymentMethods, items]);

  // Doble filtro combinado (Estado/Tipo + Método de pago)
  const filteredItems = items.filter((item) => {
    // 1. Filtro de estado o tipo
    if (filter === 'pending' && item.isPaid) return false;
    if (filter === 'paid' && !item.isPaid) return false;
    if (filter === 'recurring' && item.type !== 'recurring') return false;
    if (filter === 'own' && item.type !== 'installment_own' && item.type !== 'installment_shared') return false;
    if (filter === 'variable' && item.type !== 'variable') return false;

    // 2. Filtro de tarjeta / método de pago
    if (selectedPaymentMethod !== 'all') {
      if (selectedPaymentMethod === 'none') {
        if (item.paymentMethodId) return false;
      } else {
        if (item.paymentMethodId !== selectedPaymentMethod) return false;
      }
    }

    return true;
  });

  return (
    <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <span>Cronograma de Vencimientos y Pagos — {monthName}</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Marca los gastos pagados para actualizar tu balance mensual al instante.
          </p>
        </div>

        {/* CONTENEDOR DE DOBLE FILTRO */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Selector de Tarjeta / Método de Pago */}
          <div className="flex items-center gap-2">
            <label htmlFor="due-method-filter" className="text-xs text-zinc-400 whitespace-nowrap font-medium">
              Tarjeta:
            </label>
            <select
              id="due-method-filter"
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 max-w-[180px] truncate"
            >
              <option value="all">Todas las tarjetas</option>
              {availableMethods.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.name}
                </option>
              ))}
              <option value="none">Sin tarjeta / Efectivo</option>
            </select>
          </div>

          {/* Filtros de Tipo / Estado */}
          <div className="flex items-center gap-1 overflow-x-auto bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                filter === 'all'
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({filteredItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                filter === 'pending'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Pendientes
            </button>
            <button
              type="button"
              onClick={() => setFilter('paid')}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                filter === 'paid'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Pagados
            </button>
            <button
              type="button"
              onClick={() => setFilter('recurring')}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                filter === 'recurring'
                  ? 'bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Fijos
            </button>
            <button
              type="button"
              onClick={() => setFilter('own')}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                filter === 'own'
                  ? 'bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Cuotas
            </button>
            <button
              type="button"
              onClick={() => setFilter('variable')}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                filter === 'variable'
                  ? 'bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Variables
            </button>
          </div>
        </div>
      </div>


      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-xs">
          No hay gastos programados para este filtro en {monthName}.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const isProcessing = togglingId === item.id;

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-lg border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.isPaid
                    ? 'bg-zinc-950/60 border-zinc-800/50 opacity-80 hover:opacity-100'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/80'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-11 h-11 rounded-lg border flex flex-col items-center justify-center shrink-0 ${
                    item.isPaid
                      ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}>
                    <span className="text-[9px] uppercase font-mono font-medium text-zinc-500">Día</span>
                    <span className="text-sm font-mono font-bold leading-none text-zinc-100">{item.day}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {item.isRefund ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <span>Devolución / Reintegro</span>
                        </span>
                      ) : (
                        <>
                          {item.type === 'recurring' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                              Gasto Fijo
                            </span>
                          )}
                          {item.type === 'installment_own' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                              Cuota Propia
                            </span>
                          )}
                          {item.type === 'installment_shared' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-amber-400 border border-zinc-800">
                              Compartido ({item.beneficiaryName})
                            </span>
                          )}
                          {item.type === 'variable' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 flex items-center gap-1">
                              <span>Gasto Variable</span>
                            </span>
                          )}
                        </>
                      )}

                      <span className="text-xs text-zinc-400">{item.details}</span>
                      {item.type === 'variable' && onEditVariable && (
                        <button
                          type="button"
                          onClick={onEditVariable}
                          className="text-[11px] font-mono text-zinc-400 hover:text-white underline ml-1"
                        >
                          (Editar conceptos)
                        </button>
                      )}
                    </div>

                    <h4 className={`text-sm font-medium ${item.isPaid ? 'text-zinc-400 line-through decoration-emerald-500/40' : 'text-zinc-100'}`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] font-mono text-zinc-500">Vencimiento: {item.fullDate}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-zinc-800/80 pt-2 sm:pt-0 gap-2">
                  <span className={`text-base font-bold font-mono tracking-tight ${item.isRefund ? 'text-emerald-400' : item.isPaid ? 'text-emerald-400' : 'text-zinc-100'}`}>
                    {item.isRefund ? `-${formatMoney(item.amount)}` : formatMoney(item.amount)}
                  </span>

                  {/* ACCIONES DE CUOTA: COBRO DOBLE Y SALTEO DE MES */}
                  {item.installmentId && !item.isPaid && (
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {onAdvanceNextInstallment && item.installmentNumber && item.installmentsCount && item.installmentNumber < item.installmentsCount && (
                        <button
                          type="button"
                          disabled={shiftingId === item.id || isProcessing}
                          onClick={() => onAdvanceNextInstallment(item)}
                          className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-[11px] font-mono text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-1"
                          title="La tarjeta cobró 2 cuotas juntas en este resumen: trae la siguiente cuota a este mismo mes para sumar el doble"
                        >
                          {shiftingId === item.id ? '⏳' : '+1 cuota (doble)'}
                        </button>
                      )}

                      {onShiftInstallment && (
                        <button
                          type="button"
                          disabled={shiftingId === item.id || isProcessing}
                          onClick={() => onShiftInstallment(item, 1)}
                          className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-amber-400 hover:border-zinc-700 transition-colors"
                          title="La tarjeta no facturó esta cuota este mes: postergarla al mes siguiente (+1 mes)"
                        >
                          {shiftingId === item.id ? '⏳' : 'Saltear (+1m)'}
                        </button>
                      )}

                      {onShiftInstallment && (
                        <button
                          type="button"
                          disabled={shiftingId === item.id || isProcessing}
                          onClick={() => onShiftInstallment(item, -1)}
                          className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
                          title="Mover cuota al mes anterior (-1 mes)"
                        >
                          -1m
                        </button>
                      )}
                    </div>
                  )}

                  {/* BOTÓN INTERACTIVO PARA MARCAR O DESMARCAR PAGO */}
                  {onTogglePaid ? (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => onTogglePaid(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                        item.isPaid
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                          : 'bg-white text-zinc-950 hover:bg-zinc-200'
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
                          <span>○</span>
                          <span>Marcar Pagado</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                        item.isPaid
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
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
