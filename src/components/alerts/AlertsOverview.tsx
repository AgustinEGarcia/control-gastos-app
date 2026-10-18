'use client';

import React, { useState } from 'react';
import type { AlertsSummary, DueAlertItem } from '@/lib/services/alerts';
import { formatMoney } from '@/lib/services/alerts';

interface AlertsOverviewProps {
  summary: AlertsSummary;
  userEmail: string;
}

export function AlertsOverview({ summary, userEmail }: AlertsOverviewProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestSend = async () => {
    try {
      setTesting(true);
      setTestResult(null);

      const res = await fetch('/api/alerts/check-due-dates', {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        setTestResult({
          success: true,
          message: data.sendResult?.simulated
            ? `Simulación exitosa: Se evaluaron ${data.itemsToNotifyCount} vencimientos próximos (Modo Simulación).`
            : `¡Alerta despachada! Se enviaron ${data.itemsToNotifyCount} vencimientos a ${userEmail}.`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Error al disparar la alerta.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Error de red al conectar con el servicio.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TARJETAS RESUMEN DE ALERTAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* VENCIMIENTOS MAÑANA (24H) */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Vencen en 24h
            </span>
            <span className="text-xs text-zinc-400 font-mono">Mañana</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mb-2 tracking-tight">
            {summary.dueTomorrow.length}
            <span className="text-xs font-normal text-zinc-400 ml-2 font-sans">compromisos</span>
          </div>
          <p className="text-xs text-zinc-400 border-t border-zinc-800/80 pt-2.5 mt-2.5 flex justify-between font-mono">
            <span>Importe total:</span>
            <strong className="text-amber-300 font-medium">{formatMoney(summary.totalAmountTomorrow)}</strong>
          </p>
        </div>

        {/* VENCIMIENTOS HOY */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              Vencen Hoy
            </span>
            <span className="text-xs text-zinc-400 font-mono">Urgente</span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mb-2 tracking-tight">
            {summary.dueToday.length}
            <span className="text-xs font-normal text-zinc-400 ml-2 font-sans">compromisos</span>
          </div>
          <p className="text-xs text-zinc-400 border-t border-zinc-800/80 pt-2.5 mt-2.5 flex justify-between font-mono">
            <span>Atención:</span>
            <span className="text-rose-400">Revisar fondos hoy</span>
          </p>
        </div>

        {/* PROXIMOS 7 DIAS */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-zinc-300 bg-zinc-800/60 px-2 py-0.5 rounded-full border border-zinc-700/60">
              Ventana Preventiva
            </span>
            <span className="text-xs text-zinc-400 font-mono">7 días</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-2 tracking-tight">
            {summary.dueNext7Days.length}
            <span className="text-xs font-normal text-zinc-400 ml-2 font-sans">en radar</span>
          </div>
          <p className="text-xs text-zinc-400 border-t border-zinc-800/80 pt-2.5 mt-2.5 flex justify-between font-mono">
            <span>Canal de aviso:</span>
            <span className="text-zinc-300">Resend Email</span>
          </p>
        </div>
      </div>

      {/* DISPARADOR Y ESTADO DE CONEXIÓN */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Configuración y Verificación de Alertas
          </h3>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Notificaciones por email automáticas programadas cada madrugada a{' '}
            <strong className="text-zinc-200">{userEmail}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestSend}
          disabled={testing}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-950 bg-white hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50"
        >
          <span>{testing ? 'Evaluando...' : 'Evaluar y Enviar Alerta Ahora'}</span>
        </button>
      </div>

      {testResult && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-mono ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {testResult.message}
        </div>
      )}

      {/* LISTADO DE PROXIMOS VENCIMIENTOS */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5">
        <h3 className="text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Próximos Vencimientos en Radar (Próximos 7 días)</span>
          <span className="text-xs text-zinc-400 font-normal">
            {summary.dueNext7Days.length} elementos
          </span>
        </h3>

        {summary.dueNext7Days.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-xs font-mono">
            No tienes gastos fijos ni cuotas que venzan en los próximos 7 días.
          </div>
        ) : (
          <div className="space-y-2.5">
            {summary.dueNext7Days.map((item: DueAlertItem) => (
              <div
                key={item.id}
                className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                        item.daysUntilDue === 0
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : item.daysUntilDue === 1
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700/60'
                      }`}
                    >
                      {item.daysUntilDue === 0
                        ? 'VENCE HOY'
                        : item.daysUntilDue === 1
                        ? 'VENCE MAÑANA'
                        : `En ${item.daysUntilDue} días`}
                    </span>
                    <span className="text-zinc-400 font-mono text-[10px]">
                      {item.type === 'recurring' ? 'Gasto Fijo' : 'Cuota de Tarjeta'}
                    </span>
                  </div>

                  <h4 className="font-medium text-zinc-100">{item.title}</h4>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Límite: {item.dueDate} • {item.categoryOrDetails}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-zinc-100 font-mono text-sm block">
                    {formatMoney(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
