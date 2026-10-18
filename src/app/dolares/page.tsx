'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  type DollarPurchase,
  type DollarPurchaseInput,
  getDollarPurchases,
  createDollarPurchase,
  updateDollarPurchase,
  deleteDollarPurchase,
  calculateDollarSummary,
} from '@/lib/services/dollarPurchases';
import { DollarSummaryCards } from '@/components/dollars/DollarSummaryCards';
import { DollarPurchaseForm } from '@/components/dollars/DollarPurchaseForm';
import { DollarPurchasesTable } from '@/components/dollars/DollarPurchasesTable';

export default function DolaresPage() {
  const [purchases, setPurchases] = useState<DollarPurchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingPurchase, setEditingPurchase] = useState<DollarPurchase | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getDollarPurchases(supabase);
      setPurchases(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar las compras de dólares.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = useMemo(() => calculateDollarSummary(purchases), [purchases]);

  const handleOpenNew = () => {
    setEditingPurchase(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (purchase: DollarPurchase) => {
    setEditingPurchase(purchase);
    setIsFormOpen(true);
  };

  const handleSavePurchase = async (input: DollarPurchaseInput) => {
    if (editingPurchase) {
      await updateDollarPurchase(supabase, editingPurchase.id, input);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id || 'demo-user-id';
      await createDollarPurchase(supabase, input, userId);
    }
    setEditingPurchase(null);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas eliminar este registro de compra de dólares?')) return;
    try {
      setDeletingId(id);
      await deleteDollarPurchase(supabase, id);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el registro.';
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
                Stock y Compras de Dólares (USD)
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Control de tenencia de moneda extranjera, cotizaciones de compra y costo promedio ponderado.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-950 bg-white hover:bg-zinc-200 transition-colors shadow-sm font-mono"
          >
            <span>+</span>
            <span>Registrar Compra</span>
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
        <DollarSummaryCards summary={summary} />

        {/* HISTORIAL DE COMPRAS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Historial de Compras ({purchases.length})
            </h2>
          </div>

          {loading ? (
            <div className="h-44 bg-zinc-950 rounded-xl border border-zinc-800/80 animate-pulse" />
          ) : (
            <DollarPurchasesTable
              purchases={purchases}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          )}
        </div>

        {/* MODAL NUEVA / EDITAR COMPRA */}
        <DollarPurchaseForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPurchase(null);
          }}
          onSubmit={handleSavePurchase}
          editingPurchase={editingPurchase}
        />
      </div>
    </div>
  );
}
