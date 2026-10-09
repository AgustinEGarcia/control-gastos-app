import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  getLocalMonthlyPayments,
  setLocalMonthlyPayment,
  getMonthlyExpensePayments,
  toggleExpenseMonthlyPayment,
  updateInstallmentPaidStatus,
} from './expensePayments';

describe('Servicio de Pagos Mensuales (Spec 012)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Almacenamiento Local (Local Fallback)', () => {
    it('debe guardar y recuperar pagos locales correctamente', () => {
      setLocalMonthlyPayment(2026, 10, 'exp-1', true);
      setLocalMonthlyPayment(2026, 10, 'exp-2', false);

      const payments = getLocalMonthlyPayments(2026, 10);
      expect(payments['exp-1']).toBe(true);
      expect(payments['exp-2']).toBe(false);
      expect(payments['exp-inexistente']).toBeUndefined();
    });

    it('debe separar pagos de meses distintos', () => {
      setLocalMonthlyPayment(2026, 10, 'exp-1', true);
      setLocalMonthlyPayment(2026, 11, 'exp-1', false);

      expect(getLocalMonthlyPayments(2026, 10)['exp-1']).toBe(true);
      expect(getLocalMonthlyPayments(2026, 11)['exp-1']).toBe(false);
    });
  });

  describe('toggleExpenseMonthlyPayment', () => {
    it('debe persistir en local y en Supabase cuando está disponible', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: null });
      const fromMock = vi.fn().mockReturnValue({
        upsert: upsertMock,
      });

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
        },
        from: fromMock,
      } as any;

      const res = await toggleExpenseMonthlyPayment(mockSupabase, 'exp-1', 2026, 10, true);
      expect(res.success).toBe(true);
      expect(res.isPaid).toBe(true);

      // Comprobar que en local se guardó
      expect(getLocalMonthlyPayments(2026, 10)['exp-1']).toBe(true);
      expect(upsertMock).toHaveBeenCalled();
    });

    it('debe mantener éxito local si la tabla remota falla (fallback resiliente)', async () => {
      const upsertMock = vi.fn().mockResolvedValue({ error: { message: 'relation does not exist' } });
      const fromMock = vi.fn().mockReturnValue({
        upsert: upsertMock,
      });

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
        },
        from: fromMock,
      } as any;

      const res = await toggleExpenseMonthlyPayment(mockSupabase, 'exp-2', 2026, 10, true);
      expect(res.success).toBe(true);
      expect(res.isPaid).toBe(true);
      expect(getLocalMonthlyPayments(2026, 10)['exp-2']).toBe(true);
    });
  });

  describe('updateInstallmentPaidStatus', () => {
    it('debe actualizar is_paid de la cuota en Supabase', async () => {
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      const fromMock = vi.fn().mockReturnValue({
        update: updateMock,
      });

      const mockSupabase = {
        from: fromMock,
      } as any;

      const res = await updateInstallmentPaidStatus(mockSupabase, 'inst-1', true);
      expect(res.success).toBe(true);
      expect(res.isPaid).toBe(true);
    });
  });
});
