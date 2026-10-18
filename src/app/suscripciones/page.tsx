'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  type Subscription,
  type SubscriptionInput,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  toggleSubscriptionStatus,
  deleteSubscription,
  calculateSubscriptionSummary,
} from '@/lib/services/subscriptions';
import { getPaymentMethods, type PaymentMethod } from '@/lib/services/paymentMethods';
import { SubscriptionSummaryCards } from '@/components/subscriptions/SubscriptionSummaryCards';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import { SubscriptionsTable } from '@/components/subscriptions/SubscriptionsTable';

export default function SuscripcionesPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'paused'>('all');

  const supabase = createClient();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [subsData, methodsData] = await Promise.all([
        getSubscriptions(supabase),
        getPaymentMethods(supabase),
      ]);
      setSubscriptions(subsData);
      setPaymentMethods(methodsData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar las suscripciones.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = useMemo(
    () => calculateSubscriptionSummary(subscriptions),
    [subscriptions]
  );

  const filteredSubscriptions = useMemo(() => {
    if (filterTab === 'active') return subscriptions.filter((s) => s.is_active);
    if (filterTab === 'paused') return subscriptions.filter((s) => !s.is_active);
    return subscriptions;
  }, [subscriptions, filterTab]);

  const handleOpenNew = () => {
    setEditingSubscription(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsFormOpen(true);
  };

  const handleSaveSubscription = async (input: SubscriptionInput) => {
    if (editingSubscription) {
      await updateSubscription(supabase, editingSubscription.id, input);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id || 'demo-user-id';
      await createSubscription(supabase, input, userId);
    }
    setEditingSubscription(null);
    await loadData();
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleSubscriptionStatus(supabase, id, currentStatus);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas eliminar esta suscripción periódica?')) return;
    try {
      setDeletingId(id);
      await deleteSubscription(supabase, id);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar.';
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ENCABEZADO */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-mono text-sm">/</span>
              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Control y Estimación de Suscripciones
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Monitoreo centralizado de streaming, software, débitos fijos y estimación mensual total.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-950 bg-white hover:bg-zinc-200 transition-colors shadow-sm font-mono"
          >
            <span>+</span>
            <span>Nueva Suscripción</span>
          </button>
        </div>

        {/* MENSAJE DE ERROR */}
        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-400 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => loadData()}
              className="text-xs font-medium underline hover:text-white ml-4"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* CARDS DE RESUMEN METRICO */}
        <SubscriptionSummaryCards summary={summary} />

        {/* PESTAÑAS DE FILTRO */}
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              filterTab === 'all'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            Todas ({subscriptions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              filterTab === 'active'
                ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            Activas ({summary.activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('paused')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              filterTab === 'paused'
                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
            }`}
          >
            Pausadas ({summary.pausedCount})
          </button>
        </div>

        {/* LISTADO / TABLA */}
        <div className="space-y-3">
          {loading ? (
            <div className="h-44 bg-zinc-950 rounded-xl border border-zinc-800/80 animate-pulse" />
          ) : (
            <SubscriptionsTable
              subscriptions={filteredSubscriptions}
              onToggleStatus={handleToggleStatus}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          )}
        </div>

        {/* MODAL NUEVA / EDITAR SUSCRIPCIÓN */}
        <SubscriptionForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSubscription(null);
          }}
          onSubmit={handleSaveSubscription}
          editingSubscription={editingSubscription}
          paymentMethods={paymentMethods}
        />
      </div>
    </div>
  );
}
