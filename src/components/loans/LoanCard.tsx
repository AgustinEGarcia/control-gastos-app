'use client';

import React, { useState } from 'react';
import type { LoanWithDetails, LoanRepayment } from '@/lib/services/loans';

interface LoanCardProps {
  loan: LoanWithDetails;
  onOpenRepaymentModal: (loan: LoanWithDetails) => void;
  onDeleteLoan: (id: string) => Promise<void>;
  onDeleteRepayment: (repaymentId: string) => Promise<void>;
}

export function LoanCard({
  loan,
  onOpenRepaymentModal,
  onDeleteLoan,
  onDeleteRepayment,
}: LoanCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingRepaymentId, setDeletingRepaymentId] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: loan.currency === 'USD' ? 'USD' : 'ARS',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleDeleteLoan = async () => {
    if (confirm(`¿Estás seguro de eliminar el préstamo de ${loan.lender?.name || 'esta persona'}? Esta acción borrará también sus abonos.`)) {
      try {
        setIsDeleting(true);
        await onDeleteLoan(loan.id);
      } catch (err: any) {
        alert(err.message || 'Error al eliminar el préstamo.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteRepayment = async (repId: string) => {
    if (confirm('¿Eliminar este abono y revertir el saldo adeudado?')) {
      try {
        setDeletingRepaymentId(repId);
        await onDeleteRepayment(repId);
      } catch (err: any) {
        alert(err.message || 'Error al eliminar el abono.');
      } finally {
        setDeletingRepaymentId(null);
      }
    }
  };

  const isPaidOff = loan.remaining_balance <= 0 || loan.status === 'paid_off';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-all">
      {/* HEADER DE LA TARJETA */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                loan.currency === 'USD'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}
            >
              {loan.currency}
            </span>

            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                isPaidOff
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
              }`}
            >
              {isPaidOff ? 'Liquidado' : 'Deuda Activa'}
            </span>
          </div>

          <h4 className="text-base font-semibold text-white">
            Prestamista: {loan.lender?.name || 'Persona no especificada'}
          </h4>
          <p className="text-xs text-slate-400">
            Fecha del préstamo: {loan.loan_date}
          </p>
        </div>

        <button
          onClick={handleDeleteLoan}
          disabled={isDeleting}
          title="Eliminar préstamo"
          className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          🗑
        </button>
      </div>

      {/* DETALLES Y PROGRESO DE AMORTIZACIÓN */}
      <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 mb-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Saldo Pendiente</span>
            <span className={`text-2xl font-bold ${isPaidOff ? 'text-slate-400 line-through' : 'text-amber-400'}`}>
              {formatCurrency(loan.remaining_balance)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block mb-0.5">Monto Original</span>
            <span className="text-sm font-semibold text-slate-300">
              {formatCurrency(loan.initial_amount)}
            </span>
          </div>
        </div>

        {/* BARRA DE PROGRESO */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isPaidOff ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
            }`}
            style={{ width: `${loan.repayment_percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Amortizado: {formatCurrency(loan.total_repaid)}</span>
          <span className="font-semibold text-slate-300">{loan.repayment_percentage}% pagado</span>
        </div>
      </div>

      {loan.notes && (
        <p className="text-xs text-slate-400 italic mb-4 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
          "{loan.notes}"
        </p>
      )}

      {/* BOTONES DE ACCIÓN */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>{showHistory ? 'Ocultar historial' : 'Ver historial de abonos'}</span>
          <span>({loan.repayments?.length || 0})</span>
        </button>

        {!isPaidOff && (
          <button
            type="button"
            onClick={() => onOpenRepaymentModal(loan)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1"
          >
            <span>+</span>
            <span>Abonar</span>
          </button>
        )}
      </div>

      {/* HISTORIAL DESPLEGABLE DE ABONOS */}
      {showHistory && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 animate-in fade-in duration-200">
          <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Abonos Realizados
          </h5>

          {loan.repayments?.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">
              No se han registrado abonos para este préstamo todavía.
            </p>
          ) : (
            <div className="space-y-2">
              {loan.repayments.map((rep: LoanRepayment) => (
                <div
                  key={rep.id}
                  className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/60 text-xs"
                >
                  <div>
                    <span className="font-semibold text-emerald-400 block">
                      +{formatCurrency(rep.amount_paid)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Fecha: {rep.payment_date} {rep.notes ? `• ${rep.notes}` : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteRepayment(rep.id)}
                    disabled={deletingRepaymentId === rep.id}
                    title="Eliminar abono"
                    className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
