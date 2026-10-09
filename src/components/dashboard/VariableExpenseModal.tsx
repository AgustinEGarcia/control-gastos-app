'use client';

import React, { useState, useEffect } from 'react';
import type { VariableMonthlyExpense, VariableExpenseItem } from '@/lib/services/variableExpenses';
import { calculateVariableItemsTotal } from '@/lib/services/variableExpenses';

interface VariableExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month: number;
  monthName: string;
  initialData?: VariableMonthlyExpense | null;
  onSave: (payload: {
    year: number;
    month: number;
    name: string;
    amount: number;
    items: VariableExpenseItem[];
  }) => Promise<void> | void;
}

export function VariableExpenseModal({
  isOpen,
  onClose,
  year,
  month,
  monthName,
  initialData,
  onSave,
}: VariableExpenseModalProps) {
  const [mode, setMode] = useState<'direct' | 'items'>('direct');
  const [name, setName] = useState('Gastos Varios');
  const [directAmount, setDirectAmount] = useState<string>('');
  const [items, setItems] = useState<VariableExpenseItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Estados para nuevo concepto
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || 'Gastos Varios');
      if (initialData.items && initialData.items.length > 0) {
        setItems(initialData.items);
        setMode('items');
        setDirectAmount('');
      } else {
        setItems([]);
        setMode('direct');
        setDirectAmount(initialData.amount ? String(initialData.amount) : '');
      }
    } else {
      setName('Gastos Varios');
      setDirectAmount('');
      setItems([]);
      setMode('direct');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const totalCalculado =
    mode === 'items'
      ? calculateVariableItemsTotal(items)
      : Number(directAmount) || 0;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    const parsedAmount = Number(newAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newItem: VariableExpenseItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: newLabel.trim(),
      amount: parsedAmount,
    };

    setItems((prev) => [...prev, newItem]);
    setNewLabel('');
    setNewAmount('');
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const finalItems = mode === 'items' ? items : [];
      const finalAmount =
        mode === 'items'
          ? calculateVariableItemsTotal(items)
          : Number(directAmount) || 0;

      await onSave({
        year,
        month,
        name: name.trim() || 'Gastos Varios',
        amount: finalAmount,
        items: finalItems,
      });

      onClose();
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* CABECERA */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🛍️</span>
              <h2 className="text-lg font-bold text-white">
                Gastos Variables — {monthName}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Define un monto genérico o desglosa varios gastos del mes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* SELECTOR DE MODALIDAD */}
        <div className="grid grid-cols-2 gap-2 my-4 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setMode('direct')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'direct'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            💵 Monto Global Directo
          </button>
          <button
            type="button"
            onClick={() => setMode('items')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'items'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Desglose de Conceptos ({items.length})
          </button>
        </div>

        {/* CONTENIDO SCROLLEABLE */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="var-name">
              Concepto Genérico
            </label>
            <input
              id="var-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Gastos Varios, Imprevistos, Consumos"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {mode === 'direct' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="var-amount">
                Monto Total Estimado ($)
              </label>
              <input
                id="var-amount"
                type="number"
                min="0"
                step="any"
                value={directAmount}
                onChange={(e) => setDirectAmount(e.target.value)}
                placeholder="Ej: 1000000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-lg font-bold text-purple-400 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Ingresa una cifra fija para computar en los gastos totales del mes sin necesidad de anotar cada ítem.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* FORMULARIO PARA AGREGAR ÍTEM */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider block">
                  + Agregar Concepto a la Suma
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Ej: Combustible, Supermercado..."
                    className="sm:col-span-7 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Monto ($)"
                    className="sm:col-span-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!newLabel.trim() || !newAmount}
                    className="sm:col-span-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-xs font-semibold rounded-lg text-white transition-colors"
                  >
                    Sumar
                  </button>
                </div>
              </div>

              {/* LISTADO DE CONCEPTOS */}
              <div className="space-y-1.5">
                {items.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    Aún no agregaste conceptos. Usa el formulario superior para desglosar tus gastos.
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 bg-slate-950/90 border border-slate-800/80 rounded-xl text-xs"
                    >
                      <span className="font-medium text-white">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <strong className="text-purple-400 font-semibold">{formatMoney(item.amount)}</strong>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                          title="Eliminar concepto"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* PIE DEL MODAL CON TOTAL Y BOTONES */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total a Sumar al Mes</span>
            <span className="text-xl font-extrabold text-purple-400">
              {formatMoney(totalCalculado)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Guardar Partida Variable'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
