import type { RecurringExpense } from './recurringExpenses';
import type { TransactionWithDetails } from './transactions';

export interface MonthlyDueItem {
  id: string;
  title: string;
  type: 'recurring' | 'installment_own' | 'installment_shared';
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
  totalRecurring: number;
  totalInstallmentsOwn: number;
  totalSharedToCollect: number;
  totalAllCommitments: number;
  paidCommitmentsAmount: number;
  pendingCommitmentsAmount: number;
  totalCommitmentsCount: number;
  paidCommitmentsCount: number;
  percentageCompleted: number;
  items: MonthlyDueItem[];
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
  expenses: RecurringExpense[],
  transactions: TransactionWithDetails[],
  year: number,
  month: number
): MonthlyConsolidatedSummary {
  const items: MonthlyDueItem[] = [];

  let totalRecurring = 0;
  let totalInstallmentsOwn = 0;
  let totalSharedToCollect = 0;

  const daysInTargetMonth = new Date(year, month, 0).getDate();

  // 1. Procesar Gastos Fijos Activos del mes
  for (const exp of expenses) {
    if (!exp.is_active) continue;

    const amount = Number(exp.actual_amount ?? exp.estimated_amount);
    const effectiveDay = Math.min(exp.payment_day, daysInTargetMonth);
    const fullDate = `${year}-${String(month).padStart(2, '0')}-${String(effectiveDay).padStart(2, '0')}`;

    totalRecurring += amount;

    items.push({
      id: `exp-${exp.id}`,
      title: exp.name,
      type: 'recurring',
      amount,
      day: effectiveDay,
      fullDate,
      // Consideramos pagado si ya se cargó monto real facturado
      isPaid: exp.actual_amount !== null && exp.actual_amount !== undefined,
      details: exp.category || 'Gasto Fijo Mensual',
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

  // 3. Ordenar cronológicamente por día del mes
  items.sort((a, b) => a.day - b.day);

  // 4. Cálculos consolidados
  const totalOwnToPay = Number((totalRecurring + totalInstallmentsOwn).toFixed(2));
  const totalAllCommitments = Number((totalOwnToPay + totalSharedToCollect).toFixed(2));

  let paidCommitmentsAmount = 0;
  let paidCommitmentsCount = 0;

  for (const it of items) {
    if (it.isPaid) {
      paidCommitmentsAmount += it.amount;
      paidCommitmentsCount += 1;
    }
  }

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
    totalRecurring: Number(totalRecurring.toFixed(2)),
    totalInstallmentsOwn: Number(totalInstallmentsOwn.toFixed(2)),
    totalSharedToCollect: Number(totalSharedToCollect.toFixed(2)),
    totalAllCommitments,
    paidCommitmentsAmount: Number(paidCommitmentsAmount.toFixed(2)),
    pendingCommitmentsAmount,
    totalCommitmentsCount,
    paidCommitmentsCount,
    percentageCompleted,
    items,
  };
}
