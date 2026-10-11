import { describe, it, expect, vi } from 'vitest';
import { calculateMonthlyConsolidated } from '../dashboard';
import { updateTransaction } from '../transactions';
import type { RecurringExpenseWithMethod } from '../recurringExpenses';
import type { TransactionWithDetails } from '../transactions';

describe('Spec 016: Servicios de Dashboard y Edición Integral de Transacciones', () => {
  describe('calculateMonthlyConsolidated con método de pago', () => {
    it('debe asignar paymentMethodId y paymentMethodName a gastos fijos y cuotas', () => {
      const mockExpenses: RecurringExpenseWithMethod[] = [
        {
          id: 'exp-1',
          user_id: 'u-1',
          name: 'Gimnasio',
          category: 'Salud',
          estimated_amount: 15000,
          actual_amount: null,
          payment_day: 10,
          payment_method_id: 'pm-visa',
          is_active: true,
          created_at: '',
          payment_method: {
            id: 'pm-visa',
            user_id: 'u-1',
            name: 'Visa Macro',
            is_own: true,
            owner_name: null,
            closing_day: 20,
            due_day: 5,
            created_at: '',
          },
        },
      ];

      const mockTransactions: TransactionWithDetails[] = [
        {
          id: 'tx-1',
          user_id: 'u-1',
          description: 'Smart TV',
          total_amount: 120000,
          installments_count: 6,
          purchase_date: '2026-10-01',
          first_installment_date: '2026-10-01',
          payment_method_id: 'pm-master',
          beneficiary_person_id: null,
          beneficiary: null,
          payer_person_id: null,
          created_at: '',
          payment_method: {
            id: 'pm-master',
            user_id: 'u-1',
            name: 'Mastercard BBVA',
            is_own: true,
            owner_name: null,
            closing_day: 25,
            due_day: 10,
            created_at: '',
          },
          installments: [
            {
              id: 'inst-1',
              transaction_id: 'tx-1',
              installment_number: 1,
              amount: 20000,
              due_date: '2026-10-10',
              is_paid: false,
              created_at: '',
            },
          ],
        },
      ];

      const summary = calculateMonthlyConsolidated(
        mockExpenses,
        mockTransactions,
        2026,
        10
      );

      expect(summary.items.length).toBe(2);

      const fixedItem = summary.items.find((i) => i.id === 'exp-exp-1');
      expect(fixedItem).toBeDefined();
      expect(fixedItem?.paymentMethodId).toBe('pm-visa');
      expect(fixedItem?.paymentMethodName).toBe('Visa Macro');

      const installmentItem = summary.items.find((i) => i.id === 'inst-inst-1');
      expect(installmentItem).toBeDefined();
      expect(installmentItem?.paymentMethodId).toBe('pm-master');
      expect(installmentItem?.paymentMethodName).toBe('Mastercard BBVA');
    });
  });

  describe('updateTransaction con recálculo de cuotas', () => {
    it('debe actualizar la transacción y regenerar cuotas cuando cambian montos o cuotas', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: 'tx-1',
          total_amount: 60000,
          installments_count: 3,
          first_installment_date: '2026-10-01',
        },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: mockSingle }),
      });

      const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEq });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

      const mockFrom = vi.fn((table: string) => {
        if (table === 'transactions') {
          return {
            select: mockSelect,
            update: mockUpdate,
          };
        }
        if (table === 'installments') {
          return {
            delete: mockDelete,
            insert: mockInsert,
          };
        }
        return {};
      });

      const mockSupabase = { from: mockFrom } as any;

      await updateTransaction(mockSupabase, 'tx-1', {
        description: 'Nueva descripción',
        total_amount: 100000,
        installments_count: 5,
        first_installment_date: '2026-11-01',
      });

      expect(mockFrom).toHaveBeenCalledWith('transactions');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Nueva descripción',
          total_amount: 100000,
          installments_count: 5,
        })
      );

      // Verificamos que se borraron las cuotas viejas y se insertaron las 5 nuevas
      expect(mockFrom).toHaveBeenCalledWith('installments');
      expect(mockDeleteEq).toHaveBeenCalledWith('transaction_id', 'tx-1');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            transaction_id: 'tx-1',
            installment_number: 1,
            amount: 20000,
            due_date: '2026-11-01',
          }),
        ])
      );
    });
  });
});
