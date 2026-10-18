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
    <div className="min-h-screen bg-black text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER DE LA SECCIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-mono text-sm">/</span>
              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Alertas Preventivas de Vencimiento
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Monitoreo y despacho programado de notificaciones por email preventivas (Resend) 24 horas antes de cada pago.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-400 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => loadData()}
              className="text-xs font-medium underline hover:text-white ml-4"
            >
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 bg-zinc-950 rounded-xl border border-zinc-800/80 animate-pulse"
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
