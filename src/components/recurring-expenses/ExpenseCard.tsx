'use client';

import React, { useState } from 'react';
import type { RecurringExpenseWithMethod } from '@/lib/services/recurringExpenses';
import { formatCurrency } from './ExpenseSummaryCards';

interface Props {
  expense: RecurringExpenseWithMethod;
  onUpdateActualAmount: (id: string, amount: number | null) => Promise<void>;
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (expense: RecurringExpenseWithMethod) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Vivienda: '🏠',
  Servicios: '💡',
  Seguros: '🛡️',
  Suscripciones: '📱',
  Educación: '📚',
  Salud: '🩺',
  Transporte: '🚗',
  Otros: '📦',
};

export function ExpenseCard({
  expense,
  onUpdateActualAmount,
  onToggleActive,
  onDelete,
  onEdit,
}: Props) {
  const [isEditingActual, setIsEditingActual] = useState(false);
  const [actualInput, setActualInput] = useState(
    expense.actual_amount !== null && expense.actual_amount !== undefined
      ? String(expense.actual_amount)
      : ''
  );
  const [savingActual, setSavingActual] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const icon = CATEGORY_ICONS[expense.category || 'Otros'] || '📦';
  const hasActual = expense.actual_amount !== null && expense.actual_amount !== undefined;
  const variation = hasActual ? Number(expense.actual_amount) - Number(expense.estimated_amount) : 0;

  const handleSaveActual = async () => {
    setSavingActual(true);
    try {
      const val = actualInput.trim() === '' ? null : Number(actualInput);
      await onUpdateActualAmount(expense.id, val);
      setIsEditingActual(false);
    } finally {
      setSavingActual(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggleActive(expense.id, !expense.is_active);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar gasto recurrente "${expense.name}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(expense.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`rounded-xl p-5 border transition-colors ${
        expense.is_active
          ? 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700/80'
          : 'bg-zinc-950/40 border-zinc-900 opacity-60'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm">
            {icon}
          </span>
          <div>
            <h3 className="font-medium text-zinc-100 text-sm leading-snug">
              {expense.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-zinc-400 font-mono">
                {expense.category || 'General'}
              </span>
              <span className="text-zinc-700">•</span>
              <span className="text-xs text-emerald-400 font-mono">
                Paga día {expense.payment_day}
              </span>
              {expense.payment_method && (
                <>
                  <span className="text-zinc-700">•</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[10px] font-mono border border-zinc-800">
                    💳 {expense.payment_method.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Acciones superiores */}
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(expense)}
              title="Editar gasto fijo"
              className="text-zinc-500 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors text-sm"
            >
              ✏️
            </button>
          )}
          <button
            onClick={handleToggle}
            disabled={toggling}
            title={expense.is_active ? 'Pausar gasto' : 'Reactivar gasto'}
            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
              expense.is_active
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            {toggling ? '...' : expense.is_active ? 'Activo' : 'Pausado'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Eliminar gasto"
            className="text-zinc-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors text-sm"
          >
            {deleting ? '...' : '🗑️'}
          </button>
        </div>
      </div>

      {/* Montos y Comparativa */}
      <div className="pt-3 border-t border-zinc-800/60 grid grid-cols-2 gap-4">
        <div>
          <span className="block text-[10px] uppercase font-mono font-medium text-zinc-500 tracking-wider">
            Estimado
          </span>
          <span className="font-mono text-zinc-200 font-medium text-sm mt-0.5 block">
            {formatCurrency(Number(expense.estimated_amount))}
          </span>
        </div>

        <div>
          <span className="block text-[10px] uppercase font-mono font-medium text-zinc-500 tracking-wider">
            Real Facturado
          </span>
          {isEditingActual ? (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="number"
                min={0}
                value={actualInput}
                onChange={(e) => setActualInput(e.target.value)}
                placeholder="Monto real"
                className="w-24 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-zinc-500"
              />
              <button
                onClick={handleSaveActual}
                disabled={savingActual}
                className="px-2 py-1 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium font-mono"
              >
                ✓
              </button>
              <button
                onClick={() => setIsEditingActual(false)}
                className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`font-mono text-sm font-semibold ${
                  hasActual ? 'text-emerald-400' : 'text-zinc-400'
                }`}
              >
                {hasActual
                  ? formatCurrency(Number(expense.actual_amount))
                  : 'Pendiente'}
              </span>
              <button
                onClick={() => setIsEditingActual(true)}
                title="Editar monto real de la factura"
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ✏️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Variación */}
      {hasActual && (
        <div className="mt-3 pt-2 border-t border-zinc-800/40 flex items-center justify-between text-[11px] font-mono">
          <span className="text-zinc-500">Desvío de factura:</span>
          <span
            className={`font-mono font-semibold ${
              variation > 0
                ? 'text-rose-400'
                : variation < 0
                ? 'text-emerald-400'
                : 'text-zinc-400'
            }`}
          >
            {variation > 0 ? `+${formatCurrency(variation)}` : formatCurrency(variation)}
          </span>
        </div>
      )}
    </div>
  );
}
