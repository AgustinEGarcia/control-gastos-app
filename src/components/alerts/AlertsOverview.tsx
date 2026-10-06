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
    <div className="space-y-8">
      {/* TARJETAS RESUMEN DE ALERTAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* VENCIMIENTOS MAÑANA (24H) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Vencen en 24 Horas
            </span>
            <span className="text-xs text-slate-400">Mañana</span>
          </div>
          <div className="text-3xl font-bold text-amber-300 mb-2 tracking-tight">
            {summary.dueTomorrow.length}
            <span className="text-sm font-normal text-slate-400 ml-2">compromisos</span>
          </div>
          <p className="text-xs text-slate-400 border-t border-slate-800/80 pt-3 mt-3 flex justify-between">
            <span>Importe total:</span>
            <strong className="text-amber-300">{formatMoney(summary.totalAmountTomorrow)}</strong>
          </p>
        </div>

        {/* VENCIMIENTOS HOY */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-red-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold tracking-wider uppercase text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              Vencen Hoy
            </span>
            <span className="text-xs text-slate-400">Urgente</span>
          </div>
          <div className="text-3xl font-bold text-red-400 mb-2 tracking-tight">
            {summary.dueToday.length}
            <span className="text-sm font-normal text-slate-400 ml-2">compromisos</span>
          </div>
          <p className="text-xs text-slate-400 border-t border-slate-800/80 pt-3 mt-3 flex justify-between">
            <span>Atención prioritaria:</span>
            <span className="text-red-400 font-medium">Revisar fondos hoy</span>
          </p>
        </div>

        {/* PROXIMOS 7 DIAS */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Ventana Preventiva
            </span>
            <span className="text-xs text-slate-400">7 días</span>
          </div>
          <div className="text-3xl font-bold text-slate-100 mb-2 tracking-tight">
            {summary.dueNext7Days.length}
            <span className="text-sm font-normal text-slate-400 ml-2">en radar</span>
          </div>
          <p className="text-xs text-slate-400 border-t border-slate-800/80 pt-3 mt-3 flex justify-between">
            <span>Canal de despacho:</span>
            <span className="text-indigo-400 font-medium">Resend Email ($0)</span>
          </p>
        </div>
      </div>

      {/* DISPARADOR Y ESTADO DE CONEXIÓN */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>✉️</span>
            <span>Configuración y Verificación de Alertas</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Los emails preventivos se envían automáticamente cada madrugada a{' '}
            <strong className="text-indigo-300">{userEmail}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestSend}
          disabled={testing}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          <span>{testing ? '⏳' : '⚡'}</span>
          <span>{testing ? 'Evaluando...' : 'Evaluar y Enviar Alerta Ahora'}</span>
        </button>
      </div>

      {testResult && (
        <div
          className={`p-4 rounded-xl border text-xs ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {testResult.message}
        </div>
      )}

      {/* LISTADO DE PROXIMOS VENCIMIENTOS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Próximos Vencimientos en Radar (Próximos 7 días)</span>
          <span className="text-xs text-slate-400 font-normal">
            {summary.dueNext7Days.length} elementos
          </span>
        </h3>

        {summary.dueNext7Days.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            🎉 ¡Excelente! No tienes gastos fijos ni cuotas que venzan en los próximos 7 días.
          </div>
        ) : (
          <div className="space-y-3">
            {summary.dueNext7Days.map((item: DueAlertItem) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.daysUntilDue === 0
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : item.daysUntilDue === 1
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                      }`}
                    >
                      {item.daysUntilDue === 0
                        ? 'VENCE HOY'
                        : item.daysUntilDue === 1
                        ? 'VENCE MAÑANA (24h)'
                        : `En ${item.daysUntilDue} días`}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {item.type === 'recurring' ? 'Gasto Fijo' : 'Cuota de Tarjeta'}
                    </span>
                  </div>

                  <h4 className="font-semibold text-slate-100">{item.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    Fecha límite: {item.dueDate} • {item.categoryOrDetails}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-100 text-sm block">
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
