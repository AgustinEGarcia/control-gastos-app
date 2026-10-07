'use client';

import React, { useState } from 'react';
import type { PaymentMethod } from '@/lib/services/paymentMethods';
import {
  type RecurringExpenseInput,
  validateRecurringExpenseInput,
} from '@/lib/services/recurringExpenses';

interface Props {
  onSuccess: (input: RecurringExpenseInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  paymentMethods?: PaymentMethod[];
}

const CATEGORIES = [
  'Vivienda',
  'Servicios',
  'Seguros',
  'Suscripciones',
  'Educación',
  'Salud',
  'Transporte',
  'Otros',
];

export function ExpenseForm({ onSuccess, onCancel, submitting, paymentMethods = [] }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Servicios');
  const [estimatedAmount, setEstimatedAmount] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [paymentDay, setPaymentDay] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const input: RecurringExpenseInput = {
      name,
      category,
      estimated_amount: parseFloat(estimatedAmount),
      actual_amount: actualAmount ? parseFloat(actualAmount) : null,
      payment_day: parseInt(paymentDay, 10),
      is_active: true,
      payment_method_id: paymentMethodId ? paymentMethodId : null,
    };

    const validation = validateRecurringExpenseInput(input);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSuccess(input);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el gasto.';
      setGeneralError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <h2 className="text-lg font-bold text-white">Nuevo Gasto Fijo Recurrente</h2>
          <button
            onClick={onCancel}
            className="text-zinc-400 hover:text-white transition-colors text-sm p-1"
          >
            ✕
          </button>
        </div>

        {generalError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="expense-name">
              Nombre del Gasto o Servicio *
            </label>
            <input
              id="expense-name"
              type="text"
              required
              placeholder="Ej: Alquiler, Expensas, Internet, Seguro del Auto"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="category">
                Categoría *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="payment-day">
                Día de Pago (1 a 31) *
              </label>
              <input
                id="payment-day"
                type="number"
                min={1}
                max={31}
                required
                placeholder="Ej: 10"
                value={paymentDay}
                onChange={(e) => {
                  setPaymentDay(e.target.value);
                  if (errors.payment_day) setErrors((prev) => ({ ...prev, payment_day: '' }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {errors.payment_day && <p className="text-red-400 text-xs mt-1">{errors.payment_day}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="expense-payment-method">
              Tarjeta o Débito Automático (Opcional)
            </label>
            <select
              id="expense-payment-method"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Sin tarjeta (Débito en cuenta / Efectivo)</option>
              {paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  💳 {pm.name} ({pm.is_own ? 'Propia' : `De: ${pm.owner_name || 'Tercero'}`})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-500 mt-1">
              Si se debita de una tarjeta de crédito (ej. Netflix, seguro), impactará en el resumen mensual.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="estimated-amount">
                Monto Estimado ($) *
              </label>
              <input
                id="estimated-amount"
                type="number"
                step="0.01"
                min={0.01}
                required
                placeholder="Ej: 45000"
                value={estimatedAmount}
                onChange={(e) => {
                  setEstimatedAmount(e.target.value);
                  if (errors.estimated_amount) setErrors((prev) => ({ ...prev, estimated_amount: '' }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {errors.estimated_amount && <p className="text-red-400 text-xs mt-1">{errors.estimated_amount}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="actual-amount">
                Monto Real Facturado ($)
              </label>
              <input
                id="actual-amount"
                type="number"
                step="0.01"
                min={0}
                placeholder="Opcional (al recibir factura)"
                value={actualAmount}
                onChange={(e) => {
                  setActualAmount(e.target.value);
                  if (errors.actual_amount) setErrors((prev) => ({ ...prev, actual_amount: '' }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {errors.actual_amount && <p className="text-red-400 text-xs mt-1">{errors.actual_amount}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'Guardando...' : 'Crear Gasto Fijo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
