import { describe, expect, it } from 'vitest';
import {
  calculateLoanBalance,
  calculateLoansSummary,
  validateLoanInput,
  validateRepaymentInput,
  type LoanWithDetails,
} from './loans';

describe('Servicio de Préstamos Personales (Spec 005)', () => {
  describe('Validación de Préstamos (validateLoanInput)', () => {
    it('debe rechazar si falta el prestamista', () => {
      const res = validateLoanInput({
        initial_amount: 50000,
        currency: 'ARS',
        loan_date: '2026-03-01',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.lender_person_id).toBeDefined();
    });

    it('debe rechazar montos menores o iguales a cero', () => {
      const res = validateLoanInput({
        lender_person_id: 'person-1',
        initial_amount: 0,
        currency: 'ARS',
        loan_date: '2026-03-01',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.initial_amount).toBeDefined();
    });

    it('debe rechazar divisas inválidas distintas de ARS y USD', () => {
      const res = validateLoanInput({
        lender_person_id: 'person-1',
        initial_amount: 100,
        currency: 'EUR' as any,
        loan_date: '2026-03-01',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.currency).toBeDefined();
    });

    it('debe rechazar fecha vacía', () => {
      const res = validateLoanInput({
        lender_person_id: 'person-1',
        initial_amount: 100,
        currency: 'USD',
        loan_date: '',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.loan_date).toBeDefined();
    });

    it('debe aceptar datos válidos en ARS o USD', () => {
      const resARS = validateLoanInput({
        lender_person_id: 'person-1',
        initial_amount: 150000,
        currency: 'ARS',
        loan_date: '2026-03-01',
      });
      expect(resARS.isValid).toBe(true);

      const resUSD = validateLoanInput({
        lender_person_id: 'person-2',
        initial_amount: 500,
        currency: 'USD',
        loan_date: '2026-03-01',
      });
      expect(resUSD.isValid).toBe(true);
    });
  });

  describe('Validación de Abonos (validateRepaymentInput)', () => {
    it('debe rechazar monto menor o igual a cero', () => {
      const res = validateRepaymentInput({
        loan_id: 'loan-1',
        amount_paid: 0,
        payment_date: '2026-03-10',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.amount_paid).toBeDefined();
    });

    it('debe rechazar abonos que superen el saldo restante', () => {
      const res = validateRepaymentInput(
        {
          loan_id: 'loan-1',
          amount_paid: 1200,
          payment_date: '2026-03-10',
        },
        1000 // saldo restante
      );
      expect(res.isValid).toBe(false);
      expect(res.errors.amount_paid).toContain('no puede superar el saldo restante');
    });

    it('debe aceptar abonos válidos', () => {
      const res = validateRepaymentInput(
        {
          loan_id: 'loan-1',
          amount_paid: 500,
          payment_date: '2026-03-10',
        },
        1000
      );
      expect(res.isValid).toBe(true);
    });
  });

  describe('Cálculo de Saldo y Amortización (calculateLoanBalance)', () => {
    it('debe calcular saldo intacto y 0% de progreso sin abonos', () => {
      const balance = calculateLoanBalance(100000, []);
      expect(balance.totalRepaid).toBe(0);
      expect(balance.remainingBalance).toBe(100000);
      expect(balance.percentage).toBe(0);
      expect(balance.isPaidOff).toBe(false);
    });

    it('debe calcular correctamente abonos parciales y porcentaje de avance', () => {
      const repayments = [
        { amount_paid: 25000 },
        { amount_paid: 25000 },
      ];
      const balance = calculateLoanBalance(100000, repayments);
      expect(balance.totalRepaid).toBe(50000);
      expect(balance.remainingBalance).toBe(50000);
      expect(balance.percentage).toBe(50);
      expect(balance.isPaidOff).toBe(false);
    });

    it('debe marcar préstamo liquidado (isPaidOff = true) cuando se cubre el 100%', () => {
      const repayments = [
        { amount_paid: 400 },
        { amount_paid: 600 },
      ];
      const balance = calculateLoanBalance(1000, repayments);
      expect(balance.totalRepaid).toBe(1000);
      expect(balance.remainingBalance).toBe(0);
      expect(balance.percentage).toBe(100);
      expect(balance.isPaidOff).toBe(true);
    });
  });

  describe('Resúmenes Multidivisa Independientes (calculateLoansSummary)', () => {
    it('debe separar completamente las métricas de ARS y USD sin mezclarlas', () => {
      const mockLoans: LoanWithDetails[] = [
        {
          id: 'loan-ars-1',
          user_id: 'user-1',
          lender_person_id: 'p-1',
          loan_type: 'borrowed',
          initial_amount: 100000,
          currency: 'ARS',
          loan_date: '2026-01-01',
          expected_return_date: null,
          status: 'active',
          notes: null,
          created_at: '',
          lender: { id: 'p-1', user_id: 'user-1', name: 'Papá', email: null, associated_auth_user_id: null, created_at: '' },
          repayments: [{ id: 'r-1', loan_id: 'loan-ars-1', amount_paid: 30000, payment_date: '2026-01-15', notes: null, created_at: '' }],
          total_repaid: 30000,
          remaining_balance: 70000,
          repayment_percentage: 30,
        },
        {
          id: 'loan-ars-2',
          user_id: 'user-1',
          lender_person_id: 'p-2',
          loan_type: 'borrowed',
          initial_amount: 50000,
          currency: 'ARS',
          loan_date: '2026-02-01',
          expected_return_date: null,
          status: 'paid_off',
          notes: null,
          created_at: '',
          lender: { id: 'p-2', user_id: 'user-1', name: 'Hermano', email: null, associated_auth_user_id: null, created_at: '' },
          repayments: [{ id: 'r-2', loan_id: 'loan-ars-2', amount_paid: 50000, payment_date: '2026-02-15', notes: null, created_at: '' }],
          total_repaid: 50000,
          remaining_balance: 0,
          repayment_percentage: 100,
        },
        {
          id: 'loan-usd-1',
          user_id: 'user-1',
          lender_person_id: 'p-1',
          loan_type: 'borrowed',
          initial_amount: 1000,
          currency: 'USD',
          loan_date: '2026-01-10',
          expected_return_date: null,
          status: 'active',
          notes: null,
          created_at: '',
          lender: { id: 'p-1', user_id: 'user-1', name: 'Papá', email: null, associated_auth_user_id: null, created_at: '' },
          repayments: [{ id: 'r-3', loan_id: 'loan-usd-1', amount_paid: 200, payment_date: '2026-02-10', notes: null, created_at: '' }],
          total_repaid: 200,
          remaining_balance: 800,
          repayment_percentage: 20,
        },
      ];

      const summary = calculateLoansSummary(mockLoans);

      // Métricas en ARS
      expect(summary.ARS.totalInitial).toBe(150000);
      expect(summary.ARS.totalRepaid).toBe(80000);
      expect(summary.ARS.remainingBalance).toBe(70000);
      expect(summary.ARS.activeCount).toBe(1);
      expect(summary.ARS.paidOffCount).toBe(1);

      // Métricas en USD
      expect(summary.USD.totalInitial).toBe(1000);
      expect(summary.USD.totalRepaid).toBe(200);
      expect(summary.USD.remainingBalance).toBe(800);
      expect(summary.USD.activeCount).toBe(1);
      expect(summary.USD.paidOffCount).toBe(0);

      // Conteo global
      expect(summary.totalLoansCount).toBe(3);
    });

    it('valida préstamo otorgado a un tercero (lent) sin fecha de devolución fija', () => {
      const res = validateLoanInput({
        lender_person_id: 'deudor-1',
        loan_type: 'lent',
        initial_amount: 80000,
        currency: 'ARS',
        loan_date: '2026-04-01',
        expected_return_date: null, // A término abierto
      });
      expect(res.isValid).toBe(true);
    });
  });
});
