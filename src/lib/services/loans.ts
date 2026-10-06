import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Person } from './transactions';

export type PersonalLoan = Database['public']['Tables']['personal_loans']['Row'];
export type LoanRepayment = Database['public']['Tables']['loan_repayments']['Row'];

export interface LoanWithDetails extends PersonalLoan {
  lender: Person;
  repayments: LoanRepayment[];
  total_repaid: number;
  remaining_balance: number;
  repayment_percentage: number;
}

export interface LoanInput {
  lender_person_id: string;
  initial_amount: number;
  currency: 'ARS' | 'USD';
  loan_date: string;
  notes?: string | null;
}

export interface RepaymentInput {
  loan_id: string;
  amount_paid: number;
  payment_date: string;
  notes?: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface CurrencySummary {
  totalInitial: number;
  totalRepaid: number;
  remainingBalance: number;
  activeCount: number;
  paidOffCount: number;
}

export interface LoansSummaryResult {
  ARS: CurrencySummary;
  USD: CurrencySummary;
  totalLoansCount: number;
}

export function calculateLoanBalance(
  initialAmount: number,
  repayments: { amount_paid: number }[]
): {
  totalRepaid: number;
  remainingBalance: number;
  percentage: number;
  isPaidOff: boolean;
} {
  const totalRepaid = Number(
    repayments.reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0).toFixed(2)
  );
  const remaining = Number((initialAmount - totalRepaid).toFixed(2));
  const remainingBalance = Math.max(0, remaining);
  const percentage =
    initialAmount > 0
      ? Math.min(100, Math.round((totalRepaid / initialAmount) * 100))
      : 100;

  return {
    totalRepaid,
    remainingBalance,
    percentage,
    isPaidOff: remaining <= 0,
  };
}

export function validateLoanInput(input: Partial<LoanInput>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.lender_person_id || !input.lender_person_id.trim()) {
    errors.lender_person_id = 'Debes seleccionar o ingresar la persona que prestó el dinero.';
  }

  if (
    input.initial_amount === undefined ||
    isNaN(Number(input.initial_amount)) ||
    Number(input.initial_amount) <= 0
  ) {
    errors.initial_amount = 'El monto del préstamo debe ser mayor a cero.';
  }

  if (!input.currency || (input.currency !== 'ARS' && input.currency !== 'USD')) {
    errors.currency = 'La moneda debe ser ARS o USD.';
  }

  if (!input.loan_date) {
    errors.loan_date = 'La fecha del préstamo es obligatoria.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRepaymentInput(
  input: Partial<RepaymentInput>,
  remainingBalance?: number
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.loan_id) {
    errors.loan_id = 'El préstamo asociado es obligatorio.';
  }

  const amount = Number(input.amount_paid);
  if (input.amount_paid === undefined || isNaN(amount) || amount <= 0) {
    errors.amount_paid = 'El monto del abono debe ser mayor a cero.';
  } else if (remainingBalance !== undefined && amount > remainingBalance + 0.01) {
    errors.amount_paid = `El abono no puede superar el saldo restante ($${remainingBalance.toLocaleString('es-AR')}).`;
  }

  if (!input.payment_date) {
    errors.payment_date = 'La fecha del abono es obligatoria.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateLoansSummary(loans: LoanWithDetails[]): LoansSummaryResult {
  const result: LoansSummaryResult = {
    ARS: {
      totalInitial: 0,
      totalRepaid: 0,
      remainingBalance: 0,
      activeCount: 0,
      paidOffCount: 0,
    },
    USD: {
      totalInitial: 0,
      totalRepaid: 0,
      remainingBalance: 0,
      activeCount: 0,
      paidOffCount: 0,
    },
    totalLoansCount: loans.length,
  };

  for (const loan of loans) {
    const currency = loan.currency === 'USD' ? 'USD' : 'ARS';
    const initial = Number(loan.initial_amount || 0);
    const repaid = Number(loan.total_repaid || 0);
    const remaining = Number(loan.remaining_balance || 0);

    result[currency].totalInitial += initial;
    result[currency].totalRepaid += repaid;
    result[currency].remainingBalance += remaining;

    if (remaining <= 0 || loan.status === 'paid_off') {
      result[currency].paidOffCount += 1;
    } else {
      result[currency].activeCount += 1;
    }
  }

  // Redondear a 2 decimales
  result.ARS.totalInitial = Number(result.ARS.totalInitial.toFixed(2));
  result.ARS.totalRepaid = Number(result.ARS.totalRepaid.toFixed(2));
  result.ARS.remainingBalance = Number(result.ARS.remainingBalance.toFixed(2));

  result.USD.totalInitial = Number(result.USD.totalInitial.toFixed(2));
  result.USD.totalRepaid = Number(result.USD.totalRepaid.toFixed(2));
  result.USD.remainingBalance = Number(result.USD.remainingBalance.toFixed(2));

  return result;
}

export async function getLoans(
  supabase: SupabaseClient<Database>
): Promise<LoanWithDetails[]> {
  const { data, error } = await supabase
    .from('personal_loans')
    .select(`
      *,
      lender:people(*),
      repayments:loan_repayments(*)
    `)
    .order('loan_date', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener préstamos: ${error.message}`);
  }

  const formatted: LoanWithDetails[] = (data || []).map((loan: any) => {
    const repayments = (loan.repayments || []).sort(
      (a: LoanRepayment, b: LoanRepayment) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );

    const { totalRepaid, remainingBalance, percentage } = calculateLoanBalance(
      Number(loan.initial_amount),
      repayments
    );

    return {
      ...loan,
      lender: loan.lender,
      repayments,
      total_repaid: totalRepaid,
      remaining_balance: remainingBalance,
      repayment_percentage: percentage,
      status: remainingBalance <= 0 ? 'paid_off' : loan.status || 'active',
    };
  });

  return formatted;
}

export async function createLoan(
  supabase: SupabaseClient<Database>,
  input: LoanInput,
  userId: string
): Promise<PersonalLoan> {
  const validation = validateLoanInput(input);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  const { data, error } = await supabase
    .from('personal_loans')
    .insert({
      user_id: userId,
      lender_person_id: input.lender_person_id,
      initial_amount: Number(input.initial_amount),
      currency: input.currency,
      loan_date: input.loan_date,
      notes: input.notes?.trim() || null,
      status: 'active',
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Error al registrar préstamo: ${error?.message}`);
  }

  return data;
}

export async function createRepayment(
  supabase: SupabaseClient<Database>,
  input: RepaymentInput
): Promise<LoanRepayment> {
  const validation = validateRepaymentInput(input);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    throw new Error(firstError);
  }

  const { data, error } = await supabase
    .from('loan_repayments')
    .insert({
      loan_id: input.loan_id,
      amount_paid: Number(input.amount_paid),
      payment_date: input.payment_date,
      notes: input.notes?.trim() || null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Error al registrar abono: ${error?.message}`);
  }

  return data;
}

export async function deleteRepayment(
  supabase: SupabaseClient<Database>,
  repaymentId: string
): Promise<void> {
  const { error } = await supabase
    .from('loan_repayments')
    .delete()
    .eq('id', repaymentId);

  if (error) {
    throw new Error(`Error al eliminar abono: ${error.message}`);
  }
}

export async function deleteLoan(
  supabase: SupabaseClient<Database>,
  loanId: string
): Promise<void> {
  const { error } = await supabase
    .from('personal_loans')
    .delete()
    .eq('id', loanId);

  if (error) {
    throw new Error(`Error al eliminar préstamo: ${error.message}`);
  }
}
