'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  type DebtorAccount,
  type PaymentReceivedInput,
  getDebtorsOverview,
  createPaymentReceived,
  deletePaymentReceived,
  calculateDebtorsGlobalSummary,
} from '@/lib/services/debtors';
import { DebtorSummaryCards } from '@/components/debtors/DebtorSummaryCards';
import { DebtorCard } from '@/components/debtors/DebtorCard';
import { PaymentReceivedModal } from '@/components/debtors/PaymentReceivedModal';
import { deletePerson } from '@/lib/services/transactions';

export default function DeudoresPage() {
  const [debtors, setDebtors] = useState<DebtorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebtorForPayment, setSelectedDebtorForPayment] = useState<DebtorAccount | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'paid_off'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getDebtorsOverview(supabase);
      setDebtors(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los deudores.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = useMemo(() => calculateDebtorsGlobalSummary(debtors), [debtors]);

  const filteredDebtors = useMemo(() => {
    if (filterTab === 'pending') {
      return debtors.filter((d) => d.remaining_balance > 0);
    }
    if (filterTab === 'paid_off') {
      return debtors.filter((d) => d.remaining_balance <= 0 || d.status === 'paid_off');
    }
    return debtors;
  }, [debtors, filterTab]);

  const handleCreatePayment = async (input: PaymentReceivedInput) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || 'demo-user-id';
    await createPaymentReceived(
      supabase,
      input,
      userId,
      selectedDebtorForPayment?.remaining_balance
    );
    await loadData();
  };

  const handleDeletePayment = async (paymentId: string) => {
    await deletePaymentReceived(supabase, paymentId);
    await loadData();
  };

  const handleDeletePerson = async (personId: string) => {
    await deletePerson(supabase, personId);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER DE LA SECCIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Gestión de Deudores y Cobros
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Control de dinero prestado en tarjetas a familiares o amigos, cobros recibidos y portal de estado de cuenta.
            </p>
          </div>

          <a
            href="/transacciones"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition-all"
          >
            <span>💳</span>
            <span>Ver Compras en Cuotas</span>
          </a>
        </div>

        {/* MENSAJES DE ERROR */}
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

        {/* CARDS DE RESUMEN METRICO */}
        <DebtorSummaryCards summary={summary} />

        {/* PESTAÑAS DE FILTRO */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filterTab === 'all'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Todos ({debtors.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filterTab === 'pending'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Con Saldo Pendiente ({summary.activeDebtorsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('paid_off')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filterTab === 'paid_off'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Saldados / Al Día ({summary.paidOffDebtorsCount})
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 bg-slate-900/40 rounded-2xl border border-slate-800/80 animate-pulse"
              />
            ))}
          </div>
        ) : filteredDebtors.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-8">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="text-base font-semibold text-white mb-1">
              No hay deudores registrados
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              {filterTab === 'all'
                ? 'Para ver deudores aquí, asigna un beneficiario al registrar una compra en la sección de Compras y Cuotas.'
                : 'No se encontraron deudores con el filtro seleccionado.'}
            </p>
            {filterTab === 'all' && (
              <a
                href="/transacciones"
                className="inline-block px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                + Ir a Registrar Compras Compartidas
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDebtors.map((debtor) => (
              <DebtorCard
                key={debtor.person.id}
                debtor={debtor}
                onOpenPaymentModal={(d) => setSelectedDebtorForPayment(d)}
                onDeletePayment={handleDeletePayment}
                onDeletePerson={handleDeletePerson}
              />
            ))}
          </div>
        )}

        {/* MODAL REGISTRAR COBRO */}
        {selectedDebtorForPayment && (
          <PaymentReceivedModal
            debtor={selectedDebtorForPayment}
            isOpen={Boolean(selectedDebtorForPayment)}
            onClose={() => setSelectedDebtorForPayment(null)}
            onSubmit={handleCreatePayment}
          />
        )}
      </div>
    </div>
  );
}
