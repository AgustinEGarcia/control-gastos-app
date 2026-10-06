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
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg backdrop-blur-md mb-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          title="Mes anterior"
        >
          ‹
        </button>

        <div className="text-left">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
            Período Contable
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {getMonthName(month)} {year}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          title="Mes siguiente"
        >
          ›
        </button>
      </div>

      {!isCurrentMonth && (
        <button
          type="button"
          onClick={handleCurrentMonth}
          className="px-3.5 py-2 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 transition-all"
        >
          Ir al Mes Actual
        </button>
      )}
    </div>
  );
}
