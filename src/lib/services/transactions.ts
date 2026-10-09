import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PaymentMethod } from './paymentMethods';

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Installment = Database['public']['Tables']['installments']['Row'];
export type Person = Database['public']['Tables']['people']['Row'];

export interface GeneratedInstallment {
  installment_number: number;
  amount: number;
  due_date: string;
}

export interface TransactionWithDetails extends Transaction {
  payment_method: PaymentMethod | null;
  beneficiary: Person | null;
  installments: Installment[];
}

export interface TransactionInput {
  description: string;
  total_amount: number;
  installments_count: number;
  purchase_date: string;
  first_installment_date: string;
  payment_method_id?: string | null;
  beneficiary_person_id?: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface TransactionSummaries {
  totalFinanced: number;
  totalPendingOwn: number;
  totalPendingToCollect: number;
  countTransactions: number;
}

export function generateInstallmentSchedule(
  totalAmount: number,
  installmentsCount: number,
  firstInstallmentDate: string
): GeneratedInstallment[] {
  const count = Math.max(1, Math.floor(installmentsCount));
  const baseAmount = Math.floor((totalAmount / count) * 100) / 100;
  const remainder = Number((totalAmount - baseAmount * count).toFixed(2));

  const [startYear, startMonth, startDay] = firstInstallmentDate
    .split('-')
    .map((num) => parseInt(num, 10));

  const schedule: GeneratedInstallment[] = [];

  for (let i = 0; i < count; i++) {
    const amount = i === 0 ? Number((baseAmount + remainder).toFixed(2)) : baseAmount;

    // Cálculo de fecha mensual segura
    const targetMonthIndex = (startMonth - 1) + i;
    const year = startYear + Math.floor(targetMonthIndex / 12);
    const month = (targetMonthIndex % 12) + 1;

    // Clamp de días para evitar fechas inválidas (ej. 31 de Febrero)
    const daysInMonth = new Date(year, month, 0).getDate();
    const day = Math.min(startDay, daysInMonth);

    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    schedule.push({
      installment_number: i + 1,
      amount,
      due_date: formattedDate,
    });
  }

  return schedule;
}

export function validateTransactionInput(input: Partial<TransactionInput>): ValidationResult {
  const errors: Record<string, string> = {};

  const cleanDesc = input.description ? input.description.trim() : '';
  if (!cleanDesc) {
    errors.description = 'La descripción de la compra es obligatoria.';
  } else if (cleanDesc.length > 200) {
    errors.description = 'La descripción no puede superar los 200 caracteres.';
  }

  if (input.total_amount === undefined || isNaN(Number(input.total_amount)) || Number(input.total_amount) <= 0) {
    errors.total_amount = 'El monto total debe ser mayor a cero.';
  }

  const installments = Number(input.installments_count);
  if (isNaN(installments) || installments < 1 || installments > 60 || !Number.isInteger(installments)) {
    errors.installments_count = 'La cantidad de cuotas debe ser entre 1 y 60.';
  }

  if (!input.purchase_date) {
    errors.purchase_date = 'La fecha de compra es obligatoria.';
  }

  if (!input.first_installment_date) {
    errors.first_installment_date = 'La fecha del primer vencimiento es obligatoria.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateTransactionSummaries(
  transactions: TransactionWithDetails[]
): TransactionSummaries {
  let totalFinanced = 0;
  let totalPendingOwn = 0;
  let totalPendingToCollect = 0;

  for (const t of transactions) {
    totalFinanced += Number(t.total_amount || 0);

    const unpaidInstallments = t.installments.filter((i) => !i.is_paid);
    const pendingSum = unpaidInstallments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    if (t.beneficiary_person_id) {
      // Compra prestada a un tercero
      totalPendingToCollect += pendingSum;
    } else {
      // Compra propia
      totalPendingOwn += pendingSum;
    }
  }

  return {
    totalFinanced: Number(totalFinanced.toFixed(2)),
    totalPendingOwn: Number(totalPendingOwn.toFixed(2)),
    totalPendingToCollect: Number(totalPendingToCollect.toFixed(2)),
    countTransactions: transactions.length,
  };
}

export async function getPeople(supabase: SupabaseClient<Database>): Promise<Person[]> {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Error al obtener personas: ${error.message}`);
  }

  return data || [];
}

export async function createPerson(
  supabase: SupabaseClient<Database>,
  name: string,
  email: string | null,
  userId: string
): Promise<Person> {
  const cleanName = name.trim();
  if (!cleanName) {
    throw new Error('El nombre de la persona es obligatorio.');
  }

  const { data, error } = await supabase
    .from('people')
    .insert({
      user_id: userId,
      name: cleanName,
      email: email?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al registrar persona: ${error.message}`);
  }

  return data;
}

export async function getTransactions(
  supabase: SupabaseClient<Database>
): Promise<TransactionWithDetails[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      payment_method:payment_methods(*),
      beneficiary:people!beneficiary_person_id(*),
      installments(*)
    `)
    .order('purchase_date', { ascending: false });

  if (error) {
    // Fallback seguro: si hay ambigüedad o variación en PostgREST, cargar y mapear en memoria
    const { data: rawTxs, error: txError } = await supabase
      .from('transactions')
      .select(`
        *,
        payment_method:payment_methods(*),
        installments(*)
      `)
      .order('purchase_date', { ascending: false });

    if (txError) {
      throw new Error(`Error al obtener transacciones: ${txError.message}`);
    }

    const { data: peopleData } = await supabase.from('people').select('*');
    const peopleMap = new Map((peopleData || []).map((p: any) => [p.id, p]));

    return (rawTxs || []).map((t: any) => ({
      ...t,
      beneficiary: t.beneficiary_person_id ? peopleMap.get(t.beneficiary_person_id) || null : null,
      installments: (t.installments || []).sort(
        (a: Installment, b: Installment) => a.installment_number - b.installment_number
      ),
    }));
  }

  // Ordenar cuotas internamente por número
  const formatted = (data || []).map((t: any) => ({
    ...t,
    installments: (t.installments || []).sort(
      (a: Installment, b: Installment) => a.installment_number - b.installment_number
    ),
  }));

  return formatted;
}

export async function createTransactionWithInstallments(
  supabase: SupabaseClient<Database>,
  input: TransactionInput,
  userId: string
): Promise<Transaction> {
  const validation = validateTransactionInput(input);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  // 1. Insertar transacción
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      description: input.description.trim(),
      total_amount: Number(input.total_amount),
      installments_count: Number(input.installments_count),
      purchase_date: input.purchase_date,
      first_installment_date: input.first_installment_date,
      payment_method_id: input.payment_method_id || null,
      beneficiary_person_id: input.beneficiary_person_id || null,
    })
    .select()
    .single();

  if (txError || !transaction) {
    throw new Error(`Error al crear transacción: ${txError?.message}`);
  }

  // 2. Generar y bulk-insertar cuotas
  const schedule = generateInstallmentSchedule(
    Number(input.total_amount),
    Number(input.installments_count),
    input.first_installment_date
  );

  const installmentsToInsert = schedule.map((item) => ({
    transaction_id: transaction.id,
    installment_number: item.installment_number,
    amount: item.amount,
    due_date: item.due_date,
    is_paid: false,
  }));

  const { error: instError } = await supabase
    .from('installments')
    .insert(installmentsToInsert);

  if (instError) {
    // Si falla la inserción de cuotas, limpiar la transacción
    await supabase.from('transactions').delete().eq('id', transaction.id);
    throw new Error(`Error al generar cuotas: ${instError.message}`);
  }

  return transaction;
}

export async function toggleInstallmentPaid(
  supabase: SupabaseClient<Database>,
  installmentId: string,
  isPaid: boolean
): Promise<void> {
  const { error } = await supabase
    .from('installments')
    .update({ is_paid: isPaid })
    .eq('id', installmentId);

  if (error) {
    throw new Error(`Error al actualizar estado de la cuota: ${error.message}`);
  }
}

export async function deleteTransaction(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar la transacción: ${error.message}`);
  }
}

export interface UpdateTransactionInput {
  description?: string;
  purchase_date?: string;
  payment_method_id?: string | null;
  beneficiary_person_id?: string | null;
}

export async function updateTransaction(
  supabase: SupabaseClient<Database>,
  id: string,
  input: UpdateTransactionInput
): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .update(input)
    .eq('id', id);

  if (error) {
    throw new Error(`Error al actualizar transacción: ${error.message}`);
  }
}

export async function checkPersonHasAssociatedRecords(
  supabase: SupabaseClient<Database>,
  personId: string
): Promise<{ hasRecords: boolean; reasons: string[] }> {
  const reasons: string[] = [];

  // 1. Comprobar transacciones (compras/cuotas)
  const { data: txs } = await supabase
    .from('transactions')
    .select('id')
    .or(`beneficiary_person_id.eq.${personId},payer_person_id.eq.${personId}`);

  if (txs && txs.length > 0) {
    reasons.push(`${txs.length} compra(s) o gasto(s) compartidos`);
  }

  // 2. Comprobar préstamos personales
  const { data: loans } = await supabase
    .from('personal_loans')
    .select('id')
    .eq('lender_person_id', personId);

  if (loans && loans.length > 0) {
    reasons.push(`${loans.length} préstamo(s) personal(es)`);
  }

  // 3. Comprobar abonos/pagos recibidos
  const { data: payments } = await supabase
    .from('payments_received')
    .select('id')
    .eq('person_id', personId);

  if (payments && payments.length > 0) {
    reasons.push(`${payments.length} abono(s) recibido(s)`);
  }

  return {
    hasRecords: reasons.length > 0,
    reasons,
  };
}

export async function deletePerson(
  supabase: SupabaseClient<Database>,
  personId: string
): Promise<void> {
  const check = await checkPersonHasAssociatedRecords(supabase, personId);
  if (check.hasRecords) {
    throw new Error(
      `No se puede eliminar a esta persona porque tiene registros vinculados: ${check.reasons.join(', ')}. Debes eliminar o reasignar esos registros primero.`
    );
  }

  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', personId);

  if (error) {
    throw new Error(`Error al eliminar persona: ${error.message}`);
  }
}

