'use client';

import React, { useState } from 'react';
import type { DebtorAccount, PaymentReceivedInput } from '@/lib/services/debtors';
import { validatePaymentReceivedInput } from '@/lib/services/debtors';

interface PaymentReceivedModalProps {
  debtor: DebtorAccount;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: PaymentReceivedInput) => Promise<void>;
}

export function PaymentReceivedModal({
  debtor,
  isOpen,
  onClose,
  onSubmit,
}: PaymentReceivedModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(today);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePayAll = () => {
    setAmount(debtor.remaining_balance.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const input: PaymentReceivedInput = {
      person_id: debtor.person.id,
      amount: Number(amount),
      payment_date: paymentDate,
      notes: notes.trim() || null,
    };

    const validation = validatePaymentReceivedInput(input, debtor.remaining_balance);
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0]);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(input);
      setAmount('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el cobro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl w-full max-w-md p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Registrar Cobro Recibido</h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Deudor: <span className="text-zinc-200 font-medium">{debtor.person.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-zinc-400 hover:text-white transition-colors p-1 text-xs"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-mono text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono text-zinc-300">
                Monto Recibido ($ ARS) *
              </label>
              <button
                type="button"
                onClick={handlePayAll}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline"
              >
                Cobrar total (${debtor.remaining_balance.toLocaleString('es-AR')})
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={debtor.remaining_balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">
              Fecha de Cobro *
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-zinc-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">
              Notas / Comprobante (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Transferencia Mercado Pago / Efectivo"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-zinc-800/80 mt-5">
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
              className="px-4 py-2 rounded-lg text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Acreditar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
