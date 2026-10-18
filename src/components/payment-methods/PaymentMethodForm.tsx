'use client';

import React, { useState } from 'react';
import {
  type PaymentMethod,
  type PaymentMethodInput,
  validatePaymentMethodInput,
} from '@/lib/services/paymentMethods';

interface Props {
  onSuccess: (input: PaymentMethodInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  editingMethod?: PaymentMethod | null;
}

export function PaymentMethodForm({ onSuccess, onCancel, submitting, editingMethod }: Props) {
  const [name, setName] = useState(editingMethod?.name ?? '');
  const [isOwn, setIsOwn] = useState(editingMethod ? editingMethod.is_own : true);
  const [ownerName, setOwnerName] = useState(editingMethod?.owner_name ?? '');
  const [closingDay, setClosingDay] = useState(
    editingMethod?.closing_day !== null && editingMethod?.closing_day !== undefined
      ? String(editingMethod.closing_day)
      : ''
  );
  const [dueDay, setDueDay] = useState(
    editingMethod?.due_day !== null && editingMethod?.due_day !== undefined
      ? String(editingMethod.due_day)
      : ''
  );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl bg-zinc-950 border border-zinc-800/80 p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 mb-4">
          <h2 className="text-sm font-semibold text-white">
            {editingMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
          </h2>
          <button
            onClick={onCancel}
            className="text-zinc-400 hover:text-white transition-colors text-xs p-1"
          >
            ✕
          </button>
        </div>

        {generalError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="method-name">
              Nombre de la Tarjeta o Cuenta *
            </label>
            <input
              id="method-name"
              type="text"
              required
              placeholder="Ej: Visa Santander, Mastercard Galicia"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
            />
            {errors.name && <p className="text-rose-400 text-xs font-mono mt-1">{errors.name}</p>}
          </div>

          <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/80">
            <span className="block text-xs font-mono text-zinc-300 mb-2">
              ¿A quién pertenece?
            </span>
            <div className="flex gap-4 text-xs font-mono">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-200">
                <input
                  type="radio"
                  name="ownership"
                  checked={isOwn}
                  onChange={() => setIsOwn(true)}
                  className="accent-white"
                />
                Tarjeta Propia
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-zinc-200">
                <input
                  type="radio"
                  name="ownership"
                  checked={!isOwn}
                  onChange={() => setIsOwn(false)}
                  className="accent-white"
                />
                Prestada / De Tercero
              </label>
            </div>

            {!isOwn && (
              <div className="mt-3">
                <label className="block text-xs font-mono text-zinc-400 mb-1" htmlFor="owner-name">
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
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
                />
                {errors.owner_name && <p className="text-rose-400 text-xs font-mono mt-1">{errors.owner_name}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="closing-day">
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
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-zinc-500 transition-colors"
              />
              {errors.closing_day && <p className="text-rose-400 text-xs font-mono mt-1">{errors.closing_day}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="due-day">
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
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-zinc-500 transition-colors"
              />
              {errors.due_day && <p className="text-rose-400 text-xs font-mono mt-1">{errors.due_day}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-zinc-800/80 mt-5">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting
                ? 'Guardando...'
                : editingMethod
                ? 'Guardar Cambios'
                : 'Crear Método de Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
