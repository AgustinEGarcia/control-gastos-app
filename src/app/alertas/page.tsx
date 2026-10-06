'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getRecurringExpenses, type RecurringExpense } from '@/lib/services/recurringExpenses';
import { getTransactions, type TransactionWithDetails } from '@/lib/services/transactions';
import { consolidateAlerts } from '@/lib/services/alerts';
import { AlertsOverview } from '@/components/alerts/AlertsOverview';

export default function AlertasPage() {
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [userEmail, setUserEmail] = useState<string>('usuario@ejemplo.com');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [expData, txData, authRes] = await Promise.all([
        getRecurringExpenses(supabase),
        getTransactions(supabase),
        supabase.auth.getUser(),
      ]);

      setExpenses(expData);
      setTransactions(txData);
      if (authRes.data.user?.email) {
        setUserEmail(authRes.data.user.email);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los datos de alertas.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = useMemo(
    () => consolidateAlerts(expenses, transactions),
    [expenses, transactions]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER DE LA SECCIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Alertas Preventivas de Vencimiento
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Monitoreo y despacho automático de notificaciones por email (Resend) 24 horas antes de cada pago.
            </p>
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 bg-slate-900/40 rounded-2xl border border-slate-800/80 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <AlertsOverview summary={summary} userEmail={userEmail} />
        )}
      </div>
    </div>
  );
}
