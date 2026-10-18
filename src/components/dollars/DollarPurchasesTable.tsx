'use client';

import React from 'react';
import type { DollarPurchase } from '@/lib/services/dollarPurchases';
import { formatMoneyArs, formatMoneyUsd } from '@/lib/services/dollarPurchases';

interface DollarPurchasesTableProps {
  purchases: DollarPurchase[];
  onEdit: (purchase: DollarPurchase) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export function DollarPurchasesTable({
  purchases,
  onEdit,
  onDelete,
  deletingId,
}: DollarPurchasesTableProps) {
  if (purchases.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-xl border border-zinc-800/80 bg-zinc-950">
        <h3 className="text-sm font-medium text-white mb-1">
          No tienes compras de dólares registradas
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto font-mono">
          Registra tu primera adquisición de USD para comenzar a construir el historial y monitorear tu stock.
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
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Dólares (USD)</th>
              <th className="py-3 px-4">Cotización Pagada</th>
              <th className="py-3 px-4">Total Desembolsado</th>
              <th className="py-3 px-4">Origen / Notas</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 font-mono">
            {purchases.map((purchase) => (
              <tr
                key={purchase.id}
                className="hover:bg-zinc-900/30 transition-colors"
              >
                <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                  {purchase.purchase_date}
                </td>
                <td className="py-3 px-4 font-semibold text-emerald-400 whitespace-nowrap">
                  +{formatMoneyUsd(purchase.amount_usd)}
                </td>
                <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                  {formatMoneyArs(purchase.exchange_rate)}
                </td>
                <td className="py-3 px-4 text-zinc-100 font-semibold whitespace-nowrap">
                  {formatMoneyArs(purchase.total_ars)}
                </td>
                <td className="py-3 px-4 text-zinc-400 font-sans max-w-[200px] truncate">
                  {purchase.notes ? (
                    <span className="inline-block px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                      {purchase.notes}
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5 font-mono">
                    <button
                      onClick={() => onEdit(purchase)}
                      title="Editar compra"
                      className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors text-xs"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onDelete(purchase.id)}
                      disabled={deletingId === purchase.id}
                      title="Eliminar compra"
                      className="p-1.5 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition-colors text-xs disabled:opacity-30"
                    >
                      {deletingId === purchase.id ? '...' : '✕'}
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
