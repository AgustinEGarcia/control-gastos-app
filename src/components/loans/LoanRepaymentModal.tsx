'use client';

import React, { useState } from 'react';
import type { LoanWithDetails, RepaymentInput } from '@/lib/services/loans';
import { validateRepaymentInput } from '@/lib/services/loans';

interface LoanRepaymentModalProps {
  loan: LoanWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: RepaymentInput) => Promise<void>;
}

export function LoanRepaymentModal({
  loan,
  isOpen,
  onClose,
  onSubmit,
}: LoanRepaymentModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(today);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePayRemaining = () => {
    setAmountPaid(loan.remaining_balance.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const input: RepaymentInput = {
      loan_id: loan.id,
      amount_paid: Number(amountPaid),
      payment_date: paymentDate,
      notes: notes.trim() || null,
    };

    const validation = validateRepaymentInput(input, loan.remaining_balance);
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0]);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(input);
      setAmountPaid('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el abono.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">Registrar Abono</h3>
            <p className="text-xs text-slate-400">
              Prestamista: <span className="text-indigo-400 font-semibold">{loan.lender?.name || 'Prestamista'}</span> ({loan.currency})
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Monto del Abono ({loan.currency})
              </label>
              <button
                type="button"
                onClick={handlePayRemaining}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Saldar todo ({loan.currency === 'USD' ? 'US$' : '$'}{loan.remaining_balance.toLocaleString('es-AR')})
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={loan.remaining_balance}
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Fecha de Pago
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Notas / Comprobante (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Transferencia Banco Galicia o en mano"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Confirmar Abono'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
