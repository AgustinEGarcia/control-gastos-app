'use client';

import React, { useState } from 'react';
import {
  type PaymentMethodInput,
  validatePaymentMethodInput,
} from '@/lib/services/paymentMethods';

interface Props {
  onSuccess: (input: PaymentMethodInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function PaymentMethodForm({ onSuccess, onCancel, submitting }: Props) {
  const [name, setName] = useState('');
  const [isOwn, setIsOwn] = useState(true);
  const [ownerName, setOwnerName] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const input: PaymentMethodInput = {
      name,
      is_own: isOwn,
      owner_name: isOwn ? null : ownerName,
      closing_day: closingDay ? parseInt(closingDay, 10) : null,
      due_day: dueDay ? parseInt(dueDay, 10) : null,
    };

    const validation = validatePaymentMethodInput(input);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSuccess(input);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el método de pago.';
      setGeneralError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <h2 className="text-lg font-bold text-white">Nuevo Método de Pago</h2>
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
            <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="method-name">
              Nombre de la Tarjeta o Cuenta *
            </label>
            <input
              id="method-name"
              type="text"
              required
              placeholder="Ej: Visa Santander, Mastercard Galicia, Mercado Crédito"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-800">
            <span className="block text-xs font-medium text-zinc-300 mb-2">
              ¿A quién pertenece?
            </span>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-200">
                <input
                  type="radio"
                  name="ownership"
                  checked={isOwn}
                  onChange={() => setIsOwn(true)}
                  className="accent-emerald-500"
                />
                Tarjeta Propia
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-zinc-200">
                <input
                  type="radio"
                  name="ownership"
                  checked={!isOwn}
                  onChange={() => setIsOwn(false)}
                  className="accent-emerald-500"
                />
                Prestada / De Tercero
              </label>
            </div>

            {!isOwn && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-zinc-400 mb-1" htmlFor="owner-name">
                  Nombre del Titular *
                </label>
                <input
                  id="owner-name"
                  type="text"
                  placeholder="Ej: Papá, Juan, Hermano"
                  value={ownerName}
                  onChange={(e) => {
                    setOwnerName(e.target.value);
                    if (errors.owner_name) setErrors((prev) => ({ ...prev, owner_name: '' }));
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                {errors.owner_name && <p className="text-red-400 text-xs mt-1">{errors.owner_name}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="closing-day">
                Día de Cierre (1-31)
              </label>
              <input
                id="closing-day"
                type="number"
                min={1}
                max={31}
                placeholder="Ej: 20"
                value={closingDay}
                onChange={(e) => {
                  setClosingDay(e.target.value);
                  if (errors.closing_day) setErrors((prev) => ({ ...prev, closing_day: '' }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {errors.closing_day && <p className="text-red-400 text-xs mt-1">{errors.closing_day}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="due-day">
                Día de Vencimiento (1-31)
              </label>
              <input
                id="due-day"
                type="number"
                min={1}
                max={31}
                placeholder="Ej: 5"
                value={dueDay}
                onChange={(e) => {
                  setDueDay(e.target.value);
                  if (errors.due_day) setErrors((prev) => ({ ...prev, due_day: '' }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {errors.due_day && <p className="text-red-400 text-xs mt-1">{errors.due_day}</p>}
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
              {submitting ? 'Guardando...' : 'Crear Método de Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
