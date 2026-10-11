'use client';

import React, { useState } from 'react';
import type { TransactionWithDetails } from '@/lib/services/transactions';
import { formatCurrency } from '@/components/recurring-expenses/ExpenseSummaryCards';

interface Props {
  transaction: TransactionWithDetails;
  onToggleInstallment: (installmentId: string, isPaid: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (transaction: TransactionWithDetails) => void;
}

export function TransactionRow({
  transaction,
  onToggleInstallment,
  onDelete,
  onEdit,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isShared = Boolean(transaction.beneficiary);
  const totalInstallments = transaction.installments.length;
  const paidCount = transaction.installments.filter((i) => i.is_paid).length;
  const progressPercent = totalInstallments > 0 ? Math.round((paidCount / totalInstallments) * 100) : 0;
  const isFullyPaid = paidCount === totalInstallments && totalInstallments > 0;
  const installmentAmount = transaction.installments[0]?.amount || (Number(transaction.total_amount) / (totalInstallments || 1));

  const handleToggle = async (installmentId: string, currentStatus: boolean) => {
    setUpdatingId(installmentId);
    try {
      await onToggleInstallment(installmentId, !currentStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la compra "${transaction.description}" y todas sus cuotas?`)) return;
    setDeleting(true);
    try {
      await onDelete(transaction.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-xl border bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-sm">
      {/* Renglón principal */}
      <div className="p-3.5 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Izquierda: Concepto, badges y fecha */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                isShared
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isShared ? `A cobrar: ${transaction.beneficiary?.name}` : 'Consumo Propio'}
            </span>

            {transaction.payment_method && (
              <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                💳 {transaction.payment_method.name}
              </span>
            )}

            <span className="text-[11px] text-zinc-500">
              • {transaction.purchase_date}
            </span>
          </div>

          <h3 className="font-semibold text-white text-sm sm:text-base truncate">
            {transaction.description}
          </h3>
        </div>

        {/* Centro: Progreso y Cuotas */}
        <div className="flex items-center gap-4 sm:px-4">
          <div className="w-28 hidden md:block">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span>{paidCount}/{totalInstallments} cuotas</span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isFullyPaid
                    ? 'bg-emerald-400'
                    : isShared
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-400'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold md:hidden ${
              isFullyPaid
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
            }`}
          >
            {paidCount}/{totalInstallments} cuotas
          </span>
        </div>

        {/* Derecha: Montos y Acciones */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
          <div className="text-left sm:text-right">
            <span className="font-mono text-sm sm:text-base font-bold text-white block">
              {formatCurrency(Number(transaction.total_amount))}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              {transaction.installments_count} x {formatCurrency(Number(installmentAmount))}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Ocultar cuotas' : 'Ver cuotas'}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1 font-medium"
            >
              <span>{expanded ? '▲' : '▼'}</span>
              <span className="hidden lg:inline text-[11px]">{expanded ? 'Ocultar' : 'Cuotas'}</span>
            </button>

            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                title="Editar compra"
                className="text-zinc-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors text-sm"
              >
                ✏️
              </button>
            )}

            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Eliminar compra"
              className="text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-sm"
            >
              {deleting ? '...' : '🗑️'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista Desplegable de Cuotas */}
      {expanded && (
        <div className="px-3.5 pb-3.5 pt-2 border-t border-zinc-800/60 bg-zinc-950/40 rounded-b-xl space-y-2 animate-in fade-in duration-150">
          <div className="text-[11px] font-medium text-zinc-400 px-1 mb-1">
            Cronograma de cuotas:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {transaction.installments.map((inst) => (
              <div
                key={inst.id}
                className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${
                  inst.is_paid
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-zinc-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inst.is_paid}
                    disabled={updatingId === inst.id}
                    onChange={() => handleToggle(inst.id, inst.is_paid)}
                    className="w-3.5 h-3.5 rounded accent-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-white">
                      Cuota {inst.installment_number}/{totalInstallments}
                    </span>
                    <span className="text-zinc-500 ml-1.5 font-mono text-[10px]">
                      {inst.due_date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-medium text-[11px]">
                    {formatCurrency(Number(inst.amount))}
                  </span>
                  <span
                    className={`px-1 py-0.2 rounded text-[9px] font-semibold ${
                      inst.is_paid
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {inst.is_paid ? 'Pagada' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
