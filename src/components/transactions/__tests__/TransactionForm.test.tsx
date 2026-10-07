import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionForm } from '../TransactionForm';
import type { PaymentMethod } from '@/lib/services/paymentMethods';

describe('TransactionForm Component — Cuotas vs Suscripciones en Tarjeta', () => {
  const mockMethods: PaymentMethod[] = [
    {
      id: 'card-1',
      name: 'Mastercard BBVA',
      is_own: true,
      owner_name: null,
      closing_day: 25,
      due_day: 10,
      user_id: 'u1',
      created_at: '2026-01-01',
    },
  ];

  it('permite cambiar a modo suscripción permanente y guardarla', async () => {
    const handleSuccessTx = vi.fn().mockResolvedValue(undefined);
    const handleSuccessRec = vi.fn().mockResolvedValue(undefined);
    const handleCreatePerson = vi.fn();
    const handleCancel = vi.fn();

    render(
      <TransactionForm
        paymentMethods={mockMethods}
        people={[]}
        onSuccess={handleSuccessTx}
        onCreateRecurringExpense={handleSuccessRec}
        onCreatePerson={handleCreatePerson}
        onCancel={handleCancel}
        submitting={false}
      />
    );

    // Cambiar a pestaña "Cargo Permanente en Tarjeta"
    const subTabButton = screen.getByRole('button', {
      name: /Cargo Permanente en Tarjeta/i,
    });
    fireEvent.click(subTabButton);

    // Verificar que cambie el título o campos
    expect(screen.getByText(/Registrar Cargo Fijo \/ Suscripción/i)).toBeInTheDocument();

    // Completar formulario de suscripción
    fireEvent.change(screen.getByLabelText(/Servicio o Suscripción/i), {
      target: { value: 'Spotify Premium' },
    });
    fireEvent.change(screen.getByLabelText(/Tarjeta donde se debita/i), {
      target: { value: 'card-1' },
    });
    fireEvent.change(screen.getByLabelText(/Monto Mensual/i), {
      target: { value: '3500' },
    });
    fireEvent.change(screen.getByLabelText(/Día de Débito/i), {
      target: { value: '8' },
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Registrar Suscripción/i }));

    expect(handleSuccessRec).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Spotify Premium',
        estimated_amount: 3500,
        payment_day: 8,
        payment_method_id: 'card-1',
        is_active: true,
      })
    );
    expect(handleSuccessTx).not.toHaveBeenCalled();
  });
});
