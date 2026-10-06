import { describe, it, expect } from 'vitest';
import {
  validateRecurringExpenseInput,
  calculateExpenseTotals,
  type RecurringExpense,
} from '../recurringExpenses';

describe('validateRecurringExpenseInput', () => {
  it('valida exitosamente un gasto con datos correctos', () => {
    const input = {
      name: 'Alquiler Departamento',
      category: 'Vivienda',
      estimated_amount: 350000,
      actual_amount: 350000,
      payment_day: 10,
    };
    const result = validateRecurringExpenseInput(input);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('falla si el nombre está vacío', () => {
    const input = {
      name: '   ',
      estimated_amount: 10000,
      payment_day: 5,
    };
    const result = validateRecurringExpenseInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('El nombre del gasto es obligatorio.');
  });

  it('falla si el monto estimado es menor o igual a cero', () => {
    const inputZero = {
      name: 'Internet',
      estimated_amount: 0,
      payment_day: 15,
    };
    const inputNeg = {
      name: 'Internet',
      estimated_amount: -500,
      payment_day: 15,
    };
    expect(validateRecurringExpenseInput(inputZero).isValid).toBe(false);
    expect(validateRecurringExpenseInput(inputNeg).isValid).toBe(false);
    expect(validateRecurringExpenseInput(inputZero).errors.estimated_amount).toBe(
      'El monto estimado debe ser un número mayor a cero.'
    );
  });

  it('falla si el día de pago no está entre 1 y 31', () => {
    const inputLow = {
      name: 'Luz',
      estimated_amount: 25000,
      payment_day: 0,
    };
    const inputHigh = {
      name: 'Luz',
      estimated_amount: 25000,
      payment_day: 32,
    };
    expect(validateRecurringExpenseInput(inputLow).isValid).toBe(false);
    expect(validateRecurringExpenseInput(inputHigh).isValid).toBe(false);
    expect(validateRecurringExpenseInput(inputLow).errors.payment_day).toBe(
      'El día de pago debe ser un número entero entre 1 y 31.'
    );
  });

  it('falla si el monto real es negativo', () => {
    const input = {
      name: 'Gas',
      estimated_amount: 5000,
      actual_amount: -100,
      payment_day: 20,
    };
    const result = validateRecurringExpenseInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors.actual_amount).toBe(
      'El monto real no puede ser un número negativo.'
    );
  });
});

describe('calculateExpenseTotals', () => {
  it('retorna ceros si la lista está vacía', () => {
    const totals = calculateExpenseTotals([]);
    expect(totals.totalEstimated).toBe(0);
    expect(totals.totalActual).toBe(0);
    expect(totals.difference).toBe(0);
    expect(totals.countActive).toBe(0);
  });

  it('calcula totales y diferencias considerando solo gastos activos', () => {
    const expenses: RecurringExpense[] = [
      {
        id: '1',
        user_id: 'u1',
        name: 'Alquiler',
        category: 'Vivienda',
        estimated_amount: 200000,
        actual_amount: 220000, // +20.000
        payment_day: 5,
        is_active: true,
        created_at: '',
      },
      {
        id: '2',
        user_id: 'u1',
        name: 'Internet',
        category: 'Servicios',
        estimated_amount: 25000,
        actual_amount: 23000, // -2.000
        payment_day: 10,
        is_active: true,
        created_at: '',
      },
      {
        id: '3',
        user_id: 'u1',
        name: 'Gimnasio',
        category: 'Salud',
        estimated_amount: 15000,
        actual_amount: 15000,
        payment_day: 1,
        is_active: false, // Inactivo, debe ignorarse en los totales activos
        created_at: '',
      },
      {
        id: '4',
        user_id: 'u1',
        name: 'Seguro',
        category: 'Seguros',
        estimated_amount: 30000,
        actual_amount: null, // Sin factura aún, toma estimado
        payment_day: 15,
        is_active: true,
        created_at: '',
      },
    ];

    const totals = calculateExpenseTotals(expenses);
    // Activos: Alquiler (200k), Internet (25k), Seguro (30k) -> Estimado = 255.000
    expect(totals.totalEstimated).toBe(255000);
    // Real: Alquiler (220k), Internet (23k), Seguro (30k por fallback) -> Real = 273.000
    expect(totals.totalActual).toBe(273000);
    // Diferencia: 273.000 - 255.000 = +18.000
    expect(totals.difference).toBe(18000);
    expect(totals.countActive).toBe(3);
  });
});
