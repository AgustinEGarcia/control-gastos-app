'use client';

import React from 'react';
import type { Subscription } from '@/lib/services/subscriptions';
import { formatSubscriptionCurrency } from '@/lib/services/subscriptions';

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export function SubscriptionsTable({
  subscriptions,
  onToggleStatus,
  onEdit,
  onDelete,
  deletingId,
}: SubscriptionsTableProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-xl border border-zinc-800/80 bg-zinc-950">
        <h3 className="text-sm font-medium text-white mb-1">
          No tienes suscripciones registradas
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto font-mono">
          Carga tus plataformas favoritas para monitorear el gasto acumulado mensual y fechas de débito.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-900/60 border-b border-zinc-800/80 text-[11px] font-mono uppercase text-zinc-400">
            <tr>
              <th className="py-3 px-4">Servicio</th>
              <th className="py-3 px-4">Monto Mensual</th>
              <th className="py-3 px-4">Día de Débito</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4">Método de Pago</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {subscriptions.map((sub) => (
              <tr
                key={sub.id}
                className={`hover:bg-zinc-900/30 transition-colors ${
                  !sub.is_active ? 'opacity-60 bg-zinc-950/40' : ''
                }`}
              >
                {/* NOMBRE */}
                <td className="py-3 px-4">
                  <span className="font-medium text-white block text-xs">{sub.name}</span>
                  {sub.notes && (
                    <span className="text-[11px] text-zinc-400 font-mono truncate max-w-[200px] block">
                      {sub.notes}
                    </span>
                  )}
                </td>

                {/* MONTO */}
                <td className="py-3 px-4 font-mono font-semibold whitespace-nowrap">
                  <span className={sub.currency === 'USD' ? 'text-blue-400' : 'text-emerald-400'}>
                    {formatSubscriptionCurrency(sub.amount, sub.currency)}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-normal ml-1 font-sans">/mes</span>
                </td>

                {/* DÍA DE DÉBITO */}
                <td className="py-3 px-4 font-mono text-zinc-300 whitespace-nowrap">
                  Día {sub.billing_day}
                </td>

                {/* CATEGORÍA */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {sub.category}
                  </span>
                </td>

                {/* MÉTODO DE PAGO */}
                <td className="py-3 px-4 text-zinc-400 font-mono text-xs whitespace-nowrap">
                  {sub.payment_method_name ? sub.payment_method_name : 'Débito general'}
                </td>

                {/* ESTADO (TOGGLE DIRECTO) */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(sub.id, sub.is_active)}
                    title={sub.is_active ? 'Click para pausar' : 'Click para activar'}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border transition-colors ${
                      sub.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700/60 hover:bg-zinc-700/60'
                    }`}
                  >
                    {sub.is_active ? '● Activa' : '○ Pausada'}
                  </button>
                </td>

                {/* ACCIONES */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5 font-mono">
                    <button
                      onClick={() => onEdit(sub)}
                      title="Editar suscripción"
                      className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors text-xs"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onDelete(sub.id)}
                      disabled={deletingId === sub.id}
                      title="Eliminar suscripción"
                      className="p-1.5 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition-colors text-xs disabled:opacity-30"
                    >
                      {deletingId === sub.id ? '...' : '✕'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
