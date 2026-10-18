'use client';

import React from 'react';
import { getMonthName } from '@/lib/services/dashboard';

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const handlePrevMonth = () => {
    if (month === 1) {
      onChange(year - 1, 12);
    } else {
      onChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onChange(year + 1, 1);
    } else {
      onChange(year, month + 1);
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    onChange(now.getFullYear(), now.getMonth() + 1);
  };

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-950 border border-zinc-800/80 rounded-xl mb-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors font-mono text-sm"
          title="Mes anterior"
        >
          ‹
        </button>

        <div className="text-left">
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium block">
            Período Contable
          </span>
          <h2 className="text-lg font-semibold text-zinc-100 font-mono tracking-tight">
            {getMonthName(month)} {year}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors font-mono text-sm"
          title="Mes siguiente"
        >
          ›
        </button>
      </div>

      {!isCurrentMonth && (
        <button
          type="button"
          onClick={handleCurrentMonth}
          className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
        >
          Ir al Mes Actual
        </button>
      )}
    </div>
  );
}
