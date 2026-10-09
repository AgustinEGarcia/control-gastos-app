import { describe, it, expect, vi } from 'vitest';
import {
  checkPersonHasAssociatedRecords,
  deletePerson,
  updateTransaction,
} from '../transactions';
import { updateLoan } from '../loans';
import { updatePaymentMethod } from '../paymentMethods';

describe('Edición de Entidades y Eliminación Segura de Personas (Spec 014)', () => {
  describe('Eliminación Segura de Personas (deletePerson)', () => {
    it('debe bloquear eliminación si la persona tiene transacciones asociadas', async () => {
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'transactions') {
            return {
              select: vi.fn().mockReturnValue({
                or: vi.fn().mockResolvedValue({ data: [{ id: 'tx-1' }, { id: 'tx-2' }] }),
              }),
            };
          }
          if (table === 'personal_loans') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
            };
          }
          if (table === 'payments_received') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
            };
          }
          return {};
        }),
      } as any;

      const check = await checkPersonHasAssociatedRecords(mockSupabase, 'p-1');
      expect(check.hasRecords).toBe(true);
      expect(check.reasons[0]).toContain('2 compra(s) o gasto(s)');

      await expect(deletePerson(mockSupabase, 'p-1')).rejects.toThrow(
        /No se puede eliminar a esta persona porque tiene registros vinculados/
      );
    });

    it('debe bloquear eliminación si la persona tiene préstamos asociados', async () => {
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'transactions') {
            return {
              select: vi.fn().mockReturnValue({
                or: vi.fn().mockResolvedValue({ data: [] }),
              }),
            };
          }
          if (table === 'personal_loans') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [{ id: 'loan-1' }] }),
              }),
            };
          }
          if (table === 'payments_received') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
            };
          }
          return {};
        }),
      } as any;

      await expect(deletePerson(mockSupabase, 'p-2')).rejects.toThrow(
        /No se puede eliminar a esta persona porque tiene registros vinculados/
      );
    });

    it('debe eliminar la persona exitosamente si no tiene ningún registro vinculado', async () => {
      const deleteMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'transactions') {
            return {
              select: vi.fn().mockReturnValue({
                or: vi.fn().mockResolvedValue({ data: [] }),
              }),
            };
          }
          if (table === 'personal_loans') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
            };
          }
          if (table === 'payments_received') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
            };
          }
          if (table === 'people') {
            return {
              delete: deleteMock,
            };
          }
          return {};
        }),
      } as any;

      await expect(deletePerson(mockSupabase, 'p-libre')).resolves.toBeUndefined();
      expect(deleteMock).toHaveBeenCalled();
    });
  });

  describe('updateTransaction', () => {
    it('debe llamar a update con los campos modificados', async () => {
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: updateMock,
        }),
      } as any;

      await updateTransaction(mockSupabase, 'tx-1', {
        description: 'Supermercado Coto Editado',
        purchase_date: '2026-10-09',
      });

      expect(updateMock).toHaveBeenCalledWith({
        description: 'Supermercado Coto Editado',
        purchase_date: '2026-10-09',
      });
    });
  });

  describe('updateLoan', () => {
    it('debe llamar a update con los datos del préstamo modificados', async () => {
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'loan-1', initial_amount: 120000 },
              error: null,
            }),
          }),
        }),
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: updateMock,
        }),
      } as any;

      const res = await updateLoan(mockSupabase, 'loan-1', {
        initial_amount: 120000,
        notes: 'Actualizado plazo',
      });

      expect(res.initial_amount).toBe(120000);
      expect(updateMock).toHaveBeenCalled();
    });
  });

  describe('updatePaymentMethod', () => {
    it('debe llamar a update con los datos de tarjeta modificados', async () => {
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'pm-1', name: 'Visa Gold Modificada' },
              error: null,
            }),
          }),
        }),
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: updateMock,
        }),
      } as any;

      const res = await updatePaymentMethod(mockSupabase, 'pm-1', {
        name: 'Visa Gold Modificada',
        closing_day: 25,
      });

      expect(res.name).toBe('Visa Gold Modificada');
      expect(updateMock).toHaveBeenCalled();
    });
  });
});
