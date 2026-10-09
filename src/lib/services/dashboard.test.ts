import { describe, expect, it } from 'vitest';
import {
  calculateMonthlyConsolidated,
  getMonthName,
} from './dashboard';
import type { RecurringExpense } from './recurringExpenses';
import type { TransactionWithDetails } from './transactions';

describe('Servicio de Dashboard Consolidado Mensual (Spec 008)', () => {
  it('debe devolver el nombre del mes en español', () => {
    expect(getMonthName(1)).toBe('Enero');
    expect(getMonthName(3)).toBe('Marzo');
    expect(getMonthName(12)).toBe('Diciembre');
  });

  it('debe consolidar gastos fijos activos y cuotas propias vs compartidas para el mes especificado', () => {
    const expenses: RecurringExpense[] = [
      {
        id: 'exp-1',
        user_id: 'u-1',
        name: 'Alquiler Departamento',
        category: 'Vivienda',
        estimated_amount: 180000,
        actual_amount: 180000, // Marcado con factura
        payment_day: 10,
        payment_method_id: null,
        is_active: true,
        created_at: '',
      },
      {
        id: 'exp-2',
        user_id: 'u-1',
        name: 'Suscripción Streaming',
        category: 'Ocio',
        estimated_amount: 5000,
        actual_amount: null,
        payment_day: 15,
        payment_method_id: null,
        is_active: false, // Inactivo -> debe ignorarse
        created_at: '',
      },
    ];

    const transactions: TransactionWithDetails[] = [
      {
        id: 'tx-propia',
        user_id: 'u-1',
        description: 'Microondas Whirlpool',
        total_amount: 60000,
        installments_count: 3,
        purchase_date: '2026-01-01',
        first_installment_date: '2026-02-05',
        payment_method_id: null,
        beneficiary_person_id: null, // Propia
        payer_person_id: null,
        created_at: '',
        payment_method: null,
        beneficiary: null,
        installments: [
          {
            id: 'i-1',
            transaction_id: 'tx-propia',
            installment_number: 1,
            amount: 20000,
            due_date: '2026-02-05', // Mes anterior
            is_paid: true,
            created_at: '',
          },
          {
            id: 'i-2',
            transaction_id: 'tx-propia',
            installment_number: 2,
            amount: 20000,
            due_date: '2026-03-05', // MARZO (cae en este mes)
            is_paid: false,
            created_at: '',
          },
        ],
      },
      {
        id: 'tx-compartida',
        user_id: 'u-1',
        description: 'Celular Samsung para Papá',
        total_amount: 150000,
        installments_count: 3,
        purchase_date: '2026-02-01',
        first_installment_date: '2026-03-20',
        payment_method_id: null,
        beneficiary_person_id: 'p-papa', // Compartida a tercero
        payer_person_id: null,
        created_at: '',
        payment_method: null,
        beneficiary: {
          id: 'p-papa',
          user_id: 'u-1',
          name: 'Papá',
          email: null,
          associated_auth_user_id: null,
          created_at: '',
        },
        installments: [
          {
            id: 'i-3',
            transaction_id: 'tx-compartida',
            installment_number: 1,
            amount: 50000,
            due_date: '2026-03-20', // MARZO (compartida)
            is_paid: false,
            created_at: '',
          },
        ],
      },
    ];

    // Evaluamos Marzo de 2026
    const summary = calculateMonthlyConsolidated(expenses, transactions, 2026, 3);

    // Subtotales
    expect(summary.totalRecurring).toBe(180000);
    expect(summary.totalInstallmentsOwn).toBe(20000);
    expect(summary.totalOwnToPay).toBe(200000); // 180.000 + 20.000
    expect(summary.totalSharedToCollect).toBe(50000); // 50.000 de papá
    expect(summary.totalAllCommitments).toBe(250000);

    // Items ordenados por día del mes:
    // Día 5: Cuota microondas ($20.000)
    // Día 10: Alquiler ($180.000)
    // Día 20: Celular de papá ($50.000)
    expect(summary.items).toHaveLength(3);
    expect(summary.items[0].day).toBe(5);
    expect(summary.items[0].type).toBe('installment_own');
    expect(summary.items[0].targetId).toBe('i-2');
    expect(summary.items[1].day).toBe(10);
    expect(summary.items[1].type).toBe('recurring');
    expect(summary.items[1].targetId).toBe('exp-1');
    expect(summary.items[2].day).toBe(20);
    expect(summary.items[2].type).toBe('installment_shared');
    expect(summary.items[2].beneficiaryName).toBe('Papá');
    expect(summary.items[2].targetId).toBe('i-3');

    // Pagos cubiertos y montos propios
    expect(summary.paidCommitmentsCount).toBe(1);
    expect(summary.paidCommitmentsAmount).toBe(180000);
    expect(summary.paidOwnAmount).toBe(180000);
    expect(summary.pendingOwnAmount).toBe(20000); // 200.000 - 180.000
    expect(summary.percentageCompleted).toBe(33); // 1 de 3
  });

  it('debe respetar el mapa de pagos mensuales de gastos fijos (monthlyPaymentsMap)', () => {
    const expenses: RecurringExpense[] = [
      {
        id: 'exp-alquiler',
        user_id: 'u-1',
        name: 'Alquiler',
        category: 'Vivienda',
        estimated_amount: 150000,
        actual_amount: null,
        payment_day: 10,
        payment_method_id: null,
        is_active: true,
        created_at: '',
      },
    ];

    // Sin mapa -> pendiente (no tiene actual_amount)
    const sinPagar = calculateMonthlyConsolidated(expenses, [], 2026, 3);
    expect(sinPagar.items[0].isPaid).toBe(false);
    expect(sinPagar.paidOwnAmount).toBe(0);
    expect(sinPagar.pendingOwnAmount).toBe(150000);

    // Con mapa marcado como true -> pagado
    const conPago = calculateMonthlyConsolidated(expenses, [], 2026, 3, {
      'exp-alquiler': true,
    });
    expect(conPago.items[0].isPaid).toBe(true);
    expect(conPago.paidOwnAmount).toBe(150000);
    expect(conPago.pendingOwnAmount).toBe(0);
  });

  it('debe ajustar fechas con días inválidos en meses cortos (ej. Febrero)', () => {
    const expenses: RecurringExpense[] = [
      {
        id: 'exp-1',
        user_id: 'u-1',
        name: 'Gasto fin de mes',
        category: 'General',
        estimated_amount: 10000,
        actual_amount: null,
        payment_day: 31, // Día 31
        payment_method_id: null,
        is_active: true,
        created_at: '',
      },
    ];

    // Febrero 2026 (28 días)
    const summary = calculateMonthlyConsolidated(expenses, [], 2026, 2);
    expect(summary.items).toHaveLength(1);
    expect(summary.items[0].day).toBe(28); // Clamp a 28
    expect(summary.items[0].fullDate).toBe('2026-02-28');
  });

  it('debe integrar gastos variables del mes en los totales propios y cronograma (Spec 013)', () => {
    const expenses: RecurringExpense[] = [
      {
        id: 'exp-1',
        user_id: 'u-1',
        name: 'Internet',
        category: 'Servicios',
        estimated_amount: 30000,
        actual_amount: 30000,
        payment_day: 15,
        payment_method_id: null,
        is_active: true,
        created_at: '',
      },
    ];

    const variableExpense = {
      year: 2026,
      month: 10,
      name: 'Gastos Varios',
      amount: 500000,
      items: [
        { id: '1', label: 'Super', amount: 300000 },
        { id: '2', label: 'Combustible', amount: 200000 },
      ],
      is_paid: false,
    };

    const summary = calculateMonthlyConsolidated(expenses, [], 2026, 10, {}, variableExpense);

    expect(summary.totalVariable).toBe(500000);
    expect(summary.totalRecurring).toBe(30000);
    expect(summary.totalOwnToPay).toBe(530000); // 30.000 + 500.000
    expect(summary.paidOwnAmount).toBe(30000); // solo internet está pagado
    expect(summary.pendingOwnAmount).toBe(500000); // resta la partida variable

    const varItem = summary.items.find((i) => i.type === 'variable');
    expect(varItem).toBeDefined();
    expect(varItem?.title).toBe('Gastos Varios');
    expect(varItem?.amount).toBe(500000);
    expect(varItem?.isPaid).toBe(false);
  });
});

