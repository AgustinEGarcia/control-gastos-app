import { describe, it, expect } from 'vitest';
import {
  generateInstallmentSchedule,
  validateTransactionInput,
  calculateTransactionSummaries,
  type TransactionWithDetails,
} from '../transactions';

describe('generateInstallmentSchedule', () => {
  it('genera cuotas con división exacta', () => {
    const installments = generateInstallmentSchedule(120, 3, '2026-10-15');
    expect(installments).toHaveLength(3);
    expect(installments[0].amount).toBe(40);
    expect(installments[1].amount).toBe(40);
    expect(installments[2].amount).toBe(40);

    const sum = installments.reduce((acc, curr) => acc + curr.amount, 0);
    expect(sum).toBe(120);

    expect(installments[0].installment_number).toBe(1);
    expect(installments[0].due_date).toBe('2026-10-15');
    expect(installments[1].installment_number).toBe(2);
    expect(installments[1].due_date).toBe('2026-11-15');
    expect(installments[2].installment_number).toBe(3);
    expect(installments[2].due_date).toBe('2026-12-15');
  });

  it('ajusta el centavo remanente en la primera cuota para suma 100% exacta', () => {
    // 100 / 3 = 33.3333... -> 33.34 + 33.33 + 33.33 = 100.00
    const installments = generateInstallmentSchedule(100, 3, '2026-05-10');
    expect(installments).toHaveLength(3);
    expect(installments[0].amount).toBe(33.34);
    expect(installments[1].amount).toBe(33.33);
    expect(installments[2].amount).toBe(33.33);

    const sum = Number(
      installments.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)
    );
    expect(sum).toBe(100);
  });

  it('maneja 1 sola cuota correctamente', () => {
    const installments = generateInstallmentSchedule(45500.5, 1, '2026-08-01');
    expect(installments).toHaveLength(1);
    expect(installments[0].amount).toBe(45500.5);
    expect(installments[0].installment_number).toBe(1);
    expect(installments[0].due_date).toBe('2026-08-01');
  });
});

describe('validateTransactionInput', () => {
  it('valida exitosamente una transacción correcta', () => {
    const input = {
      description: 'Zapatillas Nike',
      total_amount: 150000,
      installments_count: 6,
      purchase_date: '2026-10-06',
      first_installment_date: '2026-11-10',
    };
    const result = validateTransactionInput(input);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('falla si la descripción está vacía', () => {
    const input = {
      description: '   ',
      total_amount: 1000,
      installments_count: 1,
      purchase_date: '2026-10-06',
      first_installment_date: '2026-10-06',
    };
    const result = validateTransactionInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors.description).toBe('La descripción de la compra es obligatoria.');
  });

  it('falla si el monto total es menor o igual a cero', () => {
    const input = {
      description: 'Supermercado',
      total_amount: 0,
      installments_count: 1,
      purchase_date: '2026-10-06',
      first_installment_date: '2026-10-06',
    };
    const result = validateTransactionInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors.total_amount).toBe('El monto total debe ser mayor a cero.');
  });

  it('falla si las cuotas no están entre 1 y 60', () => {
    const input = {
      description: 'Celular',
      total_amount: 500000,
      installments_count: 72,
      purchase_date: '2026-10-06',
      first_installment_date: '2026-10-06',
    };
    const result = validateTransactionInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors.installments_count).toBe('La cantidad de cuotas debe ser entre 1 y 60.');
  });
});

describe('calculateTransactionSummaries', () => {
  it('calcula totales propios vs a cobrar a terceros', () => {
    const transactions: TransactionWithDetails[] = [
      {
        id: 't1',
        user_id: 'u1',
        description: 'Compra Propia',
        total_amount: 100000,
        installments_count: 2,
        purchase_date: '2026-10-01',
        first_installment_date: '2026-10-01',
        payment_method_id: null,
        beneficiary_person_id: null, // Propia
        payer_person_id: null,
        created_at: '',
        payment_method: null,
        beneficiary: null,
        installments: [
          { id: 'i1', transaction_id: 't1', installment_number: 1, amount: 50000, due_date: '2026-10-01', is_paid: true, created_at: '' },
          { id: 'i2', transaction_id: 't1', installment_number: 2, amount: 50000, due_date: '2026-11-01', is_paid: false, created_at: '' },
        ],
      },
      {
        id: 't2',
        user_id: 'u1',
        description: 'Compra Hermano',
        total_amount: 60000,
        installments_count: 1,
        purchase_date: '2026-10-02',
        first_installment_date: '2026-10-02',
        payment_method_id: null,
        beneficiary_person_id: 'p1', // Tercero
        payer_person_id: null,
        created_at: '',
        payment_method: null,
        beneficiary: { id: 'p1', user_id: 'u1', name: 'Lucas', email: null, associated_auth_user_id: null, created_at: '' },
        installments: [
          { id: 'i3', transaction_id: 't2', installment_number: 1, amount: 60000, due_date: '2026-10-02', is_paid: false, created_at: '' },
        ],
      },
    ];

    const summaries = calculateTransactionSummaries(transactions);
    expect(summaries.totalFinanced).toBe(160000);
    expect(summaries.totalPendingOwn).toBe(50000);
    expect(summaries.totalPendingToCollect).toBe(60000);
  });
});
