import { describe, it, expect, vi } from 'vitest';
import {
  addMonthsToDateString,
  isRefundTransaction,
  cleanRefundDescription,
  shiftInstallmentMonth,
  advanceNextInstallmentToCurrentMonth,
  updateInstallmentDueDate,
  type TransactionWithDetails,
} from '../transactions';
import {
  calculateMonthlyConsolidated,
  calculatePaymentMethodMonthlyTotals,
  calculateCardMonthlyCommitments,
} from '../dashboard';

describe('Spec 017 — Gestión de Resumen Real de Tarjetas (Cuotas Salteadas, Dobles y Devoluciones)', () => {
  describe('Helpers de fechas y detección de devoluciones', () => {
    it('debe sumar y restar meses correctamente con addMonthsToDateString', () => {
      expect(addMonthsToDateString('2026-10-15', 1)).toBe('2026-11-15');
      expect(addMonthsToDateString('2026-12-10', 1)).toBe('2027-01-10');
      expect(addMonthsToDateString('2026-11-15', -1)).toBe('2026-10-15');
      // Ajuste de último día de mes (octubre tiene 31, noviembre tiene 30)
      expect(addMonthsToDateString('2026-10-31', 1)).toBe('2026-11-30');
    });

    it('debe identificar transacciones de devolución y limpiar descripciones', () => {
      expect(isRefundTransaction('[DEVOLUCIÓN] Zapatillas devueltas')).toBe(true);
      expect(isRefundTransaction('[REINTEGRO] Promo Galicia')).toBe(true);
      expect(isRefundTransaction('Compra supermercado')).toBe(false);
      expect(isRefundTransaction(null)).toBe(false);

      expect(cleanRefundDescription('[DEVOLUCIÓN] Zapatillas')).toBe('Zapatillas');
      expect(cleanRefundDescription('[REINTEGRO] Promo Galicia')).toBe('Promo Galicia');
      expect(cleanRefundDescription('Compra normal')).toBe('Compra normal');
    });
  });

  describe('Cálculo de Devoluciones y Créditos en Dashboard', () => {
    it('debe restar las devoluciones del total mensual a pagar', () => {
      const regularTx: TransactionWithDetails = {
        id: 'tx-1',
        user_id: 'usr-1',
        description: 'Televisor Smart',
        total_amount: 30000,
        installments_count: 3,
        purchase_date: '2026-10-01',
        first_installment_date: '2026-10-10',
        payment_method_id: 'pm-visa',
        beneficiary_person_id: null,
        payer_person_id: null,
        created_at: new Date().toISOString(),
        payment_method: { id: 'pm-visa', user_id: 'usr-1', name: 'Visa Gold', is_own: true, owner_name: null, closing_day: 25, due_day: 10, created_at: '' },
        beneficiary: null,
        installments: [
          {
            id: 'inst-1',
            transaction_id: 'tx-1',
            installment_number: 1,
            amount: 10000,
            due_date: '2026-10-10',
            is_paid: false,
            created_at: '',
          },
        ],
      };

      const refundTx: TransactionWithDetails = {
        id: 'tx-2',
        user_id: 'usr-1',
        description: '[DEVOLUCIÓN] Cancelación zapatillas',
        total_amount: 3000,
        installments_count: 1,
        purchase_date: '2026-10-05',
        first_installment_date: '2026-10-10',
        payment_method_id: 'pm-visa',
        beneficiary_person_id: null,
        payer_person_id: null,
        created_at: new Date().toISOString(),
        payment_method: { id: 'pm-visa', user_id: 'usr-1', name: 'Visa Gold', is_own: true, owner_name: null, closing_day: 25, due_day: 10, created_at: '' },
        beneficiary: null,
        installments: [
          {
            id: 'inst-2',
            transaction_id: 'tx-2',
            installment_number: 1,
            amount: 3000,
            due_date: '2026-10-10',
            is_paid: false,
            created_at: '',
          },
        ],
      };

      const res = calculateMonthlyConsolidated(
        [],
        [regularTx, refundTx],
        2026,
        10
      );

      // Total propio a pagar debe ser $10.000 - $3.000 = $7.000
      expect(res.totalOwnToPay).toBe(7000);
      expect(res.totalInstallmentsOwn).toBe(7000);

      // El ítem de devolución debe estar marcado como isRefund
      const refundItem = res.items.find((it) => it.targetId === 'inst-2');
      expect(refundItem).toBeDefined();
      expect(refundItem?.isRefund).toBe(true);
      expect(refundItem?.title).toContain('Cancelación zapatillas (Devolución 1/1)');
      expect(refundItem?.details).toContain('🟢 Devolución');
    });

    it('debe restar devoluciones en los totales por método de pago', () => {
      const regularTx: TransactionWithDetails = {
        id: 'tx-1',
        user_id: 'usr-1',
        description: 'Compra Visa',
        total_amount: 20000,
        installments_count: 1,
        purchase_date: '2026-10-01',
        first_installment_date: '2026-10-10',
        payment_method_id: 'pm-visa',
        beneficiary_person_id: null,
        payer_person_id: null,
        created_at: '',
        payment_method: { id: 'pm-visa', user_id: 'usr-1', name: 'Visa', is_own: true, owner_name: null, closing_day: 25, due_day: 10, created_at: '' },
        beneficiary: null,
        installments: [
          { id: 'inst-1', transaction_id: 'tx-1', installment_number: 1, amount: 20000, due_date: '2026-10-10', is_paid: false, created_at: '' },
        ],
      };

      const refundTx: TransactionWithDetails = {
        id: 'tx-2',
        user_id: 'usr-1',
        description: '[DEVOLUCIÓN] Crédito a favor',
        total_amount: 5000,
        installments_count: 1,
        purchase_date: '2026-10-01',
        first_installment_date: '2026-10-10',
        payment_method_id: 'pm-visa',
        beneficiary_person_id: null,
        payer_person_id: null,
        created_at: '',
        payment_method: { id: 'pm-visa', user_id: 'usr-1', name: 'Visa', is_own: true, owner_name: null, closing_day: 25, due_day: 10, created_at: '' },
        beneficiary: null,
        installments: [
          { id: 'inst-2', transaction_id: 'tx-2', installment_number: 1, amount: 5000, due_date: '2026-10-10', is_paid: false, created_at: '' },
        ],
      };

      const totals = calculatePaymentMethodMonthlyTotals(
        [],
        [regularTx, refundTx],
        2026,
        10,
        [{ id: 'pm-visa', name: 'Visa' }]
      );

      expect(totals.length).toBe(1);
      expect(totals[0].totalInstallments).toBe(15000);
      expect(totals[0].totalAmount).toBe(15000);
    });

    it('debe sumar correctamente dos cuotas cobradas juntas en el mismo mes para la misma tarjeta (cuota doble)', () => {
      // Compra en 3 cuotas donde la cuota 1 y cuota 2 se debitan juntas en octubre 2026
      const doubleInstallmentTx: TransactionWithDetails = {
        id: 'tx-doble',
        user_id: 'usr-1',
        description: 'Compra Electrodoméstico',
        total_amount: 30000,
        installments_count: 3,
        purchase_date: '2026-09-15',
        first_installment_date: '2026-10-10',
        payment_method_id: 'pm-visa',
        beneficiary_person_id: null,
        payer_person_id: null,
        created_at: '',
        payment_method: { id: 'pm-visa', user_id: 'usr-1', name: 'Visa Gold', is_own: true, owner_name: null, closing_day: 25, due_day: 10, created_at: '' },
        beneficiary: null,
        installments: [
          { id: 'inst-1', transaction_id: 'tx-doble', installment_number: 1, amount: 10000, due_date: '2026-10-10', is_paid: false, created_at: '' },
          { id: 'inst-2', transaction_id: 'tx-doble', installment_number: 2, amount: 10000, due_date: '2026-10-10', is_paid: false, created_at: '' }, // ¡Segunda cuota cobrada en el mismo mes!
          { id: 'inst-3', transaction_id: 'tx-doble', installment_number: 3, amount: 10000, due_date: '2026-11-10', is_paid: false, created_at: '' },
        ],
      };

      const totals = calculatePaymentMethodMonthlyTotals(
        [],
        [doubleInstallmentTx],
        2026,
        10,
        [{ id: 'pm-visa', name: 'Visa Gold' }]
      );

      // El total por tarjeta debe computar AMBAS cuotas: $10.000 + $10.000 = $20.000
      expect(totals.length).toBe(1);
      expect(totals[0].totalInstallments).toBe(20000);
      expect(totals[0].totalAmount).toBe(20000);

      // Y en el consolidado general también debe registrar ambas cuotas
      const res = calculateMonthlyConsolidated([], [doubleInstallmentTx], 2026, 10);
      expect(res.totalInstallmentsOwn).toBe(20000);
      expect(res.totalOwnToPay).toBe(20000);
      // Deben existir 2 ítems en el cronograma para ese mes
      expect(res.items.filter((it) => it.transactionId === 'tx-doble').length).toBe(2);
    });

    it('debe calcular exactamente la combinación de cuota doble + reintegro + gasto fijo en la misma tarjeta', () => {
      // 1. Tarjeta Santander con gasto fijo recurrente de $6.000
      const fixedExpense = {
        id: 'exp-1',
        user_id: 'usr-1',
        name: 'Seguro Celular',
        category: 'Seguros',
        estimated_amount: 6000,
        actual_amount: 6000,
        payment_day: 10,
        payment_method_id: 'pm-santander',
        is_active: true,
        created_at: '',
        payment_method: { id: 'pm-santander', user_id: 'usr-1', name: 'Santander Río', is_own: true, owner_name: null, closing_day: 25, due_day: 10, created_at: '' },
      };

      // 2. Compra con cuota doble: Cuota 2 ($8.000) y Cuota 3 ($8.000) en el mismo mes
      const doubleTx: TransactionWithDetails = {
        id: 'tx-cuotas',
        user_id: 'usr-1',
        description: 'Vuelos Bariloche',
        total_amount: 24000,
        installments_count: 3,
        purchase_date: '2026-08-10',
        first_installment_date: '2026-09-10',
        payment_method_id: 'pm-santander',
        beneficiary_person_id: null,
        payer_person_id: null,
        created_at: '',
        payment_method: { id: 'pm-santander', user_id: 'usr-1', name: 'Santander Río', is_own: true, owner_name: null, closing_day: 25, due_day: 10, created_at: '' },
        beneficiary: null,
        installments: [
          { id: 'inst-1', transaction_id: 'tx-cuotas', installment_number: 1, amount: 8000, due_date: '2026-09-10', is_paid: true, created_at: '' },
          { id: 'inst-2', transaction_id: 'tx-cuotas', installment_number: 2, amount: 8000, due_date: '2026-10-10', is_paid: false, created_at: '' },
          { id: 'inst-3', transaction_id: 'tx-cuotas', installment_number: 3, amount: 8000, due_date: '2026-10-10', is_paid: false, created_at: '' }, // cuota adelantada
        ],
      };

      // 3. Reintegro promocional del banco en la misma tarjeta por $4.500
      const refundTx: TransactionWithDetails = {
        id: 'tx-refund',
        user_id: 'usr-1',
        description: '[REINTEGRO] Promo Combustible Santander',
        total_amount: 4500,
        installments_count: 1,
        purchase_date: '2026-10-02',
        first_installment_date: '2026-10-10',
        payment_method_id: 'pm-santander',
        beneficiary_person_id: null,
        payer_person_id: null,
        created_at: '',
        payment_method: { id: 'pm-santander', user_id: 'usr-1', name: 'Santander Río', is_own: true, owner_name: null, closing_day: 25, due_day: 10, created_at: '' },
        beneficiary: null,
        installments: [
          { id: 'inst-refund', transaction_id: 'tx-refund', installment_number: 1, amount: 4500, due_date: '2026-10-10', is_paid: false, created_at: '' },
        ],
      };

      // Cálculo por tarjeta
      const totals = calculatePaymentMethodMonthlyTotals(
        [fixedExpense as any],
        [doubleTx, refundTx],
        2026,
        10,
        [{ id: 'pm-santander', name: 'Santander Río' }]
      );

      // Fijo: $6.000
      // Cuotas netas: $8.000 + $8.000 - $4.500 = $11.500
      // Total a pagar en la tarjeta Santander: $6.000 + $11.500 = $17.500
      expect(totals.length).toBe(1);
      expect(totals[0].totalRecurring).toBe(6000);
      expect(totals[0].totalInstallments).toBe(11500);
      expect(totals[0].totalAmount).toBe(17500);

      // Cálculo en el consolidado general
      const res = calculateMonthlyConsolidated(
        [fixedExpense as any],
        [doubleTx, refundTx],
        2026,
        10
      );
      expect(res.totalRecurring).toBe(6000);
      expect(res.totalInstallmentsOwn).toBe(11500);
      expect(res.totalOwnToPay).toBe(17500);
    });
  });

  describe('Servicio de corrimiento de cuotas (shiftInstallmentMonth)', () => {
    it('debe posponer la cuota y cuotas subsecuentes sumando meses', async () => {
      const mockInstallment = {
        id: 'inst-10',
        transaction_id: 'tx-100',
        installment_number: 2,
        amount: 5000,
        due_date: '2026-11-10',
        is_paid: false,
      };

      const mockSubsequent = [
        {
          id: 'inst-11',
          transaction_id: 'tx-100',
          installment_number: 3,
          amount: 5000,
          due_date: '2026-12-10',
          is_paid: false,
        },
      ];

      const updateSpy = vi.fn().mockResolvedValue({ error: null });

      const supabaseMock: any = {
        from: vi.fn((table: string) => {
          if (table === 'installments') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn((field: string, val: any) => {
                if (field === 'id' && val === 'inst-10') {
                  return { single: vi.fn().mockResolvedValue({ data: mockInstallment, error: null }) };
                }
                return {
                  gt: vi.fn().mockReturnThis(),
                  order: vi.fn().mockResolvedValue({ data: mockSubsequent, error: null }),
                };
              }),
              update: vi.fn((payload: any) => ({
                eq: vi.fn().mockResolvedValue({ error: null }),
              })),
            };
          }
          return {};
        }),
      };

      const res = await shiftInstallmentMonth(supabaseMock, 'inst-10', 1, true);
      expect(res.success).toBe(true);
      expect(res.newDueDate).toBe('2026-12-10');
    });
  });

  describe('Servicio de cobro doble (advanceNextInstallmentToCurrentMonth)', () => {
    it('debe adelantar la siguiente cuota pendiente asignándole la fecha de la cuota actual', async () => {
      const currentInst = {
        id: 'inst-current',
        transaction_id: 'tx-200',
        installment_number: 1,
        due_date: '2026-10-10',
        is_paid: false,
      };

      const nextInst = {
        id: 'inst-next',
        transaction_id: 'tx-200',
        installment_number: 2,
        due_date: '2026-11-10',
        is_paid: false,
      };

      let updatedPayload: any = null;
      let updatedId: any = null;

      const supabaseMock: any = {
        from: vi.fn((table: string) => {
          if (table === 'installments') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn((field: string, val: any) => {
                if (field === 'id' && val === 'inst-current') {
                  return { single: vi.fn().mockResolvedValue({ data: currentInst, error: null }) };
                }
                // When selecting next installment:
                return {
                  gt: vi.fn().mockReturnThis(),
                  eq: vi.fn().mockReturnThis(),
                  order: vi.fn().mockReturnThis(),
                  limit: vi.fn().mockReturnThis(),
                  maybeSingle: vi.fn().mockResolvedValue({ data: nextInst, error: null }),
                };
              }),
              update: vi.fn((payload: any) => {
                updatedPayload = payload;
                return {
                  eq: vi.fn((field: string, id: any) => {
                    updatedId = id;
                    return Promise.resolve({ error: null });
                  }),
                };
              }),
            };
          }
          return {};
        }),
      };

      const result = await advanceNextInstallmentToCurrentMonth(supabaseMock, 'inst-current');
      expect(result.success).toBe(true);
      expect(result.advancedInstallmentNumber).toBe(2);
      expect(updatedPayload).toEqual({ due_date: '2026-10-10' });
      expect(updatedId).toBe('inst-next');
    });

    it('debe retornar error si no existen cuotas posteriores pendientes', async () => {
      const lastInst = {
        id: 'inst-last',
        transaction_id: 'tx-200',
        installment_number: 3,
        due_date: '2026-10-10',
        is_paid: false,
      };

      const supabaseMock: any = {
        from: vi.fn((table: string) => {
          if (table === 'installments') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn((field: string, val: any) => {
                if (field === 'id' && val === 'inst-last') {
                  return { single: vi.fn().mockResolvedValue({ data: lastInst, error: null }) };
                }
                return {
                  gt: vi.fn().mockReturnThis(),
                  eq: vi.fn().mockReturnThis(),
                  order: vi.fn().mockReturnThis(),
                  limit: vi.fn().mockReturnThis(),
                  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                };
              }),
            };
          }
          return {};
        }),
      };

      const result = await advanceNextInstallmentToCurrentMonth(supabaseMock, 'inst-last');
      expect(result.success).toBe(false);
      expect(result.error).toContain('No hay más cuotas posteriores');
    });
  });
});

