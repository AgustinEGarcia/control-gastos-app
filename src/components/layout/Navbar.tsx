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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Cerrar menú móvil al navegar a otra ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push('/login');
    router.refresh();
  };

  if (pathname === '/login') {
    return null;
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', active: pathname === '/dashboard' || pathname === '/' },
    { href: '/dolares', label: 'Dólares', active: pathname === '/dolares' },
    { href: '/suscripciones', label: 'Suscripciones', active: pathname === '/suscripciones' },
    { href: '/metodos-pago', label: 'Métodos de Pago', active: pathname === '/metodos-pago' },
    { href: '/gastos-recurrentes', label: 'Gastos Fijos', active: pathname === '/gastos-recurrentes' },
    { href: '/transacciones', label: 'Compras y Cuotas', active: pathname === '/transacciones' },
    { href: '/prestamos', label: 'Préstamos', active: pathname === '/prestamos' },
    { href: '/deudores', label: 'Deudores', active: pathname === '/deudores' },
    { href: '/personas', label: 'Personas', active: pathname === '/personas' },
    { href: '/alertas', label: 'Alertas', active: pathname === '/alertas' },
  ];

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

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-1 text-xs">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1.5 rounded-md transition-colors border ${
                  link.active
                    ? 'bg-zinc-900 text-white border-zinc-700/60 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Autenticación Desktop */}
          {!loading && user ? (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-400 max-w-[180px] truncate">
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

          {/* Botón Hamburguesa Móvil */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú de navegación"
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800/80 transition-colors flex items-center justify-center text-sm font-mono"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  link.active
                    ? 'bg-zinc-900 text-white border border-zinc-700/60 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <span>{link.label}</span>
                {link.active && <span className="text-emerald-400 font-mono text-[10px]">●</span>}
              </a>
            ))}
          </nav>

          {!loading && user && (
            <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2">
              <span className="text-[11px] font-mono text-zinc-400 truncate">
                Conectado como: <strong className="text-zinc-200">{user.email}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-center px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
