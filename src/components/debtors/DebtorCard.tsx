'use client';

import React, { useState } from 'react';
import type { DebtorAccount, PaymentReceived } from '@/lib/services/debtors';

interface DebtorCardProps {
  debtor: DebtorAccount;
  onOpenPaymentModal: (debtor: DebtorAccount) => void;
  onDeletePayment: (paymentId: string) => Promise<void>;
  onDeletePerson?: (personId: string) => Promise<void>;
}

export function DebtorCard({
  debtor,
  onOpenPaymentModal,
  onDeletePayment,
  onDeletePerson,
}: DebtorCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [isDeletingPerson, setIsDeletingPerson] = useState(false);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const isPaidOff = debtor.remaining_balance <= 0 || debtor.status === 'paid_off';
  const percentageRecovered =
    debtor.total_debt > 0
      ? Math.min(100, Math.round((debtor.total_paid / debtor.total_debt) * 100))
      : 100;

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/estado-cuenta/${debtor.person.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDeletePayment = async (pId: string) => {
    if (confirm('¿Eliminar este cobro y revertir el saldo adeudado por esta persona?')) {
      try {
        setDeletingPaymentId(pId);
        await onDeletePayment(pId);
      } catch (err: any) {
        alert(err.message || 'Error al eliminar el cobro.');
      } finally {
        setDeletingPaymentId(null);
      }
    }
  };

  const handleDeletePersonClick = async () => {
    if (!onDeletePerson) return;
    if (
      !confirm(
        `¿Deseas eliminar a la persona "${debtor.person.name}"? Se verificará que no tenga ningún gasto o préstamo vinculado.`
      )
    )
      return;

    try {
      setIsDeletingPerson(true);
      await onDeletePerson(debtor.person.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar persona.';
      alert(msg);
    } finally {
      setIsDeletingPerson(false);
    }
  };

  const hasDirectLoans = (debtor.direct_loans || []).length > 0;

  return (
    <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
      {/* HEADER DE LA TARJETA */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                isPaidOff
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {isPaidOff ? 'Saldado / Al Día' : 'Saldo Pendiente'}
            </span>

            <span className="text-[11px] text-zinc-400 font-mono">
              {debtor.transactions?.length || 0} compras en tarjeta
            </span>

            {hasDirectLoans && (
              <span className="text-[11px] text-zinc-300 font-mono">
                • {debtor.direct_loans?.length} préstamos directos
              </span>
            )}
          </div>

          <h4 className="text-sm font-semibold text-white">
            {debtor.person.name}
          </h4>
          {debtor.person.email && (
            <p className="text-xs text-zinc-400 font-mono">{debtor.person.email}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyLink}
            title="Copiar enlace del portal público para esta persona"
            className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors flex items-center gap-1.5 ${
              copied
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            <span>{copied ? '✓' : '🔗'}</span>
            <span>{copied ? 'Copiado' : 'Compartir'}</span>
          </button>

          {onDeletePerson && (
            <button
              type="button"
              onClick={handleDeletePersonClick}
              disabled={isDeletingPerson}
              title={`Eliminar persona (${debtor.person.name})`}
              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 rounded-lg border border-transparent transition-colors text-xs disabled:opacity-30"
            >
              {isDeletingPerson ? '...' : '✕'}
            </button>
          )}
        </div>
      </div>

      {/* DETALLES DE SALDO Y PROGRESO */}
      <div className="bg-zinc-900/40 rounded-lg p-3.5 border border-zinc-800/80 mb-3">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-[10px] text-zinc-400 font-mono block mb-0.5">Pendiente a Cobrar</span>
            <span className={`text-xl font-bold font-mono ${isPaidOff ? 'text-zinc-500 line-through' : 'text-amber-400'}`}>
              {formatMoney(debtor.remaining_balance)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 font-mono block mb-0.5">Deuda Original</span>
            <span className="text-xs font-semibold font-mono text-zinc-300">
              {formatMoney(debtor.total_debt)}
            </span>
          </div>
        </div>

        {/* DESGLOSE DISCRIMINADO: TARJETAS VS PRÉSTAMOS DIRECTOS */}
        {(debtor.card_debt > 0 || debtor.direct_loans_debt > 0) && (
          <div className="flex items-center gap-2 mb-2.5 pt-2 border-t border-zinc-800/60 text-xs font-mono">
            {debtor.card_debt > 0 && (
              <span className="px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 text-[10px]">
                Tarjetas: {formatMoney(debtor.card_debt)}
              </span>
            )}
            {debtor.direct_loans_debt > 0 && (
              <span className="px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 text-[10px]">
                Directo: {formatMoney(debtor.direct_loans_debt)}
              </span>
            )}
          </div>
        )}

        {/* BARRA DE PROGRESO */}
        <div className="w-full bg-zinc-800/80 rounded-full h-1.5 mb-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isPaidOff ? 'bg-emerald-400' : 'bg-white'
            }`}
            style={{ width: `${percentageRecovered}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
          <span>Cobrado: {formatMoney(debtor.total_paid)}</span>
          <span className="text-zinc-300">{percentageRecovered}% abonado</span>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-zinc-400 hover:text-white font-mono flex items-center gap-1 transition-colors"
        >
          <span>{showDetails ? 'Ocultar detalles' : 'Ver detalle'}</span>
          <span>({debtor.payments_received?.length || 0} cobros)</span>
        </button>

        {!isPaidOff && (
          <button
            type="button"
            onClick={() => onOpenPaymentModal(debtor)}
            className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium rounded-lg transition-colors shadow-sm flex items-center gap-1"
          >
            <span>+</span>
            <span>Acreditar Cobro</span>
          </button>
        )}
      </div>

      {/* DETALLES DESPLEGABLES */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-zinc-800/60 space-y-3">
          {/* PRÉSTAMOS DIRECTOS */}
          {hasDirectLoans && (
            <div>
              <h5 className="text-[10px] font-mono font-medium text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                Dinero Prestado Directo
              </h5>
              <div className="space-y-1.5">
                {debtor.direct_loans?.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-2.5 bg-zinc-900/40 rounded-lg border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-zinc-200 block text-xs">
                        Préstamo {loan.loan_date} {loan.notes ? `• ${loan.notes}` : ''}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {loan.expected_return_date ? `Vence: ${loan.expected_return_date}` : 'Sin fecha fija'}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-semibold text-emerald-400 block text-xs">
                        {formatMoney(Number(loan.remaining_balance))}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        de {formatMoney(Number(loan.initial_amount))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMPRAS EN TARJETA */}
          <div>
            <h5 className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Compras en Tarjetas Propias
            </h5>
            {debtor.transactions?.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono">Sin consumos en tarjeta asignados.</p>
            ) : (
              <div className="space-y-1.5">
                {debtor.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 bg-zinc-900/40 rounded-lg border border-zinc-800/80 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="text-zinc-200 block text-xs font-sans font-medium">{tx.description}</span>
                      <span className="text-[10px] text-zinc-500">
                        {tx.purchase_date} • {tx.installments_count} cuota{tx.installments_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="font-semibold text-zinc-200 text-xs">
                      {formatMoney(Number(tx.total_amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HISTORIAL DE COBROS ACREDITADOS */}
          <div>
            <h5 className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Cobros Recibidos
            </h5>
            {debtor.payments_received?.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono">No se han registrado cobros aún.</p>
            ) : (
              <div className="space-y-1.5">
                {debtor.payments_received.map((pm: PaymentReceived) => (
                  <div
                    key={pm.id}
                    className="p-2.5 bg-zinc-900/40 rounded-lg border border-zinc-800/80 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="font-semibold text-emerald-400 block text-xs">
                        +{formatMoney(Number(pm.amount))}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {pm.payment_date} {pm.notes ? `• ${pm.notes}` : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletePayment(pm.id)}
                      disabled={deletingPaymentId === pm.id}
                      title="Eliminar cobro"
                      className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
