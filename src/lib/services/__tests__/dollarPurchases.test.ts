import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateDollarPurchaseInput,
  calculateDollarSummary,
  type DollarPurchase,
  type DollarPurchaseInput,
} from '../dollarPurchases';

describe('Servicio de Stock y Compras de Dólares (Spec 021)', () => {
  describe('Validación de entradas (validateDollarPurchaseInput)', () => {
    it('debe rechazar compras sin fecha', () => {
      const input: Partial<DollarPurchaseInput> = {
        purchase_date: '',
        amount_usd: 100,
        exchange_rate: 1350,
      };
      const res = validateDollarPurchaseInput(input);
      expect(res.isValid).toBe(false);
      expect(res.errors.purchase_date).toBeDefined();
    });

    it('debe rechazar compras con cantidad de dólares <= 0', () => {
      const input: Partial<DollarPurchaseInput> = {
        purchase_date: '2026-10-17',
        amount_usd: 0,
        exchange_rate: 1350,
      };
      const res = validateDollarPurchaseInput(input);
      expect(res.isValid).toBe(false);
      expect(res.errors.amount_usd).toBeDefined();
    });

    it('debe rechazar compras con cotización <= 0', () => {
      const input: Partial<DollarPurchaseInput> = {
        purchase_date: '2026-10-17',
        amount_usd: 100,
        exchange_rate: -5,
      };
      const res = validateDollarPurchaseInput(input);
      expect(res.isValid).toBe(false);
      expect(res.errors.exchange_rate).toBeDefined();
    });

    it('debe aceptar entradas completas y correctas', () => {
      const input: DollarPurchaseInput = {
        purchase_date: '2026-10-17',
        amount_usd: 250.5,
        exchange_rate: 1320,
        notes: 'Dólar MEP en banco',
      };
      const res = validateDollarPurchaseInput(input);
      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors).length).toBe(0);
    });
  });

  describe('Cálculo de métricas y promedio ponderado (calculateDollarSummary)', () => {
    it('debe calcular correctamente cuando no hay operaciones', () => {
      const summary = calculateDollarSummary([]);
      expect(summary.totalUsd).toBe(0);
      expect(summary.totalArs).toBe(0);
      expect(summary.averageRate).toBe(0);
      expect(summary.operationsCount).toBe(0);
    });

    it('debe calcular con precisión la cotización promedio ponderada de compra', () => {
      // Compra 1: 100 USD @ $1.000 = $100.000 ARS
      // Compra 2: 200 USD @ $1.300 = $260.000 ARS
      // Total USD = 300 USD
      // Total ARS = $360.000 ARS
      // Cotización promedio ponderada = 360.000 / 300 = $1.200 ARS/USD
      const mockPurchases: DollarPurchase[] = [
        {
          id: '1',
          user_id: 'user-1',
          purchase_date: '2026-10-01',
          amount_usd: 100,
          exchange_rate: 1000,
          total_ars: 100000,
          notes: 'Blue',
          created_at: '2026-10-01T10:00:00Z',
        },
        {
          id: '2',
          user_id: 'user-1',
          purchase_date: '2026-10-15',
          amount_usd: 200,
          exchange_rate: 1300,
          total_ars: 260000,
          notes: 'MEP',
          created_at: '2026-10-15T12:00:00Z',
        },
      ];

      const summary = calculateDollarSummary(mockPurchases);
      expect(summary.totalUsd).toBe(300);
      expect(summary.totalArs).toBe(360000);
      expect(summary.averageRate).toBe(1200);
      expect(summary.operationsCount).toBe(2);
    });
  });
});
