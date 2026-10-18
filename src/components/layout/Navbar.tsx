'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/navigation';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (pathname === '/login') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/dashboard" className="flex items-center gap-2.5 font-semibold text-zinc-100 tracking-tight">
            <span className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 flex items-center justify-center text-xs font-mono font-bold">
              $
            </span>
            <span className="text-sm font-semibold tracking-tight">Finanzas 360°</span>
          </a>

          <nav className="hidden md:flex items-center gap-1 text-xs">
            <a
              href="/dashboard"
              className={`px-2.5 py-1.5 rounded-md transition-colors border ${
                pathname === '/dashboard' || pathname === '/'
                  ? 'bg-zinc-900 text-white border-zinc-700/60 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent'
              }`}
            >
              Dashboard
            </a>
            <a
              href="/metodos-pago"
              className={`px-2.5 py-1.5 rounded-md transition-colors border ${
                pathname === '/metodos-pago'
                  ? 'bg-zinc-900 text-white border-zinc-700/60 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent'
              }`}
            >
              Métodos de Pago
            </a>
            <a
              href="/gastos-recurrentes"
              className={`px-2.5 py-1.5 rounded-md transition-colors border ${
                pathname === '/gastos-recurrentes'
                  ? 'bg-zinc-900 text-white border-zinc-700/60 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent'
              }`}
            >
              Gastos Fijos
            </a>
            <a
              href="/transacciones"
              className={`px-2.5 py-1.5 rounded-md transition-colors border ${
                pathname === '/transacciones'
                  ? 'bg-zinc-900 text-white border-zinc-700/60 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent'
              }`}
            >
              Compras y Cuotas
            </a>
            <a
              href="/prestamos"
              className={`px-2.5 py-1.5 rounded-md transition-colors border ${
                pathname === '/prestamos'
                  ? 'bg-zinc-900 text-white border-zinc-700/60 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent'
              }`}
            >
              Préstamos
            </a>
            <a
              href="/deudores"
              className={`px-2.5 py-1.5 rounded-md transition-colors border ${
                pathname === '/deudores'
                  ? 'bg-zinc-900 text-white border-zinc-700/60 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent'
              }`}
            >
              Deudores
            </a>
            <a
              href="/personas"
              className={`px-2.5 py-1.5 rounded-md transition-colors border ${
                pathname === '/personas'
                  ? 'bg-zinc-900 text-white border-zinc-700/60 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent'
              }`}
            >
              Personas
            </a>
            <a
              href="/alertas"
              className={`px-2.5 py-1.5 rounded-md transition-colors border ${
                pathname === '/alertas'
                  ? 'bg-zinc-900 text-white border-zinc-700/60 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent'
              }`}
            >
              Alertas
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!loading && user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-400 hidden sm:inline-block max-w-[180px] truncate">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : !loading ? (
            <a
              href="/login"
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition-colors"
            >
              Iniciar Sesión
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
