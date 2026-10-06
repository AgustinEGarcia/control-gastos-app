'use client';

import React, { useState } from 'react';
import type { DebtorAccount, PaymentReceived } from '@/lib/services/debtors';

interface DebtorCardProps {
  debtor: DebtorAccount;
  onOpenPaymentModal: (debtor: DebtorAccount) => void;
  onDeletePayment: (paymentId: string) => Promise<void>;
}

export function DebtorCard({
  debtor,
  onOpenPaymentModal,
  onDeletePayment,
}: DebtorCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-all">
      {/* HEADER DE LA TARJETA */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                isPaidOff
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
              }`}
            >
              {isPaidOff ? 'Saldado / Al Día' : 'Saldo Pendiente'}
            </span>

            <span className="text-[11px] text-slate-400">
              {debtor.transactions?.length || 0} compras asociadas
            </span>
          </div>

          <h4 className="text-base font-semibold text-white">
            {debtor.person.name}
          </h4>
          {debtor.person.email && (
            <p className="text-xs text-slate-400">{debtor.person.email}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          title="Copiar enlace del portal público para esta persona"
          className={`px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-all flex items-center gap-1.5 ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-950 text-indigo-400 hover:text-indigo-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span>{copied ? '✓' : '🔗'}</span>
          <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
        </button>
      </div>

      {/* DETALLES DE SALDO Y PROGRESO */}
      <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 mb-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-[11px] text-slate-400 block mb-0.5">Pendiente por Cobrar</span>
            <span className={`text-2xl font-bold ${isPaidOff ? 'text-slate-400 line-through' : 'text-amber-400'}`}>
              {formatMoney(debtor.remaining_balance)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block mb-0.5">Consumo Total</span>
            <span className="text-sm font-semibold text-slate-300">
              {formatMoney(debtor.total_debt)}
            </span>
          </div>
        </div>

        {/* BARRA DE PROGRESO */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isPaidOff ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
            }`}
            style={{ width: `${percentageRecovered}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Cobrado: {formatMoney(debtor.total_paid)}</span>
          <span className="font-semibold text-slate-300">{percentageRecovered}% abonado</span>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>{showDetails ? 'Ocultar detalles' : 'Ver detalle de compras y cobros'}</span>
          <span>({debtor.payments_received?.length || 0} cobros)</span>
        </button>

        {!isPaidOff && (
          <button
            type="button"
            onClick={() => onOpenPaymentModal(debtor)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1"
          >
            <span>+</span>
            <span>Acreditar Cobro</span>
          </button>
        )}
      </div>

      {/* DETALLES DESPLEGABLES */}
      {showDetails && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-4 animate-in fade-in duration-200">
          {/* COMPRAS ASOCIADAS */}
          <div>
            <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Compras en Tarjetas Propias
            </h5>
            {debtor.transactions?.length === 0 ? (
              <p className="text-xs text-slate-500">Sin consumos en tarjeta asignados.</p>
            ) : (
              <div className="space-y-1.5">
                {debtor.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-slate-200 block">{tx.description}</span>
                      <span className="text-[11px] text-slate-400">
                        {tx.purchase_date} • {tx.installments_count} cuota{tx.installments_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-200">
                      {formatMoney(Number(tx.total_amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HISTORIAL DE COBROS ACREDITADOS */}
          <div>
            <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Cobros Recibidos
            </h5>
            {debtor.payments_received?.length === 0 ? (
              <p className="text-xs text-slate-500">No se han registrado cobros aún.</p>
            ) : (
              <div className="space-y-1.5">
                {debtor.payments_received.map((pm: PaymentReceived) => (
                  <div
                    key={pm.id}
                    className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-emerald-400 block">
                        +{formatMoney(Number(pm.amount))}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Fecha: {pm.payment_date} {pm.notes ? `• ${pm.notes}` : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletePayment(pm.id)}
                      disabled={deletingPaymentId === pm.id}
                      title="Eliminar cobro"
                      className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
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
