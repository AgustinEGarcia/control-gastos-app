import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type RecurringExpense = Database['public']['Tables']['recurring_expenses']['Row'];
export type InsertRecurringExpense = Database['public']['Tables']['recurring_expenses']['Insert'];

export interface RecurringExpenseInput {
  name: string;
  category?: string | null;
  estimated_amount: number;
  actual_amount?: number | null;
  payment_day: number;
  is_active?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ExpenseTotals {
  totalEstimated: number;
  totalActual: number;
  difference: number;
  countActive: number;
}

export function validateRecurringExpenseInput(input: Partial<RecurringExpenseInput>): ValidationResult {
  const errors: Record<string, string> = {};

  const cleanName = input.name ? input.name.trim() : '';
  if (!cleanName) {
    errors.name = 'El nombre del gasto es obligatorio.';
  } else if (cleanName.length > 100) {
    errors.name = 'El nombre no puede superar los 100 caracteres.';
  }

  if (input.estimated_amount === undefined || input.estimated_amount === null || isNaN(Number(input.estimated_amount)) || Number(input.estimated_amount) <= 0) {
    errors.estimated_amount = 'El monto estimado debe ser un número mayor a cero.';
  }

  if (input.actual_amount !== undefined && input.actual_amount !== null) {
    const actual = Number(input.actual_amount);
    if (isNaN(actual) || actual < 0) {
      errors.actual_amount = 'El monto real no puede ser un número negativo.';
    }
  }

  if (input.payment_day === undefined || input.payment_day === null) {
    errors.payment_day = 'El día de pago es obligatorio.';
  } else {
    const day = Number(input.payment_day);
    if (isNaN(day) || day < 1 || day > 31 || !Number.isInteger(day)) {
      errors.payment_day = 'El día de pago debe ser un número entero entre 1 y 31.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateExpenseTotals(expenses: RecurringExpense[]): ExpenseTotals {
  const activeExpenses = expenses.filter((e) => e.is_active);

  const totalEstimated = activeExpenses.reduce(
    (sum, exp) => sum + Number(exp.estimated_amount || 0),
    0
  );

  const totalActual = activeExpenses.reduce((sum, exp) => {
    const actual = exp.actual_amount !== null && exp.actual_amount !== undefined
      ? Number(exp.actual_amount)
      : Number(exp.estimated_amount || 0);
    return sum + actual;
  }, 0);

  const difference = Number((totalActual - totalEstimated).toFixed(2));

  return {
    totalEstimated: Number(totalEstimated.toFixed(2)),
    totalActual: Number(totalActual.toFixed(2)),
    difference,
    countActive: activeExpenses.length,
  };
}

export async function getRecurringExpenses(
  supabase: SupabaseClient<Database>
): Promise<RecurringExpense[]> {
  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*')
    .order('payment_day', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener gastos fijos: ${error.message}`);
  }

  return data || [];
}

export async function createRecurringExpense(
  supabase: SupabaseClient<Database>,
  input: RecurringExpenseInput,
  userId: string
): Promise<RecurringExpense> {
  const validation = validateRecurringExpenseInput(input);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  const { data, error } = await supabase
    .from('recurring_expenses')
    .insert({
      user_id: userId,
      name: input.name.trim(),
      category: input.category?.trim() || 'Servicios',
      estimated_amount: Number(input.estimated_amount),
      actual_amount: input.actual_amount !== undefined && input.actual_amount !== null ? Number(input.actual_amount) : null,
      payment_day: Number(input.payment_day),
      is_active: input.is_active !== false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al registrar gasto fijo: ${error.message}`);
  }

  return data;
}

export async function updateRecurringExpense(
  supabase: SupabaseClient<Database>,
  id: string,
  input: Partial<RecurringExpenseInput>
): Promise<RecurringExpense> {
  const updateData: Partial<InsertRecurringExpense> = {};

  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.category !== undefined) updateData.category = input.category?.trim() || null;
  if (input.estimated_amount !== undefined) updateData.estimated_amount = Number(input.estimated_amount);
  if (input.actual_amount !== undefined) {
    updateData.actual_amount = input.actual_amount !== null ? Number(input.actual_amount) : null;
  }
  if (input.payment_day !== undefined) updateData.payment_day = Number(input.payment_day);
  if (input.is_active !== undefined) updateData.is_active = Boolean(input.is_active);

  const { data, error } = await supabase
    .from('recurring_expenses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar gasto fijo: ${error.message}`);
  }

  return data;
}

export async function deleteRecurringExpense(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('recurring_expenses')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar gasto fijo: ${error.message}`);
  }
}
