import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export interface MonthlyExpensePayment {
  id?: string;
  user_id?: string;
  expense_id: string;
  year: number;
  month: number;
  is_paid: boolean;
  paid_at?: string;
}

function getStorageKey(year: number, month: number): string {
  return `expense_payments_${year}_${month}`;
}

export function getLocalMonthlyPayments(year: number, month: number): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(getStorageKey(year, month));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setLocalMonthlyPayment(
  year: number,
  month: number,
  expenseId: string,
  isPaid: boolean
): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalMonthlyPayments(year, month);
    current[expenseId] = isPaid;
    localStorage.setItem(getStorageKey(year, month), JSON.stringify(current));
  } catch {
    // Ignorar errores de cuota o modo privado
  }
}

export async function getMonthlyExpensePayments(
  supabase: SupabaseClient<Database>,
  year: number,
  month: number
): Promise<Record<string, boolean>> {
  // Cargar estado local inmediato
  const localMap = getLocalMonthlyPayments(year, month);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return localMap;
    }

    // Intentar consultar en Supabase
    const { data, error } = await (supabase as any)
      .from('monthly_expense_payments')
      .select('expense_id, is_paid')
      .eq('user_id', user.id)
      .eq('year', year)
      .eq('month', month);

    if (error) {
      // Si la tabla aún no existe o hay error en BD remota, usar fallback local
      return localMap;
    }

    if (data && Array.isArray(data)) {
      const dbMap: Record<string, boolean> = { ...localMap };
      for (const row of data) {
        dbMap[row.expense_id] = Boolean(row.is_paid);
      }
      return dbMap;
    }

    return localMap;
  } catch {
    return localMap;
  }
}

export async function toggleExpenseMonthlyPayment(
  supabase: SupabaseClient<Database>,
  expenseId: string,
  year: number,
  month: number,
  isPaid: boolean
): Promise<{ success: boolean; isPaid: boolean }> {
  // Guardar inmediatamente en almacenamiento local para UX instantánea
  setLocalMonthlyPayment(year, month, expenseId, isPaid);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: true, isPaid };
    }

    const { error } = await (supabase as any)
      .from('monthly_expense_payments')
      .upsert(
        {
          user_id: user.id,
          expense_id: expenseId,
          year,
          month,
          is_paid: isPaid,
          paid_at: isPaid ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,expense_id,year,month' }
      );

    if (error) {
      // Retornar éxito con persistencia local
      return { success: true, isPaid };
    }

    return { success: true, isPaid };
  } catch {
    return { success: true, isPaid };
  }
}

export async function updateInstallmentPaidStatus(
  supabase: SupabaseClient<Database>,
  installmentId: string,
  isPaid: boolean
): Promise<{ success: boolean; isPaid: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('installments')
      .update({ is_paid: isPaid } as any)
      .eq('id', installmentId);

    if (error) {
      return { success: false, isPaid: !isPaid, error: error.message };
    }

    return { success: true, isPaid };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al actualizar cuota';
    return { success: false, isPaid: !isPaid, error: message };
  }
}
