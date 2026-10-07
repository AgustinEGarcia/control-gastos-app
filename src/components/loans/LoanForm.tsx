'use client';

import React, { useState } from 'react';
import type { Person } from '@/lib/services/transactions';
import type { LoanInput } from '@/lib/services/loans';
import { validateLoanInput } from '@/lib/services/loans';

interface LoanFormProps {
  people: Person[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: LoanInput) => Promise<void>;
  onCreatePerson: (name: string) => Promise<Person>;
  initialType?: 'borrowed' | 'lent';
}

export function LoanForm({
  people,
  isOpen,
  onClose,
  onSubmit,
  onCreatePerson,
  initialType = 'borrowed',
}: LoanFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [loanType, setLoanType] = useState<'borrowed' | 'lent'>(initialType);
  const [personId, setPersonId] = useState<string>('');
  const [initialAmount, setInitialAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [loanDate, setLoanDate] = useState<string>(today);
  const [hasNoDueDate, setHasNoDueDate] = useState<boolean>(true);
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Creación rápida de nueva persona
  const [isCreatingPerson, setIsCreatingPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [isSavingPerson, setIsSavingPerson] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreateNewPerson = async () => {
    if (!newPersonName.trim()) return;
    try {
      setIsSavingPerson(true);
      const created = await onCreatePerson(newPersonName.trim());
      setPersonId(created.id);
      setIsCreatingPerson(false);
      setNewPersonName('');
    } catch (err: any) {
      alert(err.message || 'Error al registrar persona.');
    } finally {
      setIsSavingPerson(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const input: LoanInput = {
      lender_person_id: personId,
      loan_type: loanType,
      initial_amount: Number(initialAmount),
      currency,
      loan_date: loanDate,
      expected_return_date: !hasNoDueDate && expectedReturnDate ? expectedReturnDate : null,
      notes: notes.trim() || null,
    };

    const validation = validateLoanInput(input);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(input);
      // Reset
      setPersonId('');
      setInitialAmount('');
      setCurrency('ARS');
      setLoanDate(today);
      setHasNoDueDate(true);
      setExpectedReturnDate('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Error al guardar préstamo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLent = loanType === 'lent';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              {isLent ? 'Registrar Dinero Prestado' : 'Registrar Deuda / Préstamo Tomado'}
            </h3>
            <p className="text-xs text-slate-400">
              {isLent
                ? 'Registra plata que le prestaste a alguien para hacerle seguimiento.'
                : 'Registra un préstamo personal que recibiste y debes devolver.'}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {/* SELECTOR DE DIRECCIÓN DEL PRÉSTAMO */}
        <div className="flex p-1 bg-slate-950 rounded-xl mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => setLoanType('lent')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              isLent
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📤</span> Presté Dinero (A Cobrar)
          </button>
          <button
            type="button"
            onClick={() => setLoanType('borrowed')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              !isLent
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📥</span> Me Prestaron (A Pagar)
          </button>
        </div>

        {errors.form && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PERSONA INVOLUCRADA */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                {isLent ? 'Persona a quien le prestaste *' : 'Persona que te prestó *'}
              </label>
              {!isCreatingPerson && (
                <button
                  type="button"
                  onClick={() => setIsCreatingPerson(true)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  + Nueva Persona
                </button>
              )}
            </div>

            {isCreatingPerson ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Nombre de la persona (ej. Juan, Carlos, Papá)"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleCreateNewPerson}
                  disabled={isSavingPerson || !newPersonName.trim()}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-xl disabled:opacity-50"
                >
                  {isSavingPerson ? 'Guardando...' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingPerson(false)}
                  className="px-2.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <select
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              >
                <option value="">
                  {isLent ? 'Selecciona a quién le diste el dinero' : 'Selecciona quién te prestó el dinero'}
                </option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
            {errors.lender_person_id && (
              <p className="text-[11px] text-red-400 mt-1">{errors.lender_person_id}</p>
            )}
          </div>

          {/* MONEDA Y MONTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Divisa *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrency('ARS')}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    currency === 'ARS'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  ARS ($ Pesos)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    currency === 'USD'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  USD (US$ Dólares)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Monto Prestado *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              {errors.initial_amount && (
                <p className="text-[11px] text-red-400 mt-1">{errors.initial_amount}</p>
              )}
            </div>
          </div>

          {/* FECHA DEL PRÉSTAMO Y FECHA DE DEVOLUCIÓN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Fecha de Entrega *
              </label>
              <input
                type="date"
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              {errors.loan_date && (
                <p className="text-[11px] text-red-400 mt-1">{errors.loan_date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Fecha de Devolución
              </label>
              {hasNoDueDate ? (
                <div className="h-[42px] px-3.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center text-xs text-amber-400 font-medium">
                  ♾️ Sin fecha fija (A convenir)
                </div>
              ) : (
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              )}
            </div>
          </div>

          {/* TOGGLE SIN FECHA DE VENCIMIENTO */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="block text-xs font-medium text-white">
                ¿Sin fecha de devolución fija?
              </span>
              <span className="text-[11px] text-slate-400">
                El préstamo quedará abierto sin plazo de vencimiento forzado.
              </span>
            </div>
            <input
              type="checkbox"
              checked={hasNoDueDate}
              onChange={(e) => setHasNoDueDate(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* NOTAS / MOTIVO */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Notas / Motivo (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Transferencia para comprar repuesto de auto, efectivo en mano, etc."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-medium text-slate-950 shadow-lg transition-all disabled:opacity-50 ${
                isLent
                  ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                  : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-600/30'
              }`}
            >
              {isSubmitting
                ? 'Guardando...'
                : isLent
                ? 'Guardar Dinero Prestado'
                : 'Guardar Préstamo Tomado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
