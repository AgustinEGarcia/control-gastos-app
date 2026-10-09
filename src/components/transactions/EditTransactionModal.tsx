'use client';

import React, { useState } from 'react';
import type { PaymentMethod } from '@/lib/services/paymentMethods';
import type {
  TransactionWithDetails,
  Person,
  UpdateTransactionInput,
} from '@/lib/services/transactions';

interface Props {
  transaction: TransactionWithDetails;
  paymentMethods: PaymentMethod[];
  people: Person[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, input: UpdateTransactionInput) => Promise<void>;
}

export function EditTransactionModal({
  transaction,
  paymentMethods,
  people,
  isOpen,
  onClose,
  onSave,
}: Props) {
  const [description, setDescription] = useState(transaction.description);
  const [purchaseDate, setPurchaseDate] = useState(transaction.purchase_date);
  const [paymentMethodId, setPaymentMethodId] = useState<string>(
    transaction.payment_method_id || ''
  );
  const [beneficiaryId, setBeneficiaryId] = useState<string>(
    transaction.beneficiary_person_id || ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSave(transaction.id, {
        description: description.trim(),
        purchase_date: purchaseDate,
        payment_method_id: paymentMethodId ? paymentMethodId : null,
        beneficiary_person_id: beneficiaryId ? beneficiaryId : null,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los cambios.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>✏️</span> Editar Compra
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Modifica los datos principales sin alterar el plan de cuotas existente.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-zinc-400 hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="edit-tx-desc">
              Descripción de la Compra *
            </label>
            <input
              id="edit-tx-desc"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="edit-tx-date">
              Fecha de Compra *
            </label>
            <input
              id="edit-tx-date"
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="edit-tx-pm">
              Método de Pago
            </label>
            <select
              id="edit-tx-pm"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Sin método asignado</option>
              {paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  💳 {pm.name} ({pm.is_own ? 'Propia' : `De: ${pm.owner_name || 'Tercero'}`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="edit-tx-beneficiary">
              Destinatario / Persona Asignada
            </label>
            <select
              id="edit-tx-beneficiary"
              value={beneficiaryId}
              onChange={(e) => setBeneficiaryId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Consumo Propio (100% mío)</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  👤 Prestada a: {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
