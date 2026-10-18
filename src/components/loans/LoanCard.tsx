'use client';

import React, { useState } from 'react';
import type { LoanWithDetails, LoanRepayment } from '@/lib/services/loans';

interface LoanCardProps {
  loan: LoanWithDetails;
  onOpenRepaymentModal: (loan: LoanWithDetails) => void;
  onDeleteLoan: (id: string) => Promise<void>;
  onDeleteRepayment: (repaymentId: string) => Promise<void>;
  onEditLoan?: (loan: LoanWithDetails) => void;
}

export function LoanCard({
  loan,
  onOpenRepaymentModal,
  onDeleteLoan,
  onDeleteRepayment,
  onEditLoan,
}: LoanCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingRepaymentId, setDeletingRepaymentId] = useState<string | null>(null);

  const isLent = loan.loan_type === 'lent';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: loan.currency === 'USD' ? 'USD' : 'ARS',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleDeleteLoan = async () => {
    const personaNombre = loan.lender?.name || 'esta persona';
    const msj = isLent
      ? `¿Estás seguro de eliminar el dinero prestado a ${personaNombre}? Se borrarán también los abonos registrados.`
      : `¿Estás seguro de eliminar el préstamo de ${personaNombre}? Esta acción borrará también sus abonos.`;

    if (confirm(msj)) {
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
    <div className="border rounded-xl p-5 bg-zinc-950 border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
      {/* HEADER DE LA TARJETA */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {/* BADGE TIPO DE PRÉSTAMO */}
            <span
              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                isLent
                  ? 'bg-zinc-900 text-emerald-400 border-zinc-800'
                  : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              {isLent ? 'Dinero Prestado' : 'Deuda Propia'}
            </span>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-zinc-900 text-zinc-400 border-zinc-800">
              {loan.currency}
            </span>

            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isPaidOff
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {isPaidOff ? 'Liquidado' : isLent ? 'Por Cobrar' : 'Pendiente'}
            </span>
          </div>

          <h4 className="text-sm font-medium text-zinc-100">
            {isLent ? 'Deudor: ' : 'Prestamista: '}
            <span className="font-semibold text-white">{loan.lender?.name || 'Persona no especificada'}</span>
          </h4>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-zinc-500">
            <span>Entregado: {loan.loan_date}</span>
            <span>•</span>
            <span className={loan.expected_return_date ? 'text-zinc-400' : 'text-amber-400 font-medium'}>
              {loan.expected_return_date
                ? `Vence: ${loan.expected_return_date}`
                : 'Sin fecha fija'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onEditLoan && (
            <button
              onClick={() => onEditLoan(loan)}
              title={isLent ? 'Editar dinero prestado' : 'Editar préstamo'}
              className="text-zinc-500 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors text-sm"
            >
              ✏️
            </button>
          )}
          <button
            onClick={handleDeleteLoan}
            disabled={isDeleting}
            title={isLent ? 'Eliminar registro de dinero prestado' : 'Eliminar préstamo'}
            className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            🗑
          </button>
        </div>
      </div>

      {/* DETALLES Y PROGRESO DE AMORTIZACIÓN */}
      <div className="bg-zinc-900/40 rounded-lg p-3.5 border border-zinc-800/80 mb-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 block mb-0.5">
              {isLent ? 'Saldo a Cobrar' : 'Saldo Pendiente'}
            </span>
            <span className={`text-2xl font-bold font-mono ${isPaidOff ? 'text-zinc-500 line-through' : isLent ? 'text-emerald-400' : 'text-amber-400'}`}>
              {formatCurrency(loan.remaining_balance)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-zinc-500 block mb-0.5">Monto Original</span>
            <span className="text-sm font-semibold font-mono text-zinc-300">
              {formatCurrency(loan.initial_amount)}
            </span>
          </div>
        </div>

        {/* BARRA DE PROGRESO */}
        <div className="w-full bg-zinc-900 rounded-full h-1 mb-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isPaidOff ? 'bg-emerald-500' : 'bg-zinc-200'
            }`}
            style={{ width: `${loan.repayment_percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>{isLent ? 'Cobrado: ' : 'Amortizado: '} {formatCurrency(loan.total_repaid)}</span>
          <span className="text-zinc-300">{loan.repayment_percentage}% {isLent ? 'recuperado' : 'pagado'}</span>
        </div>
      </div>

      {loan.notes && (
        <p className="text-xs font-mono text-zinc-400 italic mb-4 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/40">
          "{loan.notes}"
        </p>
      )}

      {/* BOTONES DE ACCIÓN */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>{showHistory ? 'Ocultar historial' : 'Ver devoluciones / abonos'}</span>
          <span>({loan.repayments?.length || 0})</span>
        </button>

        {!isPaidOff && (
          <button
            type="button"
            onClick={() => onOpenRepaymentModal(loan)}
            className="px-3 py-1.5 text-xs font-medium font-mono rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 transition-colors flex items-center gap-1"
          >
            <span>+</span>
            <span>{isLent ? 'Registrar Cobro' : 'Abonar'}</span>
          </button>
        )}
      </div>

      {/* HISTORIAL DESPLEGABLE DE ABONOS */}
      {showHistory && (
        <div className="mt-4 pt-3 border-t border-zinc-800/60 animate-in fade-in duration-200">
          <h5 className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider mb-2">
            {isLent ? 'Pagos / Devoluciones Recibidas' : 'Abonos Realizados'}
          </h5>

          {loan.repayments?.length === 0 ? (
            <p className="text-xs font-mono text-zinc-500 py-2">
              {isLent
                ? 'Aún no se han recibido pagos de este préstamo.'
                : 'No se han registrado abonos para este préstamo todavía.'}
            </p>
          ) : (
            <div className="space-y-1.5">
              {loan.repayments.map((rep: LoanRepayment) => (
                <div
                  key={rep.id}
                  className="flex items-center justify-between p-2 bg-zinc-900/60 rounded-lg border border-zinc-800 text-xs font-mono"
                >
                  <div>
                    <span className="font-semibold text-emerald-400 block">
                      +{formatCurrency(rep.amount_paid)}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Fecha: {rep.payment_date} {rep.notes ? `• ${rep.notes}` : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteRepayment(rep.id)}
                    disabled={deletingRepaymentId === rep.id}
                    title="Eliminar abono"
                    className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors"
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
