'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  type RecurringExpenseWithMethod,
  type RecurringExpenseInput,
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  calculateExpenseTotals,
} from '@/lib/services/recurringExpenses';
import {
  type PaymentMethod,
  getPaymentMethods,
} from '@/lib/services/paymentMethods';
import { ExpenseSummaryCards } from '@/components/recurring-expenses/ExpenseSummaryCards';
import { ExpenseCard } from '@/components/recurring-expenses/ExpenseCard';
import { ExpenseForm } from '@/components/recurring-expenses/ExpenseForm';

export default function GastosRecurrentesPage() {
  const [expenses, setExpenses] = useState<RecurringExpenseWithMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [expenseData, methodsData] = await Promise.all([
        getRecurringExpenses(supabase),
        getPaymentMethods(supabase),
      ]);
      setExpenses(expenseData);
      setPaymentMethods(methodsData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar los gastos fijos.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totals = useMemo(() => calculateExpenseTotals(expenses), [expenses]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return ['Todas', ...Array.from(set)];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'Todas') return expenses;
    return expenses.filter((e) => e.category === selectedCategory);
  }, [expenses, selectedCategory]);

  const handleCreate = async (input: RecurringExpenseInput) => {
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Debes iniciar sesión para registrar un gasto fijo.');
      }

      await createRecurringExpense(supabase, input, user.id);
      setIsFormOpen(false);
      await fetchExpenses();
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateActual = async (id: string, amount: number | null) => {
    try {
      await updateRecurringExpense(supabase, id, { actual_amount: amount });
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, actual_amount: amount } : e))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar monto.';
      alert(msg);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateRecurringExpense(supabase, id, { is_active: isActive });
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_active: isActive } : e))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar estado.';
      alert(msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecurringExpense(supabase, id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar.';
      alert(msg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Header y Acción Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            📋 Gastos Fijos Recurrentes
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Plantilla mensual de gastos 100% propios, fechas de pago y ajuste a facturas reales.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <span className="text-base leading-none">+</span>
          <span>Nuevo Gasto Fijo</span>
        </button>
      </div>

      {/* Tarjetas de Resumen y Métricas */}
      <ExpenseSummaryCards totals={totals} />

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Filtro por Categorías */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-zinc-800 text-white font-semibold border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid de Gastos o Loading o Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-zinc-900/80 border border-zinc-800" />
          ))}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-2xl flex items-center justify-center mx-auto mb-4">
            📋
          </div>
          <h3 className="text-lg font-semibold text-white">
            {selectedCategory === 'Todas'
              ? 'No tienes gastos fijos registrados todavía'
              : `No hay gastos en la categoría "${selectedCategory}"`}
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mt-1 mb-6">
            Registra tu alquiler, servicios de luz, internet o suscripciones para proyectar tu costo de vida del mes.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all"
          >
            + Cargar primer gasto fijo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onUpdateActualAmount={handleUpdateActual}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Formulario */}
      {isFormOpen && (
        <ExpenseForm
          onSuccess={handleCreate}
          onCancel={() => setIsFormOpen(false)}
          submitting={submitting}
          paymentMethods={paymentMethods}
        />
      )}
    </div>
  );
}
