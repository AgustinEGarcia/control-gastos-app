import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyConsolidated,
  calculateCardMonthlyCommitments,
} from '../dashboard';
import type { RecurringExpenseWithMethod } from '../recurringExpenses';
import type { TransactionWithDetails } from '../transactions';

describe('Dashboard Service — calculateMonthlyConsolidated & Card Commitments', () => {
  const mockCardVisa = {
    id: 'card-1',
    name: 'Visa Galicia',
    is_own: true,
    owner_name: null,
    closing_day: 20,
    due_day: 5,
    user_id: 'u1',
    created_at: '2026-01-01',
  };

  const mockExpenses: RecurringExpenseWithMethod[] = [
    {
      id: 'exp-1',
      user_id: 'u1',
      name: 'Internet Fibertel',
      category: 'Servicios',
      estimated_amount: 15000,
      actual_amount: 16000,
      payment_day: 10,
      is_active: true,
      payment_method_id: null,
      payment_method: null,
      created_at: '2026-01-01',
    },
    {
      id: 'exp-2',
      user_id: 'u1',
      name: 'Netflix Premium',
      category: 'Suscripciones',
      estimated_amount: 8000,
      actual_amount: null,
      payment_day: 15,
      is_active: true,
      payment_method_id: 'card-1',
      payment_method: mockCardVisa,
      created_at: '2026-01-01',
    },
    {
      id: 'exp-3',
      user_id: 'u1',
      name: 'Spotify Inactivo',
      category: 'Suscripciones',
      estimated_amount: 3000,
      actual_amount: null,
      payment_day: 18,
      is_active: false,
      payment_method_id: 'card-1',
      payment_method: mockCardVisa,
      created_at: '2026-01-01',
    },
  ];

  const mockTransactions: TransactionWithDetails[] = [
    {
      id: 'tx-1',
      user_id: 'u1',
      description: 'Zapatillas Adidas',
      total_amount: 60000,
      installments_count: 3,
      purchase_date: '2026-09-10',
      first_installment_date: '2026-10-05',
      payment_method_id: 'card-1',
      payment_method: mockCardVisa,
      beneficiary_person_id: null,
      beneficiary: null,
      payer_person_id: null,
      created_at: '2026-09-10',
      installments: [
        {
          id: 'inst-1',
          transaction_id: 'tx-1',
          installment_number: 1,
          amount: 20000,
          due_date: '2026-10-05',
          is_paid: false,
          created_at: '2026-09-10',
        },
      ],
    },
  ];

  it('incluye el nombre de la tarjeta en los detalles del item si tiene payment_method', () => {
    const summary = calculateMonthlyConsolidated(mockExpenses, mockTransactions, 2026, 10);

    const netflixItem = summary.items.find((i) => i.title === 'Netflix Premium');
    expect(netflixItem).toBeDefined();
    expect(netflixItem?.details).toContain('💳 Visa Galicia');

    const internetItem = summary.items.find((i) => i.title === 'Internet Fibertel');
    expect(internetItem).toBeDefined();
    expect(internetItem?.details).not.toContain('💳');
  });

  it('calcula los compromisos totales de una tarjeta combinando cuotas y suscripciones', () => {
    const cardSummary = calculateCardMonthlyCommitments(
      'card-1',
      mockExpenses,
      mockTransactions,
      2026,
      10
    );

    expect(cardSummary.paymentMethodId).toBe('card-1');
    expect(cardSummary.totalInstallments).toBe(20000);
    expect(cardSummary.totalRecurring).toBe(8000); // Solo Netflix activo, Spotify está pausado
    expect(cardSummary.totalToPay).toBe(28000); // 20.000 cuota + 8.000 suscripción
    expect(cardSummary.recurringExpenses.length).toBe(1);
    expect(cardSummary.recurringExpenses[0].name).toBe('Netflix Premium');
  });
});
