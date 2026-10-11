'use client';

import React, { useState, useMemo } from 'react';
import type { PaymentMethod } from '@/lib/services/paymentMethods';
import type {
  TransactionWithDetails,
  Person,
  UpdateTransactionInput,
} from '@/lib/services/transactions';
import { generateInstallmentSchedule } from '@/lib/services/transactions';
import { formatCurrency } from '@/components/recurring-expenses/ExpenseSummaryCards';

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
  const initialFirstDate =
    transaction.first_installment_date ||
    transaction.installments[0]?.due_date ||
    transaction.purchase_date;
  const initialMonth = initialFirstDate.slice(0, 7);

  const [description, setDescription] = useState(transaction.description);
  const [calcMode, setCalcMode] = useState<'total' | 'by_installment'>('total');
  const [totalAmount, setTotalAmount] = useState(String(transaction.total_amount));
  const [installmentsCount, setInstallmentsCount] = useState(String(transaction.installments_count));
  const [installmentAmount, setInstallmentAmount] = useState(
    transaction.installments_count > 0
      ? (Number(transaction.total_amount) / transaction.installments_count).toFixed(2)
      : String(transaction.total_amount)
  );

  const [startMonth, setStartMonth] = useState(initialMonth);
  const [paymentMethodId, setPaymentMethodId] = useState<string>(
    transaction.payment_method_id || ''
  );
  const [isShared, setIsShared] = useState(Boolean(transaction.beneficiary_person_id));
  const [beneficiaryId, setBeneficiaryId] = useState<string>(
    transaction.beneficiary_person_id || ''
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulación en vivo de las cuotas
  const previewInstallments = useMemo(() => {
    const amount = parseFloat(totalAmount);
    const count = parseInt(installmentsCount, 10);
    const firstDate = startMonth ? `${startMonth}-01` : initialFirstDate;
    if (!isNaN(amount) && amount > 0 && !isNaN(count) && count >= 1 && count <= 60 && firstDate) {
      return generateInstallmentSchedule(amount, count, firstDate);
    }
    return [];
  }, [totalAmount, installmentsCount, startMonth, initialFirstDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }

    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('El monto total debe ser un número mayor a cero.');
      return;
    }

    const count = parseInt(installmentsCount, 10);
    if (isNaN(count) || count < 1 || count > 60) {
      setError('La cantidad de cuotas debe ser entre 1 y 60.');
      return;
    }

    if (isShared && !beneficiaryId) {
      setError('Debes seleccionar la persona destinataria del préstamo de la compra.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const firstDate = `${startMonth}-01`;

    try {
      await onSave(transaction.id, {
        description: description.trim(),
        total_amount: amount,
        installments_count: count,
        first_installment_date: firstDate,
        purchase_date: firstDate,
        payment_method_id: paymentMethodId ? paymentMethodId : null,
        beneficiary_person_id: isShared && beneficiaryId ? beneficiaryId : null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>✏️</span> Editar Compra / Financiación
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Corrige montos, cuotas, fechas o destinatarios. El plan de pagos se recalculará automáticamente.
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

          {/* Selector de Modo de Cálculo: Por Total o Por Cuota */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-zinc-400 font-medium">Modo de cálculo:</span>
            <div className="flex bg-zinc-800 p-0.5 rounded-lg border border-zinc-700">
              <button
                type="button"
                onClick={() => setCalcMode('total')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  calcMode === 'total'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Por Monto Total
              </button>
              <button
                type="button"
                onClick={() => {
                  setCalcMode('by_installment');
                  const total = parseFloat(totalAmount);
                  const count = parseInt(installmentsCount, 10);
                  if (!isNaN(total) && total > 0 && !isNaN(count) && count > 0) {
                    setInstallmentAmount((total / count).toFixed(2));
                  }
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  calcMode === 'by_installment'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Por Valor de Cuota
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {calcMode === 'total' ? (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="edit-tx-amount">
                  Monto Total ($) *
                </label>
                <input
                  id="edit-tx-amount"
                  type="number"
                  step="0.01"
                  min={0.01}
                  required
                  value={totalAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTotalAmount(val);
                    const count = parseInt(installmentsCount, 10);
                    if (val && !isNaN(Number(val)) && !isNaN(count) && count > 0) {
                      setInstallmentAmount((Number(val) / count).toFixed(2));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="edit-tx-inst-amount">
                  Monto de Cada Cuota ($) *
                </label>
                <input
                  id="edit-tx-inst-amount"
                  type="number"
                  step="0.01"
                  min={0.01}
                  required
                  value={installmentAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInstallmentAmount(val);
                    const count = parseInt(installmentsCount, 10);
                    if (val && !isNaN(Number(val)) && !isNaN(count) && count > 0) {
                      setTotalAmount((Number(val) * count).toFixed(2));
                    } else {
                      setTotalAmount('');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="edit-tx-installments">
                Cuotas (1 a 60) *
              </label>
              <input
                id="edit-tx-installments"
                type="number"
                min={1}
                max={60}
                required
                value={installmentsCount}
                onChange={(e) => {
                  const countVal = e.target.value;
                  setInstallmentsCount(countVal);
                  const count = parseInt(countVal, 10);
                  if (calcMode === 'by_installment') {
                    const instVal = parseFloat(installmentAmount);
                    if (!isNaN(instVal) && !isNaN(count) && count > 0) {
                      setTotalAmount((instVal * count).toFixed(2));
                    }
                  } else {
                    const totVal = parseFloat(totalAmount);
                    if (!isNaN(totVal) && !isNaN(count) && count > 0) {
                      setInstallmentAmount((totVal / count).toFixed(2));
                    }
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Vista previa del valor de la cuota */}
          {previewInstallments.length > 0 && (
            <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800 text-xs flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-zinc-400">Plan recalculado:</span>
                <span className="text-[11px] text-zinc-500">
                  Total: {formatCurrency(Number(totalAmount) || 0)}
                </span>
              </div>
              <span className="font-mono text-emerald-400 font-semibold text-sm">
                {previewInstallments.length} {previewInstallments.length === 1 ? 'pago' : 'cuotas'} de{' '}
                {formatCurrency(previewInstallments[0].amount)}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="edit-tx-start-month">
              Mes en el que se paga la 1ª Cuota *
            </label>
            <input
              id="edit-tx-start-month"
              type="month"
              required
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              📅 Las cuotas se reprogramarán a partir de este mes sin desfasajes de cierre.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="edit-tx-pm">
              Tarjeta o Método de Pago
            </label>
            <select
              id="edit-tx-pm"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Sin método asignado / Efectivo</option>
              {paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  💳 {pm.name} ({pm.is_own ? 'Propia' : `De: ${pm.owner_name || 'Tercero'}`})
                </option>
              ))}
            </select>
          </div>

          {/* Sección Destinatario: Propio o Tercero */}
          <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-white">
                  ¿Es una compra prestada a un tercero?
                </span>
                <span className="block text-[11px] text-zinc-400">
                  {isShared ? 'Se registrará como dinero a cobrar' : 'Consumo propio del titular'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => {
                  setIsShared(e.target.checked);
                  if (!e.target.checked) setBeneficiaryId('');
                }}
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
              />
            </div>

            {isShared && (
              <div className="mt-3 pt-3 border-t border-zinc-700/50">
                <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="edit-tx-beneficiary">
                  Seleccionar Contacto / Persona *
                </label>
                <select
                  id="edit-tx-beneficiary"
                  value={beneficiaryId}
                  onChange={(e) => setBeneficiaryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">Selecciona quién pagará estas cuotas...</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      👤 {p.name} {p.email ? `(${p.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
