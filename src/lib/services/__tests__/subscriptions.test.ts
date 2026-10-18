import { describe, it, expect } from 'vitest';
import {
  validateSubscriptionInput,
  calculateSubscriptionSummary,
  type Subscription,
  type SubscriptionInput,
} from '../subscriptions';

describe('Servicio de Suscripciones (Spec 022)', () => {
  describe('Validaciones (validateSubscriptionInput)', () => {
    it('debe rechazar suscripción sin nombre', () => {
      const input: Partial<SubscriptionInput> = {
        name: '',
        amount: 5000,
        currency: 'ARS',
        billing_day: 10,
        category: 'Streaming',
      };
      const res = validateSubscriptionInput(input);
      expect(res.isValid).toBe(false);
      expect(res.errors.name).toBeDefined();
    });

    it('debe rechazar suscripción con monto <= 0', () => {
      const input: Partial<SubscriptionInput> = {
        name: 'Netflix',
        amount: 0,
        currency: 'ARS',
        billing_day: 10,
        category: 'Streaming',
      };
      const res = validateSubscriptionInput(input);
      expect(res.isValid).toBe(false);
      expect(res.errors.amount).toBeDefined();
    });

    it('debe rechazar día de cobro fuera del rango 1-31', () => {
      const input: Partial<SubscriptionInput> = {
        name: 'Spotify',
        amount: 3000,
        currency: 'ARS',
        billing_day: 35,
        category: 'Música',
      };
      const res = validateSubscriptionInput(input);
      expect(res.isValid).toBe(false);
      expect(res.errors.billing_day).toBeDefined();
    });

    it('debe validar exitosamente datos correctos', () => {
      const input: SubscriptionInput = {
        name: 'ChatGPT Plus',
        amount: 20,
        currency: 'USD',
        billing_day: 15,
        category: 'Software & IA',
      };
      const res = validateSubscriptionInput(input);
      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors).length).toBe(0);
    });
  });

  describe('Cálculos de total mensual estimado (calculateSubscriptionSummary)', () => {
    it('debe devolver 0 cuando no hay suscripciones', () => {
      const summary = calculateSubscriptionSummary([]);
      expect(summary.totalMonthlyArs).toBe(0);
      expect(summary.totalMonthlyUsd).toBe(0);
      expect(summary.activeCount).toBe(0);
      expect(summary.pausedCount).toBe(0);
      expect(summary.totalCount).toBe(0);
      expect(summary.nextBillingItem).toBeNull();
    });

    it('debe sumar únicamente suscripciones activas separadas por moneda', () => {
      const mockSubs: Subscription[] = [
        {
          id: '1',
          user_id: 'user-1',
          name: 'Netflix',
          amount: 8500,
          currency: 'ARS',
          billing_day: 5,
          payment_method_id: null,
          category: 'Streaming',
          is_active: true,
          notes: null,
          created_at: '2026-10-01T00:00:00Z',
        },
        {
          id: '2',
          user_id: 'user-1',
          name: 'Spotify',
          amount: 4000,
          currency: 'ARS',
          billing_day: 12,
          payment_method_id: null,
          category: 'Música',
          is_active: false, // Pausada: NO debe sumar
          notes: null,
          created_at: '2026-10-01T00:00:00Z',
        },
        {
          id: '3',
          user_id: 'user-1',
          name: 'Gimnasio',
          amount: 15000,
          currency: 'ARS',
          billing_day: 20,
          payment_method_id: null,
          category: 'Fitness',
          is_active: true,
          notes: null,
          created_at: '2026-10-01T00:00:00Z',
        },
        {
          id: '4',
          user_id: 'user-1',
          name: 'ChatGPT Plus',
          amount: 20,
          currency: 'USD',
          billing_day: 18,
          payment_method_id: null,
          category: 'Software & IA',
          is_active: true,
          notes: null,
          created_at: '2026-10-01T00:00:00Z',
        },
      ];

      const summary = calculateSubscriptionSummary(mockSubs);
      // Total ARS activos = 8500 (Netflix) + 15000 (Gimnasio) = 23500
      expect(summary.totalMonthlyArs).toBe(23500);
      // Total USD activos = 20 (ChatGPT)
      expect(summary.totalMonthlyUsd).toBe(20);
      expect(summary.activeCount).toBe(3);
      expect(summary.pausedCount).toBe(1);
      expect(summary.totalCount).toBe(4);
      expect(summary.nextBillingItem).not.toBeNull();
    });
  });
});
