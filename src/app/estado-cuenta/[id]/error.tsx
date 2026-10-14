'use client';

import React, { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function EstadoCuentaError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Error en portal de estado de cuenta:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-lg font-bold text-white mb-2">No se pudo cargar el estado de cuenta</h2>
        <p className="text-xs text-slate-400 mb-6">
          Ocurrió un problema temporal al sincronizar la información. Por favor, reintenta o vuelve al inicio.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-xl text-white transition-colors"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            Ir al Inicio
          </a>
        </div>
      </div>
    </div>
  );
}
