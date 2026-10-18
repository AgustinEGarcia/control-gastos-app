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
    <div className="min-h-screen bg-black text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER DE LA SECCIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-mono text-sm">/</span>
              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Gestión de Deudores y Cobros
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Control de préstamos a terceros, saldos de compras compartidas y estados de cuenta.
            </p>
          </div>

          <a
            href="/transacciones"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <span>Ver Compras en Cuotas →</span>
          </a>
        </div>

        {/* MENSAJES DE ERROR */}
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

        {/* CARDS DE RESUMEN METRICO */}
        <DebtorSummaryCards summary={summary} />

        {/* PESTAÑAS DE FILTRO */}
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              filterTab === 'all'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            Todos ({debtors.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              filterTab === 'pending'
                ? 'bg-zinc-800 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            Con Saldo Pendiente ({summary.activeDebtorsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('paid_off')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              filterTab === 'paid_off'
                ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            Saldados / Al Día ({summary.paidOffDebtorsCount})
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-56 bg-zinc-950 rounded-xl border border-zinc-800/80 animate-pulse"
              />
            ))}
          </div>
        ) : filteredDebtors.length === 0 ? (
          <div className="text-center py-16 bg-zinc-950 rounded-xl border border-zinc-800/80 p-8">
            <h3 className="text-sm font-medium text-white mb-1">
              No hay deudores registrados
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-5 font-mono">
              {filterTab === 'all'
                ? 'Para ver deudores aquí, asigna un beneficiario al registrar una compra en la sección de Compras y Cuotas.'
                : 'No se encontraron deudores con el filtro seleccionado.'}
            </p>
            {filterTab === 'all' && (
              <a
                href="/transacciones"
                className="inline-block px-3.5 py-2 rounded-lg text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 transition-colors shadow-sm"
              >
                + Ir a Registrar Compras Compartidas
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
