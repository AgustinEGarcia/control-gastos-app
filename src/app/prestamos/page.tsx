'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  type LoanWithDetails,
  type LoanInput,
  type RepaymentInput,
  getLoans,
  createLoan,
  updateLoan,
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
  const [editingLoan, setEditingLoan] = useState<LoanWithDetails | null>(null);
  const [formInitialType, setFormInitialType] = useState<'borrowed' | 'lent'>('lent');
  const [selectedLoanForRepayment, setSelectedLoanForRepayment] = useState<LoanWithDetails | null>(null);
  const [typeTab, setTypeTab] = useState<'all' | 'lent' | 'borrowed'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'ARS' | 'USD' | 'paid_off'>('all');
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

  // Préstamos filtrados por tipo (presté vs me prestaron)
  const loansByType = useMemo(() => {
    if (typeTab === 'lent') return loans.filter((l) => l.loan_type === 'lent');
    if (typeTab === 'borrowed') return loans.filter((l) => l.loan_type !== 'lent');
    return loans;
  }, [loans, typeTab]);

  const summary = useMemo(() => calculateLoansSummary(loansByType), [loansByType]);

  // Préstamos con filtro de moneda y estado
  const filteredLoans = useMemo(() => {
    let result = loansByType;
    if (currencyFilter === 'ARS') {
      result = result.filter((l) => l.currency === 'ARS' && l.remaining_balance > 0);
    } else if (currencyFilter === 'USD') {
      result = result.filter((l) => l.currency === 'USD' && l.remaining_balance > 0);
    } else if (currencyFilter === 'paid_off') {
      result = result.filter((l) => l.remaining_balance <= 0 || l.status === 'paid_off');
    }
    return result;
  }, [loansByType, currencyFilter]);

  const handleOpenForm = (type: 'borrowed' | 'lent') => {
    setEditingLoan(null);
    setFormInitialType(type);
    setIsFormOpen(true);
  };

  const handleSaveLoan = async (input: LoanInput) => {
    if (editingLoan) {
      await updateLoan(supabase, editingLoan.id, input);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id || 'demo-user-id';
      await createLoan(supabase, input, userId);
    }
    setEditingLoan(null);
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

  const lentCount = loans.filter((l) => l.loan_type === 'lent').length;
  const borrowedCount = loans.filter((l) => l.loan_type !== 'lent').length;

  return (
    <div className="min-h-screen bg-black text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER DE LA SECCIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-mono text-sm">/</span>
              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Préstamos Personales y Deudas
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Control de préstamos a término abierto a terceros y pasivos propios en ARS y USD.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleOpenForm('lent')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-950 bg-white hover:bg-zinc-200 transition-colors shadow-sm"
            >
              <span>+</span>
              <span>Prestar Dinero</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenForm('borrowed')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <span>+</span>
              <span>Me Prestaron</span>
            </button>
          </div>
        </div>

        {/* MENSAJES DE ERROR */}
        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center justify-between font-mono">
            <span>{errorMsg}</span>
            <button
              onClick={() => loadData()}
              className="text-xs font-medium underline hover:text-white ml-4"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* SELECTOR PRINCIPAL: PRESTÉ VS ME PRESTARON */}
        <div className="flex p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-lg max-w-md">
          <button
            type="button"
            onClick={() => setTypeTab('all')}
            className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
              typeTab === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todos ({loans.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeTab('lent')}
            className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
              typeTab === 'lent'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Presté ({lentCount})
          </button>
          <button
            type="button"
            onClick={() => setTypeTab('borrowed')}
            className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
              typeTab === 'borrowed'
                ? 'bg-zinc-800 text-indigo-300 shadow-sm border border-indigo-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Me prestaron ({borrowedCount})
          </button>
        </div>

        {/* CARDS DE RESUMEN METRICO */}
        <LoanSummaryCards summary={summary} />

        {/* SUB-PESTAÑAS DE MONEDA */}
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setCurrencyFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              currencyFilter === 'all'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            Todas ({loansByType.length})
          </button>
          <button
            type="button"
            onClick={() => setCurrencyFilter('ARS')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              currencyFilter === 'ARS'
                ? 'bg-zinc-800 text-blue-400 border border-blue-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            ARS ({summary.ARS.activeCount} activos)
          </button>
          <button
            type="button"
            onClick={() => setCurrencyFilter('USD')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              currencyFilter === 'USD'
                ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            USD ({summary.USD.activeCount} activos)
          </button>
          <button
            type="button"
            onClick={() => setCurrencyFilter('paid_off')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              currencyFilter === 'paid_off'
                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            Saldados ({summary.ARS.paidOffCount + summary.USD.paidOffCount})
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
        ) : filteredLoans.length === 0 ? (
          <div className="text-center py-16 bg-zinc-950 rounded-xl border border-zinc-800/80 p-8">
            <h3 className="text-sm font-medium text-white mb-1">
              No hay préstamos para mostrar
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-5 font-mono">
              {typeTab === 'lent'
                ? 'Aún no registraste dinero prestado a terceros.'
                : typeTab === 'borrowed'
                ? 'Aún no registraste préstamos que te hayan otorgado a ti.'
                : 'No se encontraron préstamos con el filtro seleccionado.'}
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenForm('lent')}
                className="px-3.5 py-2 rounded-lg text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-950 transition-colors shadow-sm"
              >
                + Registrar Dinero Prestado
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLoans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onOpenRepaymentModal={(l) => setSelectedLoanForRepayment(l)}
                onDeleteLoan={handleDeleteLoan}
                onDeleteRepayment={handleDeleteRepayment}
                onEditLoan={(l) => {
                  setEditingLoan(l);
                  setFormInitialType(l.loan_type as 'borrowed' | 'lent');
                  setIsFormOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* MODAL NUEVO / EDITAR PRÉSTAMO */}
        <LoanForm
          people={people}
          isOpen={isFormOpen}
          initialType={formInitialType}
          editingLoan={editingLoan}
          onClose={() => {
            setIsFormOpen(false);
            setEditingLoan(null);
          }}
          onSubmit={handleSaveLoan}
          onCreatePerson={handleCreatePerson}
        />

        {/* MODAL REGISTRAR ABONO / COBRO */}
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
