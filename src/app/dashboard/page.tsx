'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getRecurringExpenses, type RecurringExpense } from '@/lib/services/recurringExpenses';
import { getTransactions, type TransactionWithDetails } from '@/lib/services/transactions';
import { getLoans, type LoanWithDetails } from '@/lib/services/loans';
import {
  getMonthlyExpensePayments,
  toggleExpenseMonthlyPayment,
  updateInstallmentPaidStatus,
} from '@/lib/services/expensePayments';
import {
  getVariableMonthlyExpense,
  saveVariableMonthlyExpense,
  toggleVariableExpensePaid,
  type VariableMonthlyExpense,
  type VariableExpenseItem,
} from '@/lib/services/variableExpenses';
import { calculateMonthlyConsolidated, getMonthName, type MonthlyDueItem } from '@/lib/services/dashboard';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { DashboardMetricCards } from '@/components/dashboard/DashboardMetricCards';
import { MonthlyDueList } from '@/components/dashboard/MonthlyDueList';
import { VariableExpenseModal } from '@/components/dashboard/VariableExpenseModal';

export default function DashboardPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);

  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [lentLoans, setLentLoans] = useState<LoanWithDetails[]>([]);
  const [expensePayments, setExpensePayments] = useState<Record<string, boolean>>({});
  const [variableExpense, setVariableExpense] = useState<VariableMonthlyExpense | null>(null);
  const [isVarModalOpen, setIsVarModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [expData, txData, loansData, paymentsData, varData] = await Promise.all([
        getRecurringExpenses(supabase),
        getTransactions(supabase),
        getLoans(supabase, { type: 'lent' }).catch(() => [] as LoanWithDetails[]),
        getMonthlyExpensePayments(supabase, selectedYear, selectedMonth),
        getVariableMonthlyExpense(supabase, selectedYear, selectedMonth),
      ]);
      setExpenses(expData);
      setTransactions(txData);
      setLentLoans(loansData);
      setExpensePayments(paymentsData);
      setVariableExpense(varData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los datos del dashboard.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedYear, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = useMemo(() => {
    return calculateMonthlyConsolidated(
      expenses,
      transactions,
      selectedYear,
      selectedMonth,
      expensePayments,
      variableExpense
    );
  }, [expenses, transactions, selectedYear, selectedMonth, expensePayments, variableExpense]);

  const totalLentPending = useMemo(() => {
    return lentLoans
      .filter((l) => l.loan_type === 'lent' && l.status === 'active')
      .reduce((sum, l) => sum + (Number(l.remaining_balance) || 0), 0);
  }, [lentLoans]);

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const handleTogglePaid = async (item: MonthlyDueItem) => {
    const nextState = !item.isPaid;
    setTogglingId(item.id);

    try {
      if (item.type === 'variable') {
        // Actualización optimista de gasto variable
        setVariableExpense((prev) => (prev ? { ...prev, is_paid: nextState } : null));
        await toggleVariableExpensePaid(supabase, selectedYear, selectedMonth, nextState);
      } else if (item.type === 'recurring') {
        // Actualización optimista de gasto fijo
        setExpensePayments((prev) => ({
          ...prev,
          [item.targetId]: nextState,
        }));

        await toggleExpenseMonthlyPayment(
          supabase,
          item.targetId,
          selectedYear,
          selectedMonth,
          nextState
        );
      } else {
        // Actualización optimista de cuota en transacción
        setTransactions((prevTx) =>
          prevTx.map((tx) => ({
            ...tx,
            installments: (tx.installments || []).map((inst) =>
              inst.id === item.targetId ? { ...inst, is_paid: nextState } : inst
            ),
          }))
        );

        await updateInstallmentPaidStatus(supabase, item.targetId, nextState);
      }
    } catch {
      // Revertir recargando en caso de error
      loadData();
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveVariableExpense = async (payload: {
    year: number;
    month: number;
    name: string;
    amount: number;
    items: VariableExpenseItem[];
  }) => {
    const res = await saveVariableMonthlyExpense(supabase, {
      ...payload,
      is_paid: variableExpense?.is_paid ?? false,
    });

    if (res.success) {
      setVariableExpense(res.data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER DEL DASHBOARD */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Dashboard Consolidado 360°
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Visión integral mensual: gastos fijos, variables, pagos abonados y cuentas a cobrar.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsVarModalOpen(true)}
              className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-semibold rounded-xl text-purple-200 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>🛍️</span>
              <span>{variableExpense && variableExpense.amount > 0 ? 'Editar Gastos Varios' : '+ Gastos Varios'}</span>
            </button>
            <a
              href="/gastos-recurrentes"
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold rounded-xl text-slate-300 hover:text-white transition-all"
            >
              + Gastos Fijos
            </a>
            <a
              href="/transacciones"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-xl text-white shadow-md shadow-indigo-600/20 transition-all"
            >
              + Compras / Cuotas
            </a>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => loadData()}
              className="text-xs font-semibold underline hover:text-white ml-4"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* SELECTOR DE MES */}
        <MonthSelector
          year={selectedYear}
          month={selectedMonth}
          onChange={handleMonthChange}
        />

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-44 bg-slate-900/40 rounded-2xl border border-slate-800/80 animate-pulse"
                />
              ))}
            </div>
            <div className="h-72 bg-slate-900/40 rounded-2xl border border-slate-800/80 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* CARDS KPIS CON LAS 4 MÉTRICAS (TOTAL, PAGADO, PENDIENTE, A COBRAR) */}
            <DashboardMetricCards summary={summary} totalLentPending={totalLentPending} />

            {/* CRONOGRAMA DE VENCIMIENTOS Y ACCIONES DE PAGO */}
            <MonthlyDueList
              items={summary.items}
              monthName={`${getMonthName(selectedMonth)} ${selectedYear}`}
              onTogglePaid={handleTogglePaid}
              onEditVariable={() => setIsVarModalOpen(true)}
              togglingId={togglingId}
            />
          </div>
        )}

        {/* MODAL DE GASTOS VARIABLES */}
        <VariableExpenseModal
          isOpen={isVarModalOpen}
          onClose={() => setIsVarModalOpen(false)}
          year={selectedYear}
          month={selectedMonth}
          monthName={`${getMonthName(selectedMonth)} ${selectedYear}`}
          initialData={variableExpense}
          onSave={handleSaveVariableExpense}
        />
      </div>
    </div>
  );
}
