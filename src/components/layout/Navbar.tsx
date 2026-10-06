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
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/metodos-pago" className="flex items-center gap-2.5 font-bold text-white tracking-tight">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black">
              $
            </span>
            <span>Finanzas 360°</span>
          </a>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            <a
              href="/metodos-pago"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/metodos-pago'
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Métodos de Pago
            </a>
            <a
              href="/gastos-recurrentes"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/gastos-recurrentes'
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Gastos Fijos
            </a>
            <a
              href="/transacciones"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/transacciones'
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Compras y Cuotas
            </a>
            <a
              href="/prestamos"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/prestamos'
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Préstamos
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!loading && user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 hidden sm:inline-block max-w-[180px] truncate">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md border border-zinc-700 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-all"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : !loading ? (
            <a
              href="/login"
              className="px-3.5 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold transition-all shadow-sm shadow-emerald-500/20"
            >
              Iniciar Sesión
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
