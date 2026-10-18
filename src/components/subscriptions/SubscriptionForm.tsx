'use client';

import React, { useState, useEffect } from 'react';
import type { Subscription, SubscriptionInput } from '@/lib/services/subscriptions';
import { validateSubscriptionInput } from '@/lib/services/subscriptions';
import type { PaymentMethod } from '@/lib/services/paymentMethods';

interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: SubscriptionInput) => Promise<void>;
  editingSubscription?: Subscription | null;
  paymentMethods: PaymentMethod[];
}

const CATEGORIES = [
  'Streaming & Video',
  'Música & Audio',
  'Software & IA',
  'Almacenamiento Cloud',
  'Fitness & Salud',
  'Juegos & Entretenimiento',
  'Servicios & Otros',
];

export function SubscriptionForm({
  isOpen,
  onClose,
  onSubmit,
  editingSubscription,
  paymentMethods,
}: SubscriptionFormProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [billingDay, setBillingDay] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (editingSubscription) {
      setName(editingSubscription.name);
      setAmount(editingSubscription.amount.toString());
      setCurrency(editingSubscription.currency);
      setBillingDay(editingSubscription.billing_day.toString());
      setPaymentMethodId(editingSubscription.payment_method_id || '');
      setCategory(editingSubscription.category || CATEGORIES[0]);
      setIsActive(editingSubscription.is_active);
      setNotes(editingSubscription.notes || '');
    } else {
      setName('');
      setAmount('');
      setCurrency('ARS');
      setBillingDay('');
      setPaymentMethodId('');
      setCategory(CATEGORIES[0]);
      setIsActive(true);
      setNotes('');
    }
    setErrors({});
    setGeneralError(null);
  }, [editingSubscription, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const input: SubscriptionInput = {
      name: name.trim(),
      amount: parseFloat(amount) || 0,
      currency,
      billing_day: parseInt(billingDay, 10) || 1,
      payment_method_id: paymentMethodId ? paymentMethodId : null,
      category,
      is_active: isActive,
      notes: notes.trim() || null,
    };

    const validation = validateSubscriptionInput(input);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(input);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la suscripción.';
      setGeneralError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl bg-zinc-950 border border-zinc-800/80 p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {editingSubscription ? 'Editar Suscripción' : 'Nueva Suscripción'}
            </h2>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Control periódico de cargos recurrentes
            </p>
          </div>
          <button
            onClick={onClose}
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
          {/* NOMBRE */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="sub-name">
              Servicio o Plataforma *
            </label>
            <input
              id="sub-name"
              type="text"
              required
              placeholder="Ej: Netflix, Spotify, ChatGPT Plus, iCloud"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
            />
            {errors.name && (
              <p className="text-rose-400 text-xs font-mono mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* MONTO */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="sub-amount">
                Monto Mensual *
              </label>
              <input
                id="sub-amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-zinc-500 transition-colors"
              />
              {errors.amount && (
                <p className="text-rose-400 text-xs font-mono mt-1">{errors.amount}</p>
              )}
            </div>

            {/* MONEDA */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Moneda *
              </label>
              <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 h-[34px]">
                <button
                  type="button"
                  onClick={() => setCurrency('ARS')}
                  className={`flex-1 rounded-md text-xs font-mono font-medium transition-colors ${
                    currency === 'ARS'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ARS ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`flex-1 rounded-md text-xs font-mono font-medium transition-colors ${
                    currency === 'USD'
                      ? 'bg-zinc-800 text-blue-400 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  USD (US$)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* DÍA DE COBRO */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="sub-day">
                Día de Débito (1-31) *
              </label>
              <input
                id="sub-day"
                type="number"
                min={1}
                max={31}
                required
                placeholder="Ej: 10"
                value={billingDay}
                onChange={(e) => {
                  setBillingDay(e.target.value);
                  if (errors.billing_day) setErrors((prev) => ({ ...prev, billing_day: '' }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-zinc-500 transition-colors"
              />
              {errors.billing_day && (
                <p className="text-rose-400 text-xs font-mono mt-1">{errors.billing_day}</p>
              )}
            </div>

            {/* CATEGORÍA */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="sub-cat">
                Categoría
              </label>
              <select
                id="sub-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* MÉTODO DE PAGO */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="sub-method">
              Tarjeta o Cuenta de Débito
            </label>
            <select
              id="sub-method"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500 transition-colors"
            >
              <option value="">Sin método asignado / Débito general</option>
              {paymentMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.is_own ? 'Propia' : `De: ${m.owner_name || 'Tercero'}`})
                </option>
              ))}
            </select>
          </div>

          {/* ESTADO */}
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <span className="block text-xs font-medium text-white">
                Estado de la suscripción
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                {isActive ? 'Activa: suma al total mensual estimado' : 'Pausada: no suma al total'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
              }`}
            >
              {isActive ? 'Activa' : 'Pausada'}
            </button>
          </div>

          {/* NOTAS */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="sub-notes">
              Notas (Opcional)
            </label>
            <input
              id="sub-notes"
              type="text"
              placeholder="Ej: Plan familiar, compartido con mi hermano"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-zinc-800/80 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs font-mono transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting
                ? 'Guardando...'
                : editingSubscription
                ? 'Guardar Cambios'
                : 'Registrar Suscripción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
