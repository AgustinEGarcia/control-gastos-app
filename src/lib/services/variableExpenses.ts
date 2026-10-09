import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export interface VariableExpenseItem {
  id: string;
  label: string;
  amount: number;
}

export interface VariableMonthlyExpense {
  id?: string;
  user_id?: string;
  year: number;
  month: number;
  name: string;
  amount: number;
  items: VariableExpenseItem[];
  is_paid: boolean;
}

export function calculateVariableItemsTotal(items: VariableExpenseItem[]): number {
  return Number(
    items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toFixed(2)
  );
}

function getStorageKey(year: number, month: number): string {
  return `variable_expense_${year}_${month}`;
}

export function getLocalVariableExpense(year: number, month: number): VariableMonthlyExpense | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getStorageKey(year, month));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalVariableExpense(data: VariableMonthlyExpense): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(data.year, data.month), JSON.stringify(data));
  } catch {
    // Ignorar errores de cuota
  }
}

export async function getVariableMonthlyExpense(
  supabase: SupabaseClient<Database>,
  year: number,
  month: number
): Promise<VariableMonthlyExpense | null> {
  const local = getLocalVariableExpense(year, month);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return local;

    const { data, error } = await (supabase as any)
      .from('variable_monthly_expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', year)
      .eq('month', month)
      .maybeSingle();

    if (error) {
      return local;
    }

    if (data) {
      const formatted: VariableMonthlyExpense = {
        id: data.id,
        user_id: data.user_id,
        year: data.year,
        month: data.month,
        name: data.name || 'Gastos Varios',
        amount: Number(data.amount) || 0,
        items: Array.isArray(data.items) ? data.items : [],
        is_paid: Boolean(data.is_paid),
      };
      setLocalVariableExpense(formatted);
      return formatted;
    }

    return local;
  } catch {
    return local;
  }
}

export async function saveVariableMonthlyExpense(
  supabase: SupabaseClient<Database>,
  payload: {
    year: number;
    month: number;
    name?: string;
    amount?: number;
    items?: VariableExpenseItem[];
    is_paid?: boolean;
  }
): Promise<{ success: boolean; data: VariableMonthlyExpense }> {
  const name = payload.name?.trim() || 'Gastos Varios';
  const items = payload.items || [];
  // Si tiene items desglosados, el monto es la sumatoria; sino, el monto provisto
  const amount = items.length > 0 ? calculateVariableItemsTotal(items) : Number(payload.amount || 0);
  const is_paid = payload.is_paid ?? false;

  const toSave: VariableMonthlyExpense = {
    year: payload.year,
    month: payload.month,
    name,
    amount,
    items,
    is_paid,
  };

  // Guardado local inmediato
  setLocalVariableExpense(toSave);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: true, data: toSave };
    }

    const { data, error } = await (supabase as any)
      .from('variable_monthly_expenses')
      .upsert(
        {
          user_id: user.id,
          year: payload.year,
          month: payload.month,
          name,
          amount,
          items,
          is_paid,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,year,month' }
      )
      .select()
      .maybeSingle();

    if (error) {
      return { success: true, data: toSave };
    }

    if (data) {
      toSave.id = data.id;
      setLocalVariableExpense(toSave);
    }

    return { success: true, data: toSave };
  } catch {
    return { success: true, data: toSave };
  }
}

export async function toggleVariableExpensePaid(
  supabase: SupabaseClient<Database>,
  year: number,
  month: number,
  isPaid: boolean
): Promise<{ success: boolean; isPaid: boolean }> {
  const current = getLocalVariableExpense(year, month);
  if (current) {
    current.is_paid = isPaid;
    setLocalVariableExpense(current);
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: true, isPaid };

    const { error } = await (supabase as any)
      .from('variable_monthly_expenses')
      .update({ is_paid: isPaid, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('year', year)
      .eq('month', month);

    if (error) {
      return { success: true, isPaid };
    }

    return { success: true, isPaid };
  } catch {
    return { success: true, isPaid };
  }
}
