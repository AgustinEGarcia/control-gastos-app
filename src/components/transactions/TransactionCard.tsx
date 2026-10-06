'use client';

import React, { useState } from 'react';
import type { TransactionWithDetails } from '@/lib/services/transactions';
import { formatCurrency } from '@/components/recurring-expenses/ExpenseSummaryCards';

interface Props {
  transaction: TransactionWithDetails;
  onToggleInstallment: (installmentId: string, isPaid: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TransactionCard({
  transaction,
  onToggleInstallment,
  onDelete,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isShared = Boolean(transaction.beneficiary);
  const totalInstallments = transaction.installments.length;
  const paidCount = transaction.installments.filter((i) => i.is_paid).length;
  const progressPercent = totalInstallments > 0 ? Math.round((paidCount / totalInstallments) * 100) : 0;
  const isFullyPaid = paidCount === totalInstallments && totalInstallments > 0;

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
    <div className="rounded-2xl p-5 border bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 transition-all shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                isShared
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isShared ? `Prestada a: ${transaction.beneficiary?.name}` : 'Consumo Propio'}
            </span>
            {transaction.payment_method && (
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                💳 {transaction.payment_method.name}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-white text-base">
            {transaction.description}
          </h3>
          <span className="text-[11px] text-zinc-500">
            Comprado el {transaction.purchase_date}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="font-mono text-base font-bold text-white block">
              {formatCurrency(Number(transaction.total_amount))}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              {transaction.installments_count}{' '}
              {transaction.installments_count === 1 ? 'cuota' : 'cuotas'}
            </span>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Eliminar compra"
            className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-sm"
          >
            {deleting ? '...' : '🗑️'}
          </button>
        </div>
      </div>

      {/* Barra de Progreso de Cuotas */}
      <div className="mt-4 pt-3 border-t border-zinc-800/60">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-zinc-400">
            {isFullyPaid
              ? '✅ 100% Pagada'
              : `${paidCount} de ${totalInstallments} cuotas pagadas`}
          </span>
          <span className="font-mono font-semibold text-zinc-300">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
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

      {/* Botón para Desplegar Cuotas */}
      <div className="mt-4 flex items-center justify-between pt-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
        >
          <span>{expanded ? 'Ocultar cuotas ▲' : 'Ver detalle de cuotas ▼'}</span>
        </button>

        {!isFullyPaid && (
          <span className="text-xs text-zinc-500 font-mono">
            Próx. cuota: {formatCurrency(transaction.installments[0]?.amount || 0)}
          </span>
        )}
      </div>

      {/* Lista Desplegable de Cuotas */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-zinc-800/60 space-y-2 animate-in fade-in duration-200">
          {transaction.installments.map((inst) => (
            <div
              key={inst.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                inst.is_paid
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-zinc-400'
                  : 'bg-zinc-800/40 border-zinc-800 text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={inst.is_paid}
                  disabled={updatingId === inst.id}
                  onChange={() => handleToggle(inst.id, inst.is_paid)}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-white">
                    Cuota {inst.installment_number}/{totalInstallments}
                  </span>
                  <span className="text-zinc-500 ml-2 font-mono">
                    Vence {inst.due_date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">
                  {formatCurrency(Number(inst.amount))}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
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
      )}
    </div>
  );
}
