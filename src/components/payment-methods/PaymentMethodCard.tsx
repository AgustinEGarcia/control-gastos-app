'use client';

import React from 'react';
import type { PaymentMethod } from '@/lib/services/paymentMethods';
import { formatCurrency } from '@/components/recurring-expenses/ExpenseSummaryCards';

interface Props {
  method: PaymentMethod;
  onDelete: (id: string) => void;
  onEdit?: (method: PaymentMethod) => void;
  deleting?: boolean;
  recurringCount?: number;
  recurringTotal?: number;
}

export function PaymentMethodCard({
  method,
  onDelete,
  onEdit,
  deleting,
  recurringCount = 0,
  recurringTotal = 0,
}: Props) {
  const isOwn = method.is_own;

  return (
    <div className="relative group rounded-xl p-5 bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors flex flex-col justify-between min-h-[190px]">
      {/* Header de la tarjeta */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white tracking-tight text-sm">
                {method.name}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide uppercase border ${
                  isOwn
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
                }`}
              >
                {isOwn ? 'Propia' : `De: ${method.owner_name || 'Tercero'}`}
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono mt-0.5 block">
              Método de pago / tarjeta
            </span>
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(method)}
                title="Editar método de pago"
                className="opacity-70 group-hover:opacity-100 hover:text-white text-zinc-400 transition-colors p-1.5 rounded-md hover:bg-zinc-900 text-xs"
              >
                ✎
              </button>
            )}

            <button
              onClick={() => onDelete(method.id)}
              disabled={deleting}
              title="Eliminar método de pago"
              className="opacity-70 group-hover:opacity-100 hover:text-rose-400 text-zinc-400 transition-colors p-1.5 rounded-md hover:bg-zinc-900 text-xs disabled:opacity-30"
            >
              {deleting ? '...' : '✕'}
            </button>
          </div>
        </div>

        {/* Suscripciones o débitos fijos vinculados */}
        {recurringCount > 0 && (
          <div className="mt-3.5 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-mono text-[11px]">
              {recurringCount} {recurringCount === 1 ? 'suscripción' : 'suscripciones'}
            </span>
            <span className="font-mono text-zinc-200 font-medium">
              {formatCurrency(recurringTotal)}/mes
            </span>
          </div>
        )}
      </div>

      {/* Footer con fechas de cierre y vencimiento */}
      <div className="pt-3 border-t border-zinc-800/80 mt-3.5 grid grid-cols-2 gap-4 text-xs font-mono">
        <div>
          <span className="block text-zinc-400 uppercase tracking-wider text-[10px]">
            Cierre
          </span>
          <span className="text-zinc-200 font-medium text-xs mt-0.5 block">
            {method.closing_day ? `Día ${method.closing_day}` : '—'}
          </span>
        </div>
        <div>
          <span className="block text-zinc-400 uppercase tracking-wider text-[10px]">
            Vencimiento
          </span>
          <span className="text-emerald-400 font-medium text-xs mt-0.5 block">
            {method.due_day ? `Día ${method.due_day}` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
