import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Person, TransactionWithDetails } from './transactions';
import { getTransactions } from './transactions';

export type PaymentReceived = Database['public']['Tables']['payments_received']['Row'];

export interface DebtorAccount {
  person: Person;
  total_debt: number;
  total_paid: number;
  remaining_balance: number;
  status: 'pending' | 'paid_off';
  transactions: TransactionWithDetails[];
  payments_received: PaymentReceived[];
}

export interface PaymentReceivedInput {
  person_id: string;
  amount: number;
  payment_date: string;
  notes?: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface DebtorsGlobalSummary {
  totalPendingToCollect: number;
  totalCollected: number;
  totalOriginalDebt: number;
  activeDebtorsCount: number;
  paidOffDebtorsCount: number;
  totalPeopleCount: number;
}

export function calculateDebtorBalance(
  transactions: { total_amount: number }[],
  payments: { amount: number }[]
): {
  totalDebt: number;
  totalPaid: number;
  remainingBalance: number;
  status: 'pending' | 'paid_off';
} {
  const totalDebt = Number(
    transactions.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0).toFixed(2)
  );

  const totalPaid = Number(
    payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0).toFixed(2)
  );

  const remaining = Number((totalDebt - totalPaid).toFixed(2));
  const remainingBalance = Math.max(0, remaining);

  return {
    totalDebt,
    totalPaid,
    remainingBalance,
    status: remainingBalance <= 0 ? 'paid_off' : 'pending',
  };
}

export function validatePaymentReceivedInput(
  input: Partial<PaymentReceivedInput>,
  remainingBalance?: number
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.person_id || !input.person_id.trim()) {
    errors.person_id = 'Debes seleccionar la persona que realizó el pago.';
  }

  const amount = Number(input.amount);
  if (input.amount === undefined || isNaN(amount) || amount <= 0) {
    errors.amount = 'El monto cobrado debe ser mayor a cero.';
  } else if (remainingBalance !== undefined && amount > remainingBalance + 0.01) {
    errors.amount = `El monto a registrar ($${amount.toLocaleString('es-AR')}) no puede superar el saldo pendiente ($${remainingBalance.toLocaleString('es-AR')}).`;
  }

  if (!input.payment_date) {
    errors.payment_date = 'La fecha del cobro es obligatoria.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateDebtorsGlobalSummary(
  debtors: DebtorAccount[]
): DebtorsGlobalSummary {
  let totalPendingToCollect = 0;
  let totalCollected = 0;
  let totalOriginalDebt = 0;
  let activeDebtorsCount = 0;
  let paidOffDebtorsCount = 0;

  for (const d of debtors) {
    totalPendingToCollect += d.remaining_balance;
    totalCollected += d.total_paid;
    totalOriginalDebt += d.total_debt;

    if (d.status === 'paid_off') {
      paidOffDebtorsCount += 1;
    } else {
      activeDebtorsCount += 1;
    }
  }

  return {
    totalPendingToCollect: Number(totalPendingToCollect.toFixed(2)),
    totalCollected: Number(totalCollected.toFixed(2)),
    totalOriginalDebt: Number(totalOriginalDebt.toFixed(2)),
    activeDebtorsCount,
    paidOffDebtorsCount,
    totalPeopleCount: debtors.length,
  };
}

export async function getDebtorsOverview(
  supabase: SupabaseClient<Database>
): Promise<DebtorAccount[]> {
  // 1. Obtener todas las personas
  const { data: people, error: pError } = await supabase
    .from('people')
    .select('*')
    .order('name', { ascending: true });

  if (pError) {
    throw new Error(`Error al obtener deudores: ${pError.message}`);
  }

  if (!people || people.length === 0) {
    return [];
  }

  // 2. Obtener transacciones con cuotas
  const transactions = await getTransactions(supabase);

  // 3. Obtener pagos recibidos
  const { data: payments, error: rError } = await supabase
    .from('payments_received')
    .select('*')
    .order('payment_date', { ascending: false });

  if (rError) {
    throw new Error(`Error al obtener cobros recibidos: ${rError.message}`);
  }

  // 4. Consolidar por persona
  const debtorAccounts: DebtorAccount[] = [];

  for (const person of people) {
    const personTransactions = (transactions || []).filter(
      (t: any) => t.beneficiary_person_id === person.id
    );

    const personPayments = (payments || []).filter(
      (p: any) => p.person_id === person.id
    );

    // Solo incluir personas que tengan consumos compartidos o pagos recibidos registrados
    if (personTransactions.length > 0 || personPayments.length > 0) {
      const balance = calculateDebtorBalance(personTransactions, personPayments);

      debtorAccounts.push({
        person,
        total_debt: balance.totalDebt,
        total_paid: balance.totalPaid,
        remaining_balance: balance.remainingBalance,
        status: balance.status,
        transactions: personTransactions,
        payments_received: personPayments,
      });
    }
  }

  return debtorAccounts;
}

export async function createPaymentReceived(
  supabase: SupabaseClient<Database>,
  input: PaymentReceivedInput,
  userId: string,
  remainingBalance?: number
): Promise<PaymentReceived> {
  const validation = validatePaymentReceivedInput(input, remainingBalance);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  const { data, error } = await supabase
    .from('payments_received')
    .insert({
      user_id: userId,
      person_id: input.person_id,
      amount: Number(input.amount),
      payment_date: input.payment_date,
      notes: input.notes?.trim() || null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Error al registrar cobro recibido: ${error?.message}`);
  }

  return data;
}

export async function deletePaymentReceived(
  supabase: SupabaseClient<Database>,
  paymentId: string
): Promise<void> {
  const { error } = await supabase
    .from('payments_received')
    .delete()
    .eq('id', paymentId);

  if (error) {
    throw new Error(`Error al revertir cobro recibido: ${error.message}`);
  }
}

export async function getPublicDebtorStatement(
  supabase: SupabaseClient<Database>,
  personId: string
): Promise<DebtorAccount | null> {
  // Consulta de persona
  const { data: person, error: pError } = await supabase
    .from('people')
    .select('*')
    .eq('id', personId)
    .single();

  if (pError || !person) {
    return null;
  }

  // Consulta de transacciones asociadas
  const allTransactions = await getTransactions(supabase);
  const safeTransactions = allTransactions.filter(
    (t) => t.beneficiary_person_id === personId
  );

  // Consulta de pagos recibidos asociados
  const { data: payments } = await supabase
    .from('payments_received')
    .select('*')
    .eq('person_id', personId)
    .order('payment_date', { ascending: false });

  const safePayments = payments || [];
  const balance = calculateDebtorBalance(safeTransactions, safePayments);

  return {
    person,
    total_debt: balance.totalDebt,
    total_paid: balance.totalPaid,
    remaining_balance: balance.remainingBalance,
    status: balance.status,
    transactions: safeTransactions,
    payments_received: safePayments,
  };
}
