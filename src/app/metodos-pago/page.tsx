'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  type PaymentMethod,
  type PaymentMethodInput,
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from '@/lib/services/paymentMethods';
import {
  type RecurringExpenseWithMethod,
  getRecurringExpenses,
} from '@/lib/services/recurringExpenses';
import { PaymentMethodCard } from '@/components/payment-methods/PaymentMethodCard';
import { PaymentMethodForm } from '@/components/payment-methods/PaymentMethodForm';

export default function MetodosPagoPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [expenses, setExpenses] = useState<RecurringExpenseWithMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const fetchMethods = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [methodsData, expensesData] = await Promise.all([
        getPaymentMethods(supabase),
        getRecurringExpenses(supabase),
      ]);
      setMethods(methodsData);
      setExpenses(expensesData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar los métodos de pago.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleSave = async (input: PaymentMethodInput) => {
    setSubmitting(true);
    try {
      if (editingMethod) {
        await updatePaymentMethod(supabase, editingMethod.id, input);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Debes iniciar sesión para registrar un método de pago.');
        }

        await createPaymentMethod(supabase, input, user.id);
      }
      setIsFormOpen(false);
      setEditingMethod(null);
      await fetchMethods();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este método de pago?')) return;
    setDeletingId(id);
    try {
      await deletePaymentMethod(supabase, id);
      setMethods((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar.';
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  const ownCount = methods.filter((m) => m.is_own).length;
  const thirdPartyCount = methods.filter((m) => !m.is_own).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Header y Acción Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            💳 Métodos de Pago y Tarjetas
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Administra tus tarjetas propias y de terceros, fechas de cierre y vencimiento.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMethod(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <span className="text-base leading-none">+</span>
          <span>Nuevo Método</span>
        </button>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium">Total de Métodos</span>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{methods.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-xs text-emerald-400 font-medium">Tarjetas Propias</span>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{ownCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-xs text-cyan-400 font-medium">De Terceros (Prestadas)</span>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{thirdPartyCount}</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Contenido principal: Grid de Cards o Loading o Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-zinc-900/80 border border-zinc-800" />
          ))}
        </div>
      ) : methods.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-2xl flex items-center justify-center mx-auto mb-4">
            💳
          </div>
          <h3 className="text-lg font-semibold text-white">No tienes métodos de pago registrados</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mt-1 mb-6">
            Agrega tu primera tarjeta de crédito, débito o cuenta para comenzar a organizar tus consumos y fechas de vencimiento.
          </p>
          <button
            onClick={() => {
              setEditingMethod(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all"
          >
            + Cargar primer método
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method) => {
            const cardExpenses = expenses.filter(
              (e) => e.is_active && e.payment_method_id === method.id
            );
            const count = cardExpenses.length;
            const total = cardExpenses.reduce(
              (acc, curr) => acc + Number(curr.actual_amount ?? curr.estimated_amount),
              0
            );

            return (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onDelete={handleDelete}
                onEdit={(m) => {
                  setEditingMethod(m);
                  setIsFormOpen(true);
                }}
                deleting={deletingId === method.id}
                recurringCount={count}
                recurringTotal={total}
              />
            );
          })}
        </div>
      )}

      {/* Modal Formulario */}
      {isFormOpen && (
        <PaymentMethodForm
          onSuccess={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingMethod(null);
          }}
          submitting={submitting}
          editingMethod={editingMethod}
        />
      )}
    </div>
  );
}
