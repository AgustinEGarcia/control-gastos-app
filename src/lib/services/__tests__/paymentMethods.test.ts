import { describe, it, expect } from 'vitest';
import { validatePaymentMethodInput } from '../paymentMethods';

describe('validatePaymentMethodInput', () => {
  it('valida exitosamente un método de pago propio completo', () => {
    const input = {
      name: 'Visa Santander',
      is_own: true,
      owner_name: null,
      closing_day: 20,
      due_day: 5,
    };
    const result = validatePaymentMethodInput(input);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('falla si el nombre está vacío', () => {
    const input = {
      name: '   ',
      is_own: true,
      owner_name: null,
      closing_day: 15,
      due_day: 28,
    };
    const result = validatePaymentMethodInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('El nombre del método de pago es obligatorio.');
  });

  it('falla si no es propio y no se indica el nombre del titular', () => {
    const input = {
      name: 'Mastercard BBVA',
      is_own: false,
      owner_name: '   ',
      closing_day: 10,
      due_day: 20,
    };
    const result = validatePaymentMethodInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors.owner_name).toBe('Debes indicar a quién pertenece la tarjeta.');
  });

  it('falla si el día de cierre es menor a 1 o mayor a 31', () => {
    const inputBajo = {
      name: 'Visa',
      is_own: true,
      closing_day: 0,
      due_day: 10,
    };
    const inputAlto = {
      name: 'Visa',
      is_own: true,
      closing_day: 32,
      due_day: 10,
    };
    expect(validatePaymentMethodInput(inputBajo).isValid).toBe(false);
    expect(validatePaymentMethodInput(inputBajo).errors.closing_day).toBe(
      'El día de cierre debe ser un número entre 1 y 31.'
    );
    expect(validatePaymentMethodInput(inputAlto).isValid).toBe(false);
  });

  it('falla si el día de vencimiento es menor a 1 o mayor a 31', () => {
    const input = {
      name: 'American Express',
      is_own: true,
      closing_day: 15,
      due_day: 35,
    };
    const result = validatePaymentMethodInput(input);
    expect(result.isValid).toBe(false);
    expect(result.errors.due_day).toBe(
      'El día de vencimiento debe ser un número entre 1 y 31.'
    );
  });
});
