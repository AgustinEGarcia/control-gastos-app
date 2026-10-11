import { describe, it, expect, vi } from 'vitest';
import {
  addMonthsToDateString,
  isRefundTransaction,
  cleanRefundDescription,
  shiftInstallmentMonth,
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
});
