import type { RecurringExpense, RecurringExpenseWithMethod } from './recurringExpenses';
import type { TransactionWithDetails } from './transactions';
import type { VariableMonthlyExpense } from './variableExpenses';

export interface MonthlyDueItem {
  id: string;
  targetId: string;
  title: string;
  type: 'recurring' | 'installment_own' | 'installment_shared' | 'variable';
  amount: number;
  day: number;
  fullDate: string;
  isPaid: boolean;
  details?: string;
  beneficiaryName?: string | null;
}

export interface MonthlyConsolidatedSummary {
  year: number;
  month: number;
  totalOwnToPay: number;
  paidOwnAmount: number;
  pendingOwnAmount: number;
  totalRecurring: number;
  totalInstallmentsOwn: number;
  totalVariable: number;
  totalSharedToCollect: number;
  totalAllCommitments: number;
  paidCommitmentsAmount: number;
  pendingCommitmentsAmount: number;
  totalCommitmentsCount: number;
  paidCommitmentsCount: number;
  percentageCompleted: number;
  variableExpense?: VariableMonthlyExpense | null;
  items: MonthlyDueItem[];
}

export interface CardCommitmentsSummary {
  paymentMethodId: string;
  totalInstallments: number;
  totalRecurring: number;
  totalToPay: number;
  recurringExpenses: RecurringExpenseWithMethod[];
}

export const MONTH_NAMES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function getMonthName(monthNumber: number): string {
  return MONTH_NAMES_ES[monthNumber - 1] || '';
}

export function calculateMonthlyConsolidated(
  expenses: (RecurringExpense | RecurringExpenseWithMethod)[],
  transactions: TransactionWithDetails[],
  year: number,
  month: number,
  monthlyPaymentsMap: Record<string, boolean> = {},
  variableExpense: VariableMonthlyExpense | null = null
): MonthlyConsolidatedSummary {
  const items: MonthlyDueItem[] = [];

  let totalRecurring = 0;
  let totalInstallmentsOwn = 0;
  let totalSharedToCollect = 0;
  let totalVariable = 0;

  const daysInTargetMonth = new Date(year, month, 0).getDate();

  // 1. Procesar Gastos Fijos Activos del mes
  for (const exp of expenses) {
    if (!exp.is_active) continue;

    const amount = Number(exp.actual_amount ?? exp.estimated_amount);
    const effectiveDay = Math.min(exp.payment_day, daysInTargetMonth);
    const fullDate = `${year}-${String(month).padStart(2, '0')}-${String(effectiveDay).padStart(2, '0')}`;

    totalRecurring += amount;

    const methodDetail =
      'payment_method' in exp && exp.payment_method?.name
        ? ` • 💳 ${exp.payment_method.name}`
        : '';

    // Si está registrado en el mapa mensual de pagos, usar ese valor; sino, fallback si tiene actual_amount
    const isPaid =
      monthlyPaymentsMap[exp.id] !== undefined
        ? Boolean(monthlyPaymentsMap[exp.id])
        : exp.actual_amount !== null && exp.actual_amount !== undefined;

    items.push({
      id: `exp-${exp.id}`,
      targetId: exp.id,
      title: exp.name,
      type: 'recurring',
      amount,
      day: effectiveDay,
      fullDate,
      isPaid,
      details: `${exp.category || 'Gasto Fijo Mensual'}${methodDetail}`,
      beneficiaryName: null,
    });
  }

  // 2. Procesar Cuotas de Compras con vencimiento en este mes
  for (const tx of transactions) {
    for (const inst of tx.installments || []) {
      if (!inst.due_date) continue;
      const [instYear, instMonth, instDay] = inst.due_date.split('-').map(Number);

      if (instYear === year && instMonth === month) {
        const amount = Number(inst.amount);
        const isShared = Boolean(tx.beneficiary_person_id);

        if (isShared) {
          totalSharedToCollect += amount;
          items.push({
            id: `inst-${inst.id}`,
            targetId: inst.id,
            title: `${tx.description} (Cuota ${inst.installment_number}/${tx.installments_count})`,
            type: 'installment_shared',
            amount,
            day: instDay,
            fullDate: inst.due_date,
            isPaid: Boolean(inst.is_paid),
            details: tx.payment_method?.name || 'Tarjeta / Crédito',
            beneficiaryName: tx.beneficiary?.name || 'Tercero',
          });
        } else {
          totalInstallmentsOwn += amount;
          items.push({
            id: `inst-${inst.id}`,
            targetId: inst.id,
            title: `${tx.description} (Cuota ${inst.installment_number}/${tx.installments_count})`,
            type: 'installment_own',
            amount,
            day: instDay,
            fullDate: inst.due_date,
            isPaid: Boolean(inst.is_paid),
            details: tx.payment_method?.name || 'Tarjeta Propia',
            beneficiaryName: null,
          });
        }
      }
    }
  }

  // 3. Procesar Partida de Gastos Variables del mes (Spec 013)
  if (variableExpense && Number(variableExpense.amount) > 0) {
    totalVariable = Number(variableExpense.amount);
    const subItemsCount = variableExpense.items?.length || 0;
    const details =
      subItemsCount > 0
        ? `${subItemsCount} concepto${subItemsCount > 1 ? 's' : ''} incluido${subItemsCount > 1 ? 's' : ''}`
        : 'Presupuesto variable mensual';

    items.push({
      id: `var-${variableExpense.id || 'curr'}`,
      targetId: variableExpense.id || 'variable',
      title: variableExpense.name || 'Gastos Varios',
      type: 'variable',
      amount: totalVariable,
      day: 1, // Se ubica a inicio del mes para visibilidad
      fullDate: `${year}-${String(month).padStart(2, '0')}-01`,
      isPaid: Boolean(variableExpense.is_paid),
      details,
      beneficiaryName: null,
    });
  }

  // 4. Ordenar cronológicamente por día del mes
  items.sort((a, b) => a.day - b.day);

  // 5. Cálculos consolidados
  const totalOwnToPay = Number((totalRecurring + totalInstallmentsOwn + totalVariable).toFixed(2));
  const totalAllCommitments = Number((totalOwnToPay + totalSharedToCollect).toFixed(2));

  let paidCommitmentsAmount = 0;
  let paidCommitmentsCount = 0;
  let paidOwnAmount = 0;

  for (const it of items) {
    if (it.isPaid) {
      paidCommitmentsAmount += it.amount;
      paidCommitmentsCount += 1;
      if (it.type !== 'installment_shared') {
        paidOwnAmount += it.amount;
      }
    }
  }

  paidOwnAmount = Number(paidOwnAmount.toFixed(2));
  const pendingOwnAmount = Number(Math.max(0, totalOwnToPay - paidOwnAmount).toFixed(2));
  const totalCommitmentsCount = items.length;
  const pendingCommitmentsAmount = Number((totalAllCommitments - paidCommitmentsAmount).toFixed(2));
  const percentageCompleted =
    totalCommitmentsCount > 0
      ? Math.min(100, Math.round((paidCommitmentsCount / totalCommitmentsCount) * 100))
      : 100;

  return {
    year,
    month,
    totalOwnToPay,
    paidOwnAmount,
    pendingOwnAmount,
    totalRecurring: Number(totalRecurring.toFixed(2)),
    totalInstallmentsOwn: Number(totalInstallmentsOwn.toFixed(2)),
    totalVariable: Number(totalVariable.toFixed(2)),
    totalSharedToCollect: Number(totalSharedToCollect.toFixed(2)),
    totalAllCommitments,
    paidCommitmentsAmount: Number(paidCommitmentsAmount.toFixed(2)),
    pendingCommitmentsAmount,
    totalCommitmentsCount,
    paidCommitmentsCount,
    percentageCompleted,
    variableExpense,
    items,
  };
}

export function calculateCardMonthlyCommitments(
  paymentMethodId: string,
  expenses: (RecurringExpense | RecurringExpenseWithMethod)[],
  transactions: TransactionWithDetails[],
  year: number,
  month: number
): CardCommitmentsSummary {
  let totalInstallments = 0;
  for (const tx of transactions) {
    if (tx.payment_method_id !== paymentMethodId) continue;
    for (const inst of tx.installments || []) {
      if (!inst.due_date) continue;
      const [instYear, instMonth] = inst.due_date.split('-').map(Number);
      if (instYear === year && instMonth === month) {
        totalInstallments += Number(inst.amount);
      }
    }
  }

  const cardExpenses = expenses.filter(
    (e) => e.payment_method_id === paymentMethodId && e.is_active
  );

  const totalRecurring = cardExpenses.reduce((sum, e) => {
    return sum + Number(e.actual_amount ?? e.estimated_amount);
  }, 0);

  return {
    paymentMethodId,
    totalInstallments: Number(totalInstallments.toFixed(2)),
    totalRecurring: Number(totalRecurring.toFixed(2)),
    totalToPay: Number((totalInstallments + totalRecurring).toFixed(2)),
    recurringExpenses: cardExpenses as RecurringExpenseWithMethod[],
  };
}
