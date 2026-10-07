'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getRecurringExpenses, type RecurringExpense } from '@/lib/services/recurringExpenses';
import { getTransactions, type TransactionWithDetails } from '@/lib/services/transactions';
import { getLoans, type LoanWithDetails } from '@/lib/services/loans';
import { calculateMonthlyConsolidated, getMonthName } from '@/lib/services/dashboard';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { DashboardMetricCards } from '@/components/dashboard/DashboardMetricCards';
import { MonthlyDueList } from '@/components/dashboard/MonthlyDueList';

export default function DashboardPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);

  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [lentLoans, setLentLoans] = useState<LoanWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [expData, txData, loansData] = await Promise.all([
        getRecurringExpenses(supabase),
        getTransactions(supabase),
        getLoans(supabase, { type: 'lent' }).catch(() => [] as LoanWithDetails[]),
      ]);
      setExpenses(expData);
      setTransactions(txData);
      setLentLoans(loansData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los datos del dashboard.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = useMemo(() => {
    return calculateMonthlyConsolidated(expenses, transactions, selectedYear, selectedMonth);
  }, [expenses, transactions, selectedYear, selectedMonth]);

  const totalLentPending = useMemo(() => {
    return lentLoans
      .filter((l) => l.loan_type === 'lent' && l.status === 'active')
      .reduce((sum, l) => sum + (Number(l.remaining_balance) || 0), 0);
  }, [lentLoans]);

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
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
              Visión integral mensual: gastos fijos, cuotas de tarjetas propias y reembolsos a cobrar.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
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
            {/* CARDS KPIS */}
            <DashboardMetricCards summary={summary} totalLentPending={totalLentPending} />

            {/* CRONOGRAMA DE VENCIMIENTOS */}
            <MonthlyDueList
              items={summary.items}
              monthName={`${getMonthName(selectedMonth)} ${selectedYear}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
