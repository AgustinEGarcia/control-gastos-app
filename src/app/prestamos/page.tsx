'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  type LoanWithDetails,
  type LoanInput,
  type RepaymentInput,
  getLoans,
  createLoan,
  createRepayment,
  deleteLoan,
  deleteRepayment,
  calculateLoansSummary,
} from '@/lib/services/loans';
import {
  type Person,
  getPeople,
  createPerson,
} from '@/lib/services/transactions';
import { LoanSummaryCards } from '@/components/loans/LoanSummaryCards';
import { LoanCard } from '@/components/loans/LoanCard';
import { LoanForm } from '@/components/loans/LoanForm';
import { LoanRepaymentModal } from '@/components/loans/LoanRepaymentModal';

export default function PrestamosPage() {
  const [loans, setLoans] = useState<LoanWithDetails[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLoanForRepayment, setSelectedLoanForRepayment] = useState<LoanWithDetails | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'ARS' | 'USD' | 'paid_off'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [loansData, peopleData] = await Promise.all([
        getLoans(supabase),
        getPeople(supabase),
      ]);
      setLoans(loansData);
      setPeople(peopleData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los préstamos.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = useMemo(() => calculateLoansSummary(loans), [loans]);

  const filteredLoans = useMemo(() => {
    if (filterTab === 'ARS') {
      return loans.filter((l) => l.currency === 'ARS' && l.remaining_balance > 0);
    }
    if (filterTab === 'USD') {
      return loans.filter((l) => l.currency === 'USD' && l.remaining_balance > 0);
    }
    if (filterTab === 'paid_off') {
      return loans.filter((l) => l.remaining_balance <= 0 || l.status === 'paid_off');
    }
    return loans;
  }, [loans, filterTab]);

  const handleCreateLoan = async (input: LoanInput) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || 'demo-user-id';
    await createLoan(supabase, input, userId);
    await loadData();
  };

  const handleCreateRepayment = async (input: RepaymentInput) => {
    await createRepayment(supabase, input);
    await loadData();
  };

  const handleDeleteLoan = async (id: string) => {
    await deleteLoan(supabase, id);
    await loadData();
  };

  const handleDeleteRepayment = async (repId: string) => {
    await deleteRepayment(supabase, repId);
    await loadData();
  };

  const handleCreatePerson = async (name: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || 'demo-user-id';
    const newPerson = await createPerson(supabase, name, null, userId);
    setPeople((prev) => [...prev, newPerson].sort((a, b) => a.name.localeCompare(b.name)));
    return newPerson;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER DE LA SECCIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤝</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Préstamos y Deudas Propias
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Control de dinero prestado por familiares o terceros en ARS y USD con amortización de pagos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>+</span>
            <span>Nuevo Préstamo</span>
          </button>
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
        <LoanSummaryCards summary={summary} />

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
            Todos ({loans.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('ARS')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filterTab === 'ARS'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            En Pesos ARS ({summary.ARS.activeCount} activos)
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('USD')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filterTab === 'USD'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            En Dólares USD ({summary.USD.activeCount} activos)
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('paid_off')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filterTab === 'paid_off'
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Saldados / Cancelados ({summary.ARS.paidOffCount + summary.USD.paidOffCount})
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
        ) : filteredLoans.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-8">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="text-base font-semibold text-white mb-1">
              No hay préstamos para mostrar
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              {filterTab === 'all'
                ? 'Aún no registraste préstamos ni deudas recibidas. Comienza agregando uno nuevo.'
                : 'No se encontraron préstamos con el filtro seleccionado.'}
            </p>
            {filterTab === 'all' && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                + Registrar Primer Préstamo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLoans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onOpenRepaymentModal={(l) => setSelectedLoanForRepayment(l)}
                onDeleteLoan={handleDeleteLoan}
                onDeleteRepayment={handleDeleteRepayment}
              />
            ))}
          </div>
        )}

        {/* MODAL NUEVO PRÉSTAMO */}
        <LoanForm
          people={people}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreateLoan}
          onCreatePerson={handleCreatePerson}
        />

        {/* MODAL REGISTRAR ABONO */}
        {selectedLoanForRepayment && (
          <LoanRepaymentModal
            loan={selectedLoanForRepayment}
            isOpen={Boolean(selectedLoanForRepayment)}
            onClose={() => setSelectedLoanForRepayment(null)}
            onSubmit={handleCreateRepayment}
          />
        )}
      </div>
    </div>
  );
}
