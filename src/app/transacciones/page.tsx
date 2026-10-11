'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  type TransactionWithDetails,
  type TransactionInput,
  type UpdateTransactionInput,
  type Person,
  getTransactions,
  createTransactionWithInstallments,
  updateTransaction,
  deleteTransaction,
  toggleInstallmentPaid,
  calculateTransactionSummaries,
  getPeople,
  createPerson,
} from '@/lib/services/transactions';
import {
  type PaymentMethod,
  getPaymentMethods,
} from '@/lib/services/paymentMethods';
import {
  type RecurringExpenseInput,
  createRecurringExpense,
} from '@/lib/services/recurringExpenses';
import { TransactionSummaryCards } from '@/components/transactions/TransactionSummaryCards';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal';

export default function TransaccionesPage() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithDetails | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'own' | 'shared'>('all');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [txs, methods, peopleData] = await Promise.all([
        getTransactions(supabase),
        getPaymentMethods(supabase),
        getPeople(supabase),
      ]);
      setTransactions(txs);
      setPaymentMethods(methods);
      setPeople(peopleData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar las transacciones.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summaries = useMemo(
    () => calculateTransactionSummaries(transactions),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Filtro por pestaña (propios vs compartidos)
      if (activeTab === 'own' && t.beneficiary_person_id) return false;
      if (activeTab === 'shared' && !t.beneficiary_person_id) return false;

      // Filtro por método de pago
      if (selectedMethodId !== 'all' && t.payment_method_id !== selectedMethodId) {
        return false;
      }

      return true;
    });
  }, [transactions, activeTab, selectedMethodId]);

  const handleCreateTransaction = async (input: TransactionInput) => {
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Debes iniciar sesión para registrar una transacción.');
      }

      await createTransactionWithInstallments(supabase, input, user.id);
      setIsFormOpen(false);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRecurring = async (input: RecurringExpenseInput) => {
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Debes iniciar sesión para registrar una suscripción.');
      }

      await createRecurringExpense(supabase, input, user.id);
      setIsFormOpen(false);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePerson = async (name: string, email: string | null): Promise<Person> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado.');

    const newPerson = await createPerson(supabase, name, email, user.id);
    setPeople((prev) => [...prev, newPerson]);
    return newPerson;
  };

  const handleToggleInstallment = async (installmentId: string, isPaid: boolean) => {
    try {
      await toggleInstallmentPaid(supabase, installmentId, isPaid);
      setTransactions((prev) =>
        prev.map((t) => ({
          ...t,
          installments: t.installments.map((inst) =>
            inst.id === installmentId ? { ...inst, is_paid: isPaid } : inst
          ),
        }))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al actualizar cuota.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(supabase, id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al eliminar transacción.');
    }
  };

  const handleUpdateTransaction = async (id: string, input: UpdateTransactionInput) => {
    await updateTransaction(supabase, id, input);
    await loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Header y Acción Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            💳 Tarjetas, Cuotas y Compras
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Supervisa tus compras financiadas, cuotas pendientes y dinero a cobrar a terceros.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <span className="text-base leading-none">+</span>
          <span>Registrar Compra</span>
        </button>
      </div>

      {/* Tarjetas de Resumen */}
      <TransactionSummaryCards summaries={summaries} />

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Barra de Filtros: Pestañas de tipo y Selector de Tarjeta/Método */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            Todas las compras ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('own')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'own'
                ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            Consumos Propios ({transactions.filter((t) => !t.beneficiary_person_id).length})
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'shared'
                ? 'bg-zinc-800 text-cyan-400 border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            A Cobrar ({transactions.filter((t) => Boolean(t.beneficiary_person_id)).length})
          </button>
        </div>

        {/* Filtro por Método de Pago */}
        <div className="flex items-center gap-2">
          <label htmlFor="method-filter" className="text-xs text-zinc-400 whitespace-nowrap">
            💳 Tarjeta:
          </label>
          <select
            id="method-filter"
            value={selectedMethodId}
            onChange={(e) => setSelectedMethodId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[200px] truncate"
          >
            <option value="all">Todas las tarjetas</option>
            {paymentMethods.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listado en Renglones o Empty State */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-900/80 border border-zinc-800" />
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-2xl flex items-center justify-center mx-auto mb-4">
            🛍️
          </div>
          <h3 className="text-lg font-semibold text-white">
            {activeTab === 'all' && selectedMethodId === 'all'
              ? 'No tienes compras en cuotas registradas'
              : selectedMethodId !== 'all'
              ? 'No hay consumos registrados para la tarjeta seleccionada'
              : activeTab === 'own'
              ? 'No tienes compras propias en este filtro'
              : 'No tienes compras prestadas a terceros'}
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mt-1 mb-6">
            Registra consumos con tarjetas o financiamientos para seguir el plan de pagos cuota a cuota.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all"
          >
            + Registrar primera compra
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              onToggleInstallment={handleToggleInstallment}
              onDelete={handleDeleteTransaction}
              onEdit={(t) => setEditingTransaction(t)}
            />
          ))}
        </div>
      )}


      {/* Modal Formulario */}
      {isFormOpen && (
        <TransactionForm
          paymentMethods={paymentMethods}
          people={people}
          onSuccess={handleCreateTransaction}
          onCreateRecurringExpense={handleCreateRecurring}
          onCreatePerson={handleCreatePerson}
          onCancel={() => setIsFormOpen(false)}
          submitting={submitting}
        />
      )}

      {/* Modal Editar Compra */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          paymentMethods={paymentMethods}
          people={people}
          isOpen={Boolean(editingTransaction)}
          onClose={() => setEditingTransaction(null)}
          onSave={handleUpdateTransaction}
        />
      )}
    </div>
  );
}
