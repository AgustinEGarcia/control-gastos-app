import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si el usuario ya inició sesión, redirigir directamente a su Dashboard 360°
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
      {/* Badge Superior */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        Gestión Financiera Personal 360°
      </div>

      {/* Titular Principal */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mb-6 leading-tight">
        Control total de tus{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
          gastos, tarjetas y préstamos
        </span>
      </h1>

      <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
        Separa tus compras reales de lo que prestas a terceros. Supervisa fechas de cierre y vencimiento, cuotas pendientes y préstamos en ARS y USD con costo $0.
      </p>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-sm mb-16">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
        >
          Ir al Dashboard
        </Link>
        <Link
          href="/login"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm transition-all"
        >
          Iniciar Sesión
        </Link>
      </div>

      {/* Pilares del Producto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
          <div className="text-2xl mb-3">💳</div>
          <h2 className="text-base font-semibold text-white mb-1.5">Tarjetas y Financiamientos</h2>
          <p className="text-sm text-zinc-400">
            Días de cierre, vencimiento y cuotas fijas en Mercado Crédito y bancos tradicionales.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
          <div className="text-2xl mb-3">🤝</div>
          <h2 className="text-base font-semibold text-white mb-1.5">Consumos Compartidos</h2>
          <p className="text-sm text-zinc-400">
            Asigna consumos a amigos o familiares dentro de tus tarjetas y separa lo tuyo de lo a cobrar.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all">
          <div className="text-2xl mb-3">💵</div>
          <h2 className="text-base font-semibold text-white mb-1.5">Préstamos Multidivisa</h2>
          <p className="text-sm text-zinc-400">
            Control de deudas personales recibidas en ARS y USD con historial de abonos parciales.
          </p>
        </div>
      </div>
    </div>
  );
}
