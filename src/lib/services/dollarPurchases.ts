import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export interface DollarPurchase {
  id: string;
  user_id: string;
  purchase_date: string; // YYYY-MM-DD
  amount_usd: number;
  exchange_rate: number; // en pesos por cada USD
  total_ars: number;     // amount_usd * exchange_rate
  notes: string | null;
  created_at: string;
}

export interface DollarPurchaseInput {
  purchase_date: string;
  amount_usd: number;
  exchange_rate: number;
  notes?: string | null;
}

export interface DollarSummary {
  totalUsd: number;
  totalArs: number;
  averageRate: number;
  operationsCount: number;
}

const LOCAL_STORAGE_KEY = 'dollar_purchases_records';

function getLocalPurchases(): DollarPurchase[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalPurchases(data: DollarPurchase[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silencioso ante errores de cuota de storage
  }
}

export function validateDollarPurchaseInput(input: Partial<DollarPurchaseInput>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.purchase_date || !input.purchase_date.trim()) {
    errors.purchase_date = 'La fecha de compra es obligatoria.';
  }

  if (input.amount_usd === undefined || input.amount_usd === null || Number(input.amount_usd) <= 0) {
    errors.amount_usd = 'La cantidad de dólares debe ser mayor a 0.';
  }

  if (input.exchange_rate === undefined || input.exchange_rate === null || Number(input.exchange_rate) <= 0) {
    errors.exchange_rate = 'La cotización pagada debe ser mayor a 0.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateDollarSummary(purchases: DollarPurchase[]): DollarSummary {
  const totalUsd = Number(
    purchases.reduce((acc, p) => acc + (Number(p.amount_usd) || 0), 0).toFixed(2)
  );

  const totalArs = Number(
    purchases.reduce((acc, p) => acc + (Number(p.total_ars) || 0), 0).toFixed(2)
  );

  const averageRate = totalUsd > 0 ? Number((totalArs / totalUsd).toFixed(2)) : 0;

  return {
    totalUsd,
    totalArs,
    averageRate,
    operationsCount: purchases.length,
  };
}

export async function getDollarPurchases(
  supabase: SupabaseClient<Database>
): Promise<DollarPurchase[]> {
  try {
    const { data, error } = await (supabase as any)
      .from('dollar_purchases')
      .select('*')
      .order('purchase_date', { ascending: false });

    if (error) {
      // Fallback a localStorage si la tabla no existe en la base remota
      return getLocalPurchases();
    }

    if (data && data.length > 0) {
      setLocalPurchases(data);
      return data;
    }

    return getLocalPurchases();
  } catch {
    return getLocalPurchases();
  }
}

export async function createDollarPurchase(
  supabase: SupabaseClient<Database>,
  input: DollarPurchaseInput,
  userId: string
): Promise<DollarPurchase> {
  const total_ars = Number((Number(input.amount_usd) * Number(input.exchange_rate)).toFixed(2));

  const newRecord: DollarPurchase = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `usd_${Date.now()}`,
    user_id: userId,
    purchase_date: input.purchase_date,
    amount_usd: Number(input.amount_usd),
    exchange_rate: Number(input.exchange_rate),
    total_ars,
    notes: input.notes?.trim() || null,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await (supabase as any)
      .from('dollar_purchases')
      .insert({
        purchase_date: newRecord.purchase_date,
        amount_usd: newRecord.amount_usd,
        exchange_rate: newRecord.exchange_rate,
        total_ars: newRecord.total_ars,
        notes: newRecord.notes,
        user_id: userId,
      })
      .select()
      .single();

    if (!error && data) {
      const local = getLocalPurchases();
      setLocalPurchases([data, ...local]);
      return data;
    }
  } catch {
    // Continuar con persistencia local
  }

  // Guardar en almacenamiento local resiliente
  const local = getLocalPurchases();
  const updated = [newRecord, ...local];
  setLocalPurchases(updated);
  return newRecord;
}

export async function updateDollarPurchase(
  supabase: SupabaseClient<Database>,
  id: string,
  input: DollarPurchaseInput
): Promise<void> {
  const total_ars = Number((Number(input.amount_usd) * Number(input.exchange_rate)).toFixed(2));

  try {
    await (supabase as any)
      .from('dollar_purchases')
      .update({
        purchase_date: input.purchase_date,
        amount_usd: Number(input.amount_usd),
        exchange_rate: Number(input.exchange_rate),
        total_ars,
        notes: input.notes?.trim() || null,
      })
      .eq('id', id);
  } catch {
    // Continuar con actualización local
  }

  const local = getLocalPurchases();
  const index = local.findIndex((p) => p.id === id);
  if (index !== -1) {
    local[index] = {
      ...local[index],
      purchase_date: input.purchase_date,
      amount_usd: Number(input.amount_usd),
      exchange_rate: Number(input.exchange_rate),
      total_ars,
      notes: input.notes?.trim() || null,
    };
    setLocalPurchases(local);
  }
}

export async function deleteDollarPurchase(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  try {
    await (supabase as any).from('dollar_purchases').delete().eq('id', id);
  } catch {
    // Continuar con eliminación local
  }

  const local = getLocalPurchases();
  const updated = local.filter((p) => p.id !== id);
  setLocalPurchases(updated);
}

export function formatMoneyArs(val: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatMoneyUsd(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(val);
}
