import { describe, it, expect, vi } from 'vitest';
import { updatePerson } from '../transactions';
import { calculatePaymentMethodMonthlyTotals } from '../dashboard';
import type { RecurringExpenseWithMethod } from '../recurringExpenses';
import type { TransactionWithDetails } from '../transactions';

describe('Spec 015: Servicios de Transacciones, Totales y Personas', () => {
  describe('updatePerson', () => {
    it('debe actualizar el nombre y email de una persona correctamente', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'p-1', name: 'Carlos Gomez', email: 'carlos@test.com' },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

      const mockSupabase = { from: mockFrom } as any;

      const result = await updatePerson(mockSupabase, 'p-1', {
        name: 'Carlos Gomez',
        email: 'carlos@test.com',
      });

      expect(mockFrom).toHaveBeenCalledWith('people');
      expect(mockUpdate).toHaveBeenCalledWith({
        name: 'Carlos Gomez',
        email: 'carlos@test.com',
      });
      expect(mockEq).toHaveBeenCalledWith('id', 'p-1');
      expect(result.name).toBe('Carlos Gomez');
    });

    it('debe rechazar si el nombre está en blanco', async () => {
      const mockSupabase = { from: vi.fn() } as any;

      await expect(
        updatePerson(mockSupabase, 'p-1', { name: '   ', email: null })
      ).rejects.toThrow('El nombre de la persona es obligatorio.');
    });
  });

  describe('calculatePaymentMethodMonthlyTotals', () => {
    it('debe calcular los totales por método de pago sumando cuotas y gastos fijos', () => {
      const mockExpenses: RecurringExpenseWithMethod[] = [
        {
          id: 'exp-1',
          user_id: 'u-1',
          name: 'Netflix',
          category: 'Streaming',
          estimated_amount: 5000,
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
        {
          id: 'exp-2',
          user_id: 'u-1',
          name: 'Spotify',
          category: 'Streaming',
          estimated_amount: 3000,
          actual_amount: 3200,
          payment_day: 15,
          payment_method_id: 'pm-master',
          is_active: true,
          created_at: '',
          payment_method: {
            id: 'pm-master',
            user_id: 'u-1',
            name: 'Mastercard BBVA',
            is_own: true,
            owner_name: null,
            closing_day: 22,
            due_day: 7,
            created_at: '',
          },
        },
      ];

      const mockTransactions: TransactionWithDetails[] = [
        {
          id: 'tx-1',
          user_id: 'u-1',
          description: 'Zapatillas en cuotas',
          total_amount: 60000,
          installments_count: 3,
          purchase_date: '2026-10-01',
          payment_method_id: 'pm-visa',
          beneficiary_person_id: null,
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
          installments: [
            {
              id: 'inst-1',
              transaction_id: 'tx-1',
              installment_number: 1,
              amount: 20000,
              due_date: '2026-10-05',
              is_paid: false,
              created_at: '',
            },
            {
              id: 'inst-2',
              transaction_id: 'tx-1',
              installment_number: 2,
              amount: 20000,
              due_date: '2026-11-05',
              is_paid: false,
              created_at: '',
            },
          ],
        },
      ];

      const totals = calculatePaymentMethodMonthlyTotals(
        mockExpenses,
        mockTransactions,
        2026,
        10
      );

      expect(totals.length).toBe(2);

      const visaTotal = totals.find((t) => t.paymentMethodId === 'pm-visa');
      expect(visaTotal).toBeDefined();
      expect(visaTotal?.name).toBe('Visa Macro');
      expect(visaTotal?.totalInstallments).toBe(20000);
      expect(visaTotal?.totalRecurring).toBe(5000);
      expect(visaTotal?.totalAmount).toBe(25000);

      const masterTotal = totals.find((t) => t.paymentMethodId === 'pm-master');
      expect(masterTotal).toBeDefined();
      expect(masterTotal?.name).toBe('Mastercard BBVA');
      expect(masterTotal?.totalInstallments).toBe(0);
      expect(masterTotal?.totalRecurring).toBe(3200);
      expect(masterTotal?.totalAmount).toBe(3200);

      // Verificamos que esté ordenado descendente por total
      expect(totals[0].paymentMethodId).toBe('pm-visa');
      expect(totals[1].paymentMethodId).toBe('pm-master');
    });
  });
});
