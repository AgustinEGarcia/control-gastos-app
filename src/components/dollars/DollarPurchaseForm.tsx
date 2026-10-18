'use client';

import React, { useState, useEffect } from 'react';
import type { DollarPurchase, DollarPurchaseInput } from '@/lib/services/dollarPurchases';
import { validateDollarPurchaseInput, formatMoneyArs } from '@/lib/services/dollarPurchases';

interface DollarPurchaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: DollarPurchaseInput) => Promise<void>;
  editingPurchase?: DollarPurchase | null;
}

export function DollarPurchaseForm({
  isOpen,
  onClose,
  onSubmit,
  editingPurchase,
}: DollarPurchaseFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [purchaseDate, setPurchaseDate] = useState<string>(today);
  const [amountUsd, setAmountUsd] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (editingPurchase) {
      setPurchaseDate(editingPurchase.purchase_date);
      setAmountUsd(editingPurchase.amount_usd.toString());
      setExchangeRate(editingPurchase.exchange_rate.toString());
      setNotes(editingPurchase.notes || '');
    } else {
      setPurchaseDate(today);
      setAmountUsd('');
      setExchangeRate('');
      setNotes('');
    }
    setErrors({});
    setGeneralError(null);
  }, [editingPurchase, isOpen, today]);

  if (!isOpen) return null;

  const parsedUsd = parseFloat(amountUsd) || 0;
  const parsedRate = parseFloat(exchangeRate) || 0;
  const estimatedTotalArs = parsedUsd > 0 && parsedRate > 0 ? parsedUsd * parsedRate : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const input: DollarPurchaseInput = {
      purchase_date: purchaseDate,
      amount_usd: parsedUsd,
      exchange_rate: parsedRate,
      notes: notes.trim() || null,
    };

    const validation = validateDollarPurchaseInput(input);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(input);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la compra de dólares.';
      setGeneralError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl bg-zinc-950 border border-zinc-800/80 p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {editingPurchase ? 'Editar Compra de Dólares' : 'Registrar Compra de Dólares'}
            </h2>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Control de stock y cotización de ingreso
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors text-xs p-1"
          >
            ✕
          </button>
        </div>

        {generalError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* FECHA DE COMPRA */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="usd-date">
              Fecha de Compra *
            </label>
            <input
              id="usd-date"
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => {
                setPurchaseDate(e.target.value);
                if (errors.purchase_date) setErrors((prev) => ({ ...prev, purchase_date: '' }));
              }}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-zinc-500 transition-colors"
            />
            {errors.purchase_date && (
              <p className="text-rose-400 text-xs font-mono mt-1">{errors.purchase_date}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* CANTIDAD DE USD */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="usd-amount">
                Cantidad (USD) *
              </label>
              <input
                id="usd-amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Ej: 500.00"
                value={amountUsd}
                onChange={(e) => {
                  setAmountUsd(e.target.value);
                  if (errors.amount_usd) setErrors((prev) => ({ ...prev, amount_usd: '' }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-zinc-500 transition-colors"
              />
              {errors.amount_usd && (
                <p className="text-rose-400 text-xs font-mono mt-1">{errors.amount_usd}</p>
              )}
            </div>

            {/* COTIZACIÓN PAGADA */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="usd-rate">
                Cotización ($ ARS) *
              </label>
              <input
                id="usd-rate"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Ej: 1350.00"
                value={exchangeRate}
                onChange={(e) => {
                  setExchangeRate(e.target.value);
                  if (errors.exchange_rate) setErrors((prev) => ({ ...prev, exchange_rate: '' }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-zinc-500 transition-colors"
              />
              {errors.exchange_rate && (
                <p className="text-rose-400 text-xs font-mono mt-1">{errors.exchange_rate}</p>
              )}
            </div>
          </div>

          {/* CÁLCULO ESTIMADO EN TIEMPO REAL */}
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Total Desembolsado:</span>
            <span className="text-emerald-400 font-semibold text-sm">
              {formatMoneyArs(estimatedTotalArs)}
            </span>
          </div>

          {/* NOTAS / ORIGEN */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="usd-notes">
              Origen / Notas (Opcional)
            </label>
            <input
              id="usd-notes"
              type="text"
              placeholder="Ej: Dólar MEP, Blue, Banco Galicia"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-zinc-800/80 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs font-mono transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting
                ? 'Guardando...'
                : editingPurchase
                ? 'Actualizar Compra'
                : 'Guardar Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
