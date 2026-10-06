import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type InsertPaymentMethod = Database['public']['Tables']['payment_methods']['Insert'];

export interface PaymentMethodInput {
  name: string;
  is_own?: boolean;
  owner_name?: string | null;
  closing_day?: number | null;
  due_day?: number | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validatePaymentMethodInput(input: PaymentMethodInput): ValidationResult {
  const errors: Record<string, string> = {};

  const cleanName = input.name ? input.name.trim() : '';
  if (!cleanName) {
    errors.name = 'El nombre del método de pago es obligatorio.';
  } else if (cleanName.length > 100) {
    errors.name = 'El nombre no puede superar los 100 caracteres.';
  }

  const isOwn = input.is_own !== false;
  if (!isOwn) {
    const cleanOwner = input.owner_name ? input.owner_name.trim() : '';
    if (!cleanOwner) {
      errors.owner_name = 'Debes indicar a quién pertenece la tarjeta.';
    }
  }

  if (input.closing_day !== undefined && input.closing_day !== null) {
    const day = Number(input.closing_day);
    if (isNaN(day) || day < 1 || day > 31 || !Number.isInteger(day)) {
      errors.closing_day = 'El día de cierre debe ser un número entre 1 y 31.';
    }
  }

  if (input.due_day !== undefined && input.due_day !== null) {
    const day = Number(input.due_day);
    if (isNaN(day) || day < 1 || day > 31 || !Number.isInteger(day)) {
      errors.due_day = 'El día de vencimiento debe ser un número entre 1 y 31.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export async function getPaymentMethods(supabase: SupabaseClient<Database>): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener métodos de pago: ${error.message}`);
  }

  return data || [];
}

export async function createPaymentMethod(
  supabase: SupabaseClient<Database>,
  input: PaymentMethodInput,
  userId: string
): Promise<PaymentMethod> {
  const validation = validatePaymentMethodInput(input);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: userId,
      name: input.name.trim(),
      is_own: input.is_own !== false,
      owner_name: input.is_own === false ? input.owner_name?.trim() || null : null,
      closing_day: input.closing_day ? Number(input.closing_day) : null,
      due_day: input.due_day ? Number(input.due_day) : null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear método de pago: ${error.message}`);
  }

  return data;
}

export async function deletePaymentMethod(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar método de pago: ${error.message}`);
  }
}
