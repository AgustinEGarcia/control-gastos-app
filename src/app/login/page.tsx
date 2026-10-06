'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message === 'User already registered'
            ? 'Este correo electrónico ya está registrado. Intenta iniciar sesión.'
            : error.message);
        } else {
          setSuccessMsg('¡Cuenta creada con éxito! Si requiere confirmación, revisa tu correo o inicia sesión.');
          setIsRegister(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message === 'Invalid login credentials'
            ? 'Credenciales incorrectas. Verifica tu email y contraseña.'
            : error.message);
        } else {
          router.push('/metodos-pago');
          router.refresh();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
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
            $
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Control Financiero 360°
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {isRegister
              ? 'Crea tu cuenta para comenzar a gestionar tus gastos'
              : 'Inicia sesión para acceder a tu panel de control'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            ) : isRegister ? (
              'Registrarse'
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-6 text-center pt-6 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            {isRegister
              ? '¿Ya tienes una cuenta? Inicia sesión aquí'
              : '¿No tienes cuenta todavía? Regístrate gratis'}
          </button>
        </div>
      </div>
    </div>
  );
}
