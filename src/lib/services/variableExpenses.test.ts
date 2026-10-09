import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  calculateVariableItemsTotal,
  getLocalVariableExpense,
  setLocalVariableExpense,
  saveVariableMonthlyExpense,
  toggleVariableExpensePaid,
} from './variableExpenses';

describe('Servicio de Gastos Variables Mensuales (Spec 013)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('calculateVariableItemsTotal', () => {
    it('debe devolver 0 para lista vacía', () => {
      expect(calculateVariableItemsTotal([])).toBe(0);
    });

    it('debe sumar correctamente los ítems desglosados', () => {
      const items = [
        { id: '1', label: 'Supermercado', amount: 450000 },
        { id: '2', label: 'Combustible', amount: 150000 },
        { id: '3', label: 'Peluquería', amount: 35000.5 },
      ];
      expect(calculateVariableItemsTotal(items)).toBe(635000.5);
    });
  });

  describe('Almacenamiento Local (Local Fallback)', () => {
    it('debe guardar y recuperar la partida variable en local', () => {
      setLocalVariableExpense({
        year: 2026,
        month: 10,
        name: 'Gastos Varios',
        amount: 800000,
        items: [],
        is_paid: false,
      });

      const res = getLocalVariableExpense(2026, 10);
      expect(res).not.toBeNull();
      expect(res?.amount).toBe(800000);
      expect(res?.name).toBe('Gastos Varios');
    });

    it('debe retornar null para meses sin datos', () => {
      expect(getLocalVariableExpense(2026, 12)).toBeNull();
    });
  });

  describe('saveVariableMonthlyExpense', () => {
    it('debe calcular el monto a partir de los ítems si se proporcionan', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-1' } } }),
        },
        from: vi.fn().mockReturnValue({
          upsert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: 'var-123' },
                error: null,
              }),
            }),
          }),
        }),
      } as any;

      const res = await saveVariableMonthlyExpense(mockSupabase, {
        year: 2026,
        month: 10,
        items: [
          { id: '1', label: 'Super', amount: 100000 },
          { id: '2', label: 'Combustible', amount: 50000 },
        ],
      });

      expect(res.success).toBe(true);
      expect(res.data.amount).toBe(150000);
      expect(res.data.items).toHaveLength(2);
    });

    it('debe aceptar monto global directo si no hay ítems', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      } as any;

      const res = await saveVariableMonthlyExpense(mockSupabase, {
        year: 2026,
        month: 10,
        amount: 500000,
      });

      expect(res.success).toBe(true);
      expect(res.data.amount).toBe(500000);
      expect(res.data.items).toHaveLength(0);
    });
  });

  describe('toggleVariableExpensePaid', () => {
    it('debe alternar el estado de pagado y reflejarlo en almacenamiento', async () => {
      setLocalVariableExpense({
        year: 2026,
        month: 10,
        name: 'Gastos Varios',
        amount: 500000,
        items: [],
        is_paid: false,
      });

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      } as any;

      const res = await toggleVariableExpensePaid(mockSupabase, 2026, 10, true);
      expect(res.success).toBe(true);
      expect(res.isPaid).toBe(true);

      const local = getLocalVariableExpense(2026, 10);
      expect(local?.is_paid).toBe(true);
    });
  });
});
