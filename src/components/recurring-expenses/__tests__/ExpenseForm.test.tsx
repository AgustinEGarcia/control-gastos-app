import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpenseForm } from '../ExpenseForm';
import type { PaymentMethod } from '@/lib/services/paymentMethods';

describe('ExpenseForm Component', () => {
  const mockMethods: PaymentMethod[] = [
    {
      id: 'card-1',
      name: 'Visa Santander',
      is_own: true,
      owner_name: null,
      closing_day: 20,
      due_day: 5,
      user_id: 'u1',
      created_at: '2026-01-01',
    },
  ];

  it('renderiza selector de tarjeta y envía payment_method_id', async () => {
    const handleSuccess = vi.fn().mockResolvedValue(undefined);
    const handleCancel = vi.fn();

    render(
      <ExpenseForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        submitting={false}
        paymentMethods={mockMethods}
      />
    );

    // Llenar campos obligatorios
    fireEvent.change(screen.getByLabelText(/Nombre del Gasto o Servicio/i), {
      target: { value: 'Netflix Familiar' },
    });
    fireEvent.change(screen.getByLabelText(/Día de Pago/i), {
      target: { value: '15' },
    });
    fireEvent.change(screen.getByLabelText(/Monto Estimado/i), {
      target: { value: '8500' },
    });

    // Seleccionar tarjeta
    const select = screen.getByLabelText(/Tarjeta o Débito Automático/i);
    fireEvent.change(select, { target: { value: 'card-1' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Crear Gasto Fijo/i }));

    expect(handleSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Netflix Familiar',
        estimated_amount: 8500,
        payment_day: 15,
        payment_method_id: 'card-1',
      })
    );
  });
});
