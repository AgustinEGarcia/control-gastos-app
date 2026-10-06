import { describe, expect, it } from 'vitest';
import {
  calculateDebtorBalance,
  calculateDebtorsGlobalSummary,
  validatePaymentReceivedInput,
  type DebtorAccount,
} from './debtors';

describe('Servicio de Deudores y Estado de Cuenta (Spec 006)', () => {
  describe('Cálculo de Balance por Deudor (calculateDebtorBalance)', () => {
    it('debe calcular saldo intacto y estado pendiente sin pagos recibidos', () => {
      const transactions = [{ total_amount: 50000 }, { total_amount: 25000 }];
      const payments: { amount: number }[] = [];

      const balance = calculateDebtorBalance(transactions, payments);
      expect(balance.totalDebt).toBe(75000);
      expect(balance.totalPaid).toBe(0);
      expect(balance.remainingBalance).toBe(75000);
      expect(balance.status).toBe('pending');
    });

    it('debe restar correctamente pagos parciales recibidos', () => {
      const transactions = [{ total_amount: 100000 }];
      const payments = [{ amount: 30000 }, { amount: 20000 }];

      const balance = calculateDebtorBalance(transactions, payments);
      expect(balance.totalDebt).toBe(100000);
      expect(balance.totalPaid).toBe(50000);
      expect(balance.remainingBalance).toBe(50000);
      expect(balance.status).toBe('pending');
    });

    it('debe marcar como paid_off cuando el total cobrado iguala o supera la deuda', () => {
      const transactions = [{ total_amount: 40000 }];
      const payments = [{ amount: 40000 }];

      const balance = calculateDebtorBalance(transactions, payments);
      expect(balance.totalDebt).toBe(40000);
      expect(balance.totalPaid).toBe(40000);
      expect(balance.remainingBalance).toBe(0);
      expect(balance.status).toBe('paid_off');
    });
  });

  describe('Validación de Pagos Recibidos (validatePaymentReceivedInput)', () => {
    it('debe rechazar si falta la persona', () => {
      const res = validatePaymentReceivedInput({
        amount: 5000,
        payment_date: '2026-03-01',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.person_id).toBeDefined();
    });

    it('debe rechazar montos menores o iguales a cero', () => {
      const res = validatePaymentReceivedInput({
        person_id: 'person-1',
        amount: 0,
        payment_date: '2026-03-01',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.amount).toBeDefined();
    });

    it('debe rechazar si el cobro supera el saldo pendiente', () => {
      const res = validatePaymentReceivedInput(
        {
          person_id: 'person-1',
          amount: 60000,
          payment_date: '2026-03-01',
        },
        50000 // saldo restante
      );
      expect(res.isValid).toBe(false);
      expect(res.errors.amount).toContain('no puede superar el saldo pendiente');
    });

    it('debe rechazar fecha vacía', () => {
      const res = validatePaymentReceivedInput({
        person_id: 'person-1',
        amount: 10000,
        payment_date: '',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.payment_date).toBeDefined();
    });

    it('debe aceptar datos correctos', () => {
      const res = validatePaymentReceivedInput(
        {
          person_id: 'person-1',
          amount: 25000,
          payment_date: '2026-03-01',
          notes: 'Transferencia Mercado Pago',
        },
        50000
      );
      expect(res.isValid).toBe(true);
    });
  });

  describe('Resumen Global de Cobranzas (calculateDebtorsGlobalSummary)', () => {
    it('debe consolidar adecuadamente saldos, cobros y conteo de estados', () => {
      const mockDebtors: DebtorAccount[] = [
        {
          person: { id: 'p-1', user_id: 'u-1', name: 'Martín', email: 'martin@ejemplo.com', associated_auth_user_id: null, created_at: '' },
          total_debt: 80000,
          total_paid: 30000,
          remaining_balance: 50000,
          status: 'pending',
          transactions: [],
          payments_received: [],
        },
        {
          person: { id: 'p-2', user_id: 'u-1', name: 'Lucía', email: null, associated_auth_user_id: null, created_at: '' },
          total_debt: 40000,
          total_paid: 40000,
          remaining_balance: 0,
          status: 'paid_off',
          transactions: [],
          payments_received: [],
        },
      ];

      const summary = calculateDebtorsGlobalSummary(mockDebtors);

      expect(summary.totalOriginalDebt).toBe(120000);
      expect(summary.totalCollected).toBe(70000);
      expect(summary.totalPendingToCollect).toBe(50000);
      expect(summary.activeDebtorsCount).toBe(1);
      expect(summary.paidOffDebtorsCount).toBe(1);
      expect(summary.totalPeopleCount).toBe(2);
    });
  });
});
