'use client';

import React, { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  type DebtorAccount,
  getPublicDebtorStatement,
} from '@/lib/services/debtors';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EstadoCuentaPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const personId = resolvedParams.id;

  const [statement, setStatement] = useState<DebtorAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const loadStatement = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        const data = await getPublicDebtorStatement(supabase, personId);
        if (!data) {
          setErrorMsg('No se encontró el estado de cuenta solicitado o el enlace no es válido.');
        } else {
          setStatement(data);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al cargar el estado de cuenta.';
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      loadStatement();
    }
  }, [personId, supabase]);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Cargando estado de cuenta en vivo...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !statement) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="text-lg font-bold text-white mb-2">Estado de cuenta no disponible</h2>
          <p className="text-xs text-slate-400 mb-6">{errorMsg}</p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-xl text-white transition-colors"
          >
            Ir al Inicio
          </a>
        </div>
      </div>
    );
  }

  const isPaidOff = statement.remaining_balance <= 0;
  const percentagePaid =
    statement.total_debt > 0
      ? Math.min(100, Math.round((statement.total_paid / statement.total_debt) * 100))
      : 100;

  const hasDirectLoans = (statement.direct_loans || []).length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ENCABEZADO CON SALUDO */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-400 text-xs font-semibold">
            <span>🛡️</span>
            <span>Portal de Consulta Transparente</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Estado de Cuenta de {statement.person.name}
          </h1>
          <p className="text-xs text-slate-400">
            Detalle sincronizado en tiempo real de consumos compartidos, préstamos directos y pagos acreditados.
          </p>
        </div>

        {/* TARJETA PRINCIPAL DE SALDO */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />

          <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${
              isPaidOff
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isPaidOff ? '✓ Deuda Totalmente Saldada' : 'Saldo Pendiente por Abonar'}
          </span>

          <div
            className={`text-4xl sm:text-5xl font-black tracking-tight mb-3 ${
              isPaidOff ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {formatMoney(statement.remaining_balance)}
          </div>

          {/* BARRA DE PROGRESO */}
          <div className="max-w-md mx-auto mb-4">
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isPaidOff ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                }`}
                style={{ width: `${percentagePaid}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5 px-1">
              <span>{percentagePaid}% pagado</span>
              <span>Total inicial: {formatMoney(statement.total_debt)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4 mt-2 max-w-md mx-auto text-left">
            <div>
              <span className="text-[11px] text-slate-400 block">Deuda Total Inicial:</span>
              <strong className="text-slate-200 text-sm">{formatMoney(statement.total_debt)}</strong>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total Acreditado:</span>
              <strong className="text-emerald-400 text-sm">{formatMoney(statement.total_paid)}</strong>
            </div>
          </div>
        </div>

        {/* DETALLE DE DINERO PRESTADO DIRECTO */}
        {hasDirectLoans && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>💵</span> Dinero Prestado Directo (A término abierto)
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                {statement.direct_loans?.length} préstamos
              </span>
            </h2>

            <div className="space-y-3">
              {statement.direct_loans?.map((loan) => (
                <div
                  key={loan.id}
                  className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <h3 className="font-semibold text-slate-100">
                      Entregado el {loan.loan_date} {loan.notes ? `• "${loan.notes}"` : ''}
                    </h3>
                    <p className="text-[11px] text-amber-400 mt-0.5">
                      {loan.expected_return_date ? `Vence: ${loan.expected_return_date}` : '♾️ Sin fecha fija de devolución (A convenir)'}
                    </p>
                  </div>
                  <div className="text-right font-bold text-emerald-400 text-sm">
                    {formatMoney(Number(loan.remaining_balance))}
                    <span className="block text-[10px] text-slate-500 font-normal">
                      de {formatMoney(Number(loan.initial_amount))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DETALLE DE COMPRAS ASOCIADAS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>💳</span> Compras en Tarjetas Asignadas
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {statement.transactions?.length || 0} compras
            </span>
          </h2>

          {statement.transactions?.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              No hay compras asignadas a tu nombre.
            </p>
          ) : (
            <div className="space-y-3">
              {statement.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <h3 className="font-semibold text-slate-100">{tx.description}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Fecha: {tx.purchase_date} • {tx.installments_count} cuota{tx.installments_count !== 1 ? 's' : ''}
                      {tx.payment_method?.name ? ` • Tarjeta: ${tx.payment_method.name}` : ''}
                    </p>
                  </div>
                  <div className="text-right font-bold text-slate-200 text-sm">
                    {formatMoney(Number(tx.total_amount))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HISTORIAL DE COBROS ACREDITADOS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Pagos y Abonos Acreditados</span>
            <span className="text-xs text-slate-400 font-normal">
              {statement.payments_received?.length || 0} abonos
            </span>
          </h2>

          {statement.payments_received?.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              Aún no se han registrado abonos o transferencias.
            </p>
          ) : (
            <div className="space-y-2.5">
              {statement.payments_received.map((pm) => (
                <div
                  key={pm.id}
                  className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-emerald-400 block">
                      +{formatMoney(Number(pm.amount))}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Fecha: {pm.payment_date} {pm.notes ? `• ${pm.notes}` : ''}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Acreditado
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PIE DE PÁGINA */}
        <div className="text-center pt-4 text-xs text-slate-500">
          Control Financiero 360° • Registro transparente y colaborativo
        </div>
      </div>
    </div>
  );
}
