import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: 'ARS' | 'USD';
  billing_day: number; // 1 a 31
  payment_method_id: string | null;
  category: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  payment_method_name?: string | null;
}

export interface SubscriptionInput {
  name: string;
  amount: number;
  currency: 'ARS' | 'USD';
  billing_day: number;
  payment_method_id?: string | null;
  category: string;
  is_active?: boolean;
  notes?: string | null;
}

export interface SubscriptionSummary {
  totalMonthlyArs: number;
  totalMonthlyUsd: number;
  activeCount: number;
  pausedCount: number;
  totalCount: number;
  nextBillingItem: Subscription | null;
}

const LOCAL_STORAGE_KEY = 'subscriptions_records';

function getLocalSubscriptions(): Subscription[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalSubscriptions(data: Subscription[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignorar errores de cuota de storage
  }
}

export function validateSubscriptionInput(input: Partial<SubscriptionInput>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.name || !input.name.trim()) {
    errors.name = 'El nombre del servicio es obligatorio.';
  }

  if (input.amount === undefined || input.amount === null || Number(input.amount) <= 0) {
    errors.amount = 'El monto mensual debe ser mayor a 0.';
  }

  if (!input.currency || !['ARS', 'USD'].includes(input.currency)) {
    errors.currency = 'La moneda debe ser ARS o USD.';
  }

  const day = Number(input.billing_day);
  if (!day || isNaN(day) || day < 1 || day > 31) {
    errors.billing_day = 'El día de cobro debe ser un número entre 1 y 31.';
  }

  if (!input.category || !input.category.trim()) {
    errors.category = 'La categoría es obligatoria.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateSubscriptionSummary(subscriptions: Subscription[]): SubscriptionSummary {
  const activeSubs = subscriptions.filter((s) => s.is_active);
  const pausedSubs = subscriptions.filter((s) => !s.is_active);

  const totalMonthlyArs = Number(
    activeSubs
      .filter((s) => s.currency === 'ARS')
      .reduce((acc, s) => acc + (Number(s.amount) || 0), 0)
      .toFixed(2)
  );

  const totalMonthlyUsd = Number(
    activeSubs
      .filter((s) => s.currency === 'USD')
      .reduce((acc, s) => acc + (Number(s.amount) || 0), 0)
      .toFixed(2)
  );

  // Calcular el próximo débito en base al día actual del mes
  const currentDay = new Date().getDate();
  let nextBillingItem: Subscription | null = null;

  if (activeSubs.length > 0) {
    // Ordenar activos por día de cobro
    const sorted = [...activeSubs].sort((a, b) => a.billing_day - b.billing_day);
    // Buscar el primero que sea >= hoy
    const upcomingThisMonth = sorted.find((s) => s.billing_day >= currentDay);
    // Si no hay ninguno más este mes, es el primero del próximo mes (día más bajo)
    nextBillingItem = upcomingThisMonth || sorted[0];
  }

  return {
    totalMonthlyArs,
    totalMonthlyUsd,
    activeCount: activeSubs.length,
    pausedCount: pausedSubs.length,
    totalCount: subscriptions.length,
    nextBillingItem,
  };
}

export async function getSubscriptions(
  supabase: SupabaseClient<Database>
): Promise<Subscription[]> {
  try {
    const { data, error } = await (supabase as any)
      .from('subscriptions')
      .select('*, payment_methods(name)')
      .order('billing_day', { ascending: true });

    if (error) {
      return getLocalSubscriptions();
    }

    if (data && data.length > 0) {
      const mapped = data.map((d: any) => ({
        ...d,
        payment_method_name: d.payment_methods?.name || null,
      }));
      setLocalSubscriptions(mapped);
      return mapped;
    }

    return getLocalSubscriptions();
  } catch {
    return getLocalSubscriptions();
  }
}

export async function createSubscription(
  supabase: SupabaseClient<Database>,
  input: SubscriptionInput,
  userId: string
): Promise<Subscription> {
  const newSub: Subscription = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sub_${Date.now()}`,
    user_id: userId,
    name: input.name.trim(),
    amount: Number(input.amount),
    currency: input.currency,
    billing_day: Number(input.billing_day),
    payment_method_id: input.payment_method_id || null,
    category: input.category,
    is_active: input.is_active !== undefined ? input.is_active : true,
    notes: input.notes?.trim() || null,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await (supabase as any)
      .from('subscriptions')
      .insert({
        user_id: userId,
        name: newSub.name,
        amount: newSub.amount,
        currency: newSub.currency,
        billing_day: newSub.billing_day,
        payment_method_id: newSub.payment_method_id,
        category: newSub.category,
        is_active: newSub.is_active,
        notes: newSub.notes,
      })
      .select()
      .single();

    if (!error && data) {
      const local = getLocalSubscriptions();
      setLocalSubscriptions([data, ...local]);
      return data;
    }
  } catch {
    // Continuar con fallback local
  }

  const local = getLocalSubscriptions();
  setLocalSubscriptions([newSub, ...local]);
  return newSub;
}

export async function updateSubscription(
  supabase: SupabaseClient<Database>,
  id: string,
  input: SubscriptionInput
): Promise<void> {
  try {
    await (supabase as any)
      .from('subscriptions')
      .update({
        name: input.name.trim(),
        amount: Number(input.amount),
        currency: input.currency,
        billing_day: Number(input.billing_day),
        payment_method_id: input.payment_method_id || null,
        category: input.category,
        is_active: input.is_active,
        notes: input.notes?.trim() || null,
      })
      .eq('id', id);
  } catch {
    // Continuar con fallback local
  }

  const local = getLocalSubscriptions();
  const index = local.findIndex((s) => s.id === id);
  if (index !== -1) {
    local[index] = {
      ...local[index],
      name: input.name.trim(),
      amount: Number(input.amount),
      currency: input.currency,
      billing_day: Number(input.billing_day),
      payment_method_id: input.payment_method_id || null,
      category: input.category,
      is_active: input.is_active !== undefined ? input.is_active : local[index].is_active,
      notes: input.notes?.trim() || null,
    };
    setLocalSubscriptions(local);
  }
}

export async function toggleSubscriptionStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  currentStatus: boolean
): Promise<void> {
  const newStatus = !currentStatus;
  try {
    await (supabase as any)
      .from('subscriptions')
      .update({ is_active: newStatus })
      .eq('id', id);
  } catch {
    // Continuar con fallback local
  }

  const local = getLocalSubscriptions();
  const index = local.findIndex((s) => s.id === id);
  if (index !== -1) {
    local[index].is_active = newStatus;
    setLocalSubscriptions(local);
  }
}

export async function deleteSubscription(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  try {
    await (supabase as any).from('subscriptions').delete().eq('id', id);
  } catch {
    // Continuar con fallback local
  }

  const local = getLocalSubscriptions();
  setLocalSubscriptions(local.filter((s) => s.id !== id));
}

export function formatSubscriptionCurrency(amount: number, currency: 'ARS' | 'USD'): string {
  return new Intl.NumberFormat(currency === 'ARS' ? 'es-AR' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
