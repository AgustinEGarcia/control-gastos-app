'use client';

import React, { useState, useMemo } from 'react';
import type { PaymentMethod } from '@/lib/services/paymentMethods';
import {
  type TransactionInput,
  type Person,
  validateTransactionInput,
  generateInstallmentSchedule,
} from '@/lib/services/transactions';
import { formatCurrency } from '@/components/recurring-expenses/ExpenseSummaryCards';

interface Props {
  paymentMethods: PaymentMethod[];
  people: Person[];
  onSuccess: (input: TransactionInput) => Promise<void>;
  onCreatePerson: (name: string, email: string | null) => Promise<Person>;
  onCancel: () => void;
  submitting: boolean;
}

export function TransactionForm({
  paymentMethods,
  people,
  onSuccess,
  onCreatePerson,
  onCancel,
  submitting,
}: Props) {
  const today = new Date().toISOString().split('T')[0];

  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState('1');
  const [purchaseDate, setPurchaseDate] = useState(today);
  const [firstInstallmentDate, setFirstInstallmentDate] = useState(today);
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [isShared, setIsShared] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');

  // Estado para crear persona al vuelo
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [creatingPerson, setCreatingPerson] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Simulación en vivo de las cuotas
  const previewInstallments = useMemo(() => {
    const amount = parseFloat(totalAmount);
    const count = parseInt(installmentsCount, 10);
    if (!isNaN(amount) && amount > 0 && !isNaN(count) && count >= 1 && count <= 60 && firstInstallmentDate) {
      return generateInstallmentSchedule(amount, count, firstInstallmentDate);
    }
    return [];
  }, [totalAmount, installmentsCount, firstInstallmentDate]);

  const handleCreateNewPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    setCreatingPerson(true);
    try {
      const created = await onCreatePerson(newPersonName.trim(), null);
      setSelectedPersonId(created.id);
      setIsAddingPerson(false);
      setNewPersonName('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al registrar persona.');
    } finally {
      setCreatingPerson(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const input: TransactionInput = {
      description,
      total_amount: parseFloat(totalAmount),
      installments_count: parseInt(installmentsCount, 10),
      purchase_date: purchaseDate,
      first_installment_date: firstInstallmentDate,
      payment_method_id: paymentMethodId ? paymentMethodId : null,
      beneficiary_person_id: isShared && selectedPersonId ? selectedPersonId : null,
    };

    const validation = validateTransactionInput(input);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (isShared && !selectedPersonId) {
      setErrors((prev) => ({
        ...prev,
        person: 'Debes seleccionar la persona a quien le prestaste la compra.',
      }));
      return;
    }

    try {
      await onSuccess(input);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la transacción.';
      setGeneralError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <h2 className="text-lg font-bold text-white">Registrar Compra / Financiación</h2>
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
            <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="tx-desc">
              Descripción de la Compra *
            </label>
            <input
              id="tx-desc"
              type="text"
              required
              placeholder="Ej: Celular Samsung, Pasajes, Supermercado"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="tx-amount">
                Monto Total ($) *
              </label>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                min={0.01}
                required
                placeholder="Ej: 120000"
                value={totalAmount}
                onChange={(e) => {
                  setTotalAmount(e.target.value);
                  if (errors.total_amount) setErrors((prev) => ({ ...prev, total_amount: '' }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {errors.total_amount && <p className="text-red-400 text-xs mt-1">{errors.total_amount}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="tx-installments">
                Cuotas *
              </label>
              <input
                id="tx-installments"
                type="number"
                min={1}
                max={60}
                required
                value={installmentsCount}
                onChange={(e) => {
                  setInstallmentsCount(e.target.value);
                  if (errors.installments_count) setErrors((prev) => ({ ...prev, installments_count: '' }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {errors.installments_count && <p className="text-red-400 text-xs mt-1">{errors.installments_count}</p>}
            </div>
          </div>

          {/* Vista previa del valor de la cuota */}
          {previewInstallments.length > 0 && (
            <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800 text-xs flex items-center justify-between">
              <span className="text-zinc-400">Plan de cuotas:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {previewInstallments.length} {previewInstallments.length === 1 ? 'pago' : 'cuotas'} de{' '}
                {formatCurrency(previewInstallments[0].amount)}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="tx-method">
              Tarjeta o Método de Pago
            </label>
            <select
              id="tx-method"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Sin método asignado / Efectivo</option>
              {paymentMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.is_own ? 'Propia' : `De: ${m.owner_name}`})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="tx-purchase-date">
                Fecha de Compra *
              </label>
              <input
                id="tx-purchase-date"
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="tx-first-inst">
                Primer Vencimiento *
              </label>
              <input
                id="tx-first-inst"
                type="date"
                required
                value={firstInstallmentDate}
                onChange={(e) => setFirstInstallmentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Sección de Consumo Prestado a Tercero */}
          <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-white">
                  ¿Es una compra prestada a un tercero?
                </span>
                <span className="text-[11px] text-zinc-400">
                  Separar para controlar lo que te deben cobrar.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
              />
            </div>

            {isShared && (
              <div className="mt-4 pt-3 border-t border-zinc-800">
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  ¿A quién le compraste esto? *
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedPersonId}
                    onChange={(e) => {
                      setSelectedPersonId(e.target.value);
                      if (errors.person) setErrors((prev) => ({ ...prev, person: '' }));
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="">Seleccionar persona...</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingPerson(true)}
                    className="px-3 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium transition-colors"
                  >
                    + Persona
                  </button>
                </div>
                {errors.person && <p className="text-red-400 text-xs mt-1">{errors.person}</p>}

                {isAddingPerson && (
                  <div className="mt-3 p-3 rounded-lg bg-zinc-800/80 border border-zinc-700 flex gap-2">
                    <input
                      type="text"
                      placeholder="Nombre de la persona (ej. Papá)"
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleCreateNewPerson}
                      disabled={creatingPerson}
                      className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold"
                    >
                      {creatingPerson ? '...' : 'Crear'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingPerson(false)}
                      className="px-2 py-1.5 rounded bg-zinc-700 text-zinc-300 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}
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
              {submitting ? 'Guardando compra...' : 'Registrar Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
