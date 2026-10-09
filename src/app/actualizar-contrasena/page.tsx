'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { updateUserPassword, validatePassword } from '@/lib/services/auth';

export default function ActualizarContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Escuchar el evento de recuperación o verificar si hay sesión activa
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      // Si Supabase ya capturó el token desde el hash/code
      setIsReady(true);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = validatePassword(password, confirmPassword);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'La contraseña ingresada no es válida.');
      return;
    }

    setLoading(true);

    try {
      const result = await updateUserPassword(supabase, password);

      if (!result.success) {
        setErrorMsg(result.error || 'No se pudo actualizar la contraseña.');
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado al cambiar contraseña.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black px-4 py-12 text-zinc-100">
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 font-bold text-xl">
            🔒
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Restablecer Contraseña
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Ingresa tu nueva clave de acceso
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <span className="block text-2xl mb-1">🎉</span>
              <p className="font-semibold text-emerald-300">¡Contraseña actualizada!</p>
              <p className="text-zinc-300 text-xs mt-1">
                Tu clave ha sido redefinida con éxito. Ya puedes acceder con tus nuevas credenciales.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-block w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 text-center"
            >
              Ir a mi Panel de Control
            </Link>
            <div className="pt-2">
              <Link
                href="/login"
                className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
              >
                O volver a Iniciar Sesión
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="newPassword">
                Nueva Contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="confirmPassword">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Guardar nueva contraseña'
              )}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-6 text-center pt-6 border-t border-zinc-800">
            <Link
              href="/login"
              className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              ¿Volver al inicio de sesión?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
