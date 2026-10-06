'use client';

import React from 'react';
import type { PaymentMethod } from '@/lib/services/paymentMethods';

interface Props {
  method: PaymentMethod;
  onDelete: (id: string) => void;
  deleting?: boolean;
}

export function PaymentMethodCard({ method, onDelete, deleting }: Props) {
  const isOwn = method.is_own;

  return (
    <div className="relative group overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/20 flex flex-col justify-between min-h-[190px]">
      {/* Glow decorativo sutil */}
      <div
        className={`absolute -right-12 -top-12 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isOwn ? 'bg-emerald-500' : 'bg-cyan-500'
        }`}
      />

      {/* Header de la tarjeta */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Chip de tarjeta estilizado */}
          <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-400/80 to-amber-200/90 border border-amber-300/40 shadow-inner flex items-center justify-center">
            <div className="w-6 h-4 border border-amber-600/30 rounded-sm" />
          </div>
          <div>
            <h3 className="font-semibold text-white tracking-wide text-base">
              {method.name}
            </h3>
            <span
              className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase ${
                isOwn
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              }`}
            >
              {isOwn ? 'Propia' : `De: ${method.owner_name || 'Tercero'}`}
            </span>
          </div>
        </div>

        <button
          onClick={() => onDelete(method.id)}
          disabled={deleting}
          title="Eliminar método de pago"
          className="opacity-60 group-hover:opacity-100 hover:text-red-400 text-zinc-500 transition-all p-1.5 rounded-lg hover:bg-red-500/10 text-sm disabled:opacity-30"
        >
          {deleting ? '...' : '🗑️'}
        </button>
      </div>

      {/* Footer con fechas de cierre y vencimiento */}
      <div className="pt-6 border-t border-zinc-800/60 mt-4 grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="block text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">
            Día de Cierre
          </span>
          <span className="font-mono text-zinc-200 font-medium text-sm mt-0.5 block">
            {method.closing_day ? `Día ${method.closing_day}` : 'No definido'}
          </span>
        </div>
        <div>
          <span className="block text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">
            Vence
          </span>
          <span className="font-mono text-emerald-400 font-medium text-sm mt-0.5 block">
            {method.due_day ? `Día ${method.due_day}` : 'No definido'}
          </span>
        </div>
      </div>
    </div>
  );
}
