import { describe, expect, it, vi } from 'vitest';
import {
  calculateDebtorBalance,
  calculateDebtorsGlobalSummary,
  validatePaymentReceivedInput,
  getPublicDebtorStatement,
  calculateDebtorMonthlyInstallments,
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
          card_debt: 20000,
          direct_loans_debt: 30000,
          status: 'pending',
          transactions: [],
          payments_received: [],
        },
        {
          person: { id: 'p-2', user_id: 'u-1', name: 'Lucía', email: null, associated_auth_user_id: null, created_at: '' },
          total_debt: 40000,
          total_paid: 40000,
          remaining_balance: 0,
          card_debt: 0,
          direct_loans_debt: 0,
          status: 'paid_off',
          transactions: [],
          payments_received: [],
        },
      ];

      const summary = calculateDebtorsGlobalSummary(mockDebtors);

      expect(summary.totalOriginalDebt).toBe(120000);
      expect(summary.totalCollected).toBe(70000);
      expect(summary.totalPendingToCollect).toBe(50000);
      expect(summary.totalCardPending).toBe(20000);
      expect(summary.totalLoansPending).toBe(30000);
      expect(summary.activeDebtorsCount).toBe(1);
      expect(summary.paidOffDebtorsCount).toBe(1);
      expect(summary.totalPeopleCount).toBe(2);
    });

    it('debe calcular balance unificado sumando compras con tarjeta y préstamos directos', () => {
      const transactions = [{ total_amount: 30000 }];
      const payments = [{ amount: 10000 }];
      const directLoans = [
        { initial_amount: 50000, total_repaid: 20000, remaining_balance: 30000 },
      ];

      const balance = calculateDebtorBalance(transactions, payments, directLoans);
      expect(balance.cardDebt).toBe(20000);
      expect(balance.directLoansDebt).toBe(30000);
      expect(balance.totalDebt).toBe(80000);
      expect(balance.totalPaid).toBe(30000);
      expect(balance.remainingBalance).toBe(50000);
      expect(balance.status).toBe('pending');
    });
  });

  describe('Portal Público de Estado de Cuenta (getPublicDebtorStatement)', () => {
    it('debe obtener y procesar el estado de cuenta a través de la función RPC segura get_public_debtor_statement', async () => {
      const mockRpcResponse = {
        person: { id: 'p-123', name: 'Carlos Gómez' },
        transactions: [
          { id: 't-1', total_amount: 50000, beneficiary_person_id: 'p-123' },
        ],
        direct_loans: [
          { id: 'l-1', initial_amount: 20000, total_repaid: 0, remaining_balance: 20000 },
        ],
        payments_received: [
          { id: 'pr-1', amount: 30000, payment_date: '2026-03-01' },
        ],
      };

      const mockSupabase: any = {
        rpc: vi.fn().mockResolvedValue({
          data: mockRpcResponse,
          error: null,
        }),
      };

      const res = await getPublicDebtorStatement(mockSupabase, 'p-123');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_public_debtor_statement', {
        p_person_id: 'p-123',
      });
      expect(res).not.toBeNull();
      expect(res?.person.name).toBe('Carlos Gómez');
      expect(res?.card_debt).toBe(20000); // 50000 original - 30000 pagado = 20000 remanente
      expect(res?.direct_loans_debt).toBe(20000);
      expect(res?.total_debt).toBe(70000);
      expect(res?.total_paid).toBe(30000);
      expect(res?.remaining_balance).toBe(40000);
      expect(res?.status).toBe('pending');
    });

    it('debe retornar null cuando la persona no existe ni en RPC ni en fallback', async () => {
      const mockSupabase: any = {
        rpc: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      };

      const res = await getPublicDebtorStatement(mockSupabase, 'p-inexistente');
      expect(res).toBeNull();
    });
  });

  describe('Cronograma Mensual de Cuotas para Deudores (Spec 018)', () => {
    const mockTransactions = [
      {
        id: 'tx-1',
        description: 'Notebook Asus Ideapad',
        installments_count: 8,
        payment_method: { name: 'Visa - Macro' },
        installments: [
          { id: 'i-1', installment_number: 1, amount: 163686.48, due_date: '2026-10-10', is_paid: false },
          { id: 'i-2', installment_number: 2, amount: 163686.48, due_date: '2026-11-10', is_paid: false },
          { id: 'i-3', installment_number: 3, amount: 163686.48, due_date: '2026-12-10', is_paid: false },
        ],
      },
      {
        id: 'tx-2',
        description: 'Zapatillas Nike',
        installments_count: 2,
        payment_method: { name: 'Visa - Macro' },
        installments: [
          { id: 'i-4', installment_number: 1, amount: 27083.16, due_date: '2026-10-10', is_paid: false },
          { id: 'i-5', installment_number: 2, amount: 27083.16, due_date: '2026-11-10', is_paid: false },
        ],
      },
      {
        id: 'tx-3',
        description: 'Botines F50',
        installments_count: 1,
        payment_method: { name: 'Visa - Macro' },
        installments: [
          { id: 'i-6', installment_number: 1, amount: 14833.00, due_date: '2026-10-10', is_paid: false },
        ],
      },
    ];

    it('debe filtrar y sumar con precisión las cuotas del mes seleccionado (Octubre 2026)', () => {
      const result = calculateDebtorMonthlyInstallments(mockTransactions, 2026, 10);

      expect(result.year).toBe(2026);
      expect(result.month).toBe(10);
      expect(result.items.length).toBe(3);

      // Suma esperada: 163686.48 + 27083.16 + 14833.00 = 205602.64
      expect(result.totalAmount).toBe(205602.64);

      const notebook = result.items.find((i) => i.description === 'Notebook Asus Ideapad');
      expect(notebook).toBeDefined();
      expect(notebook?.installmentNumber).toBe(1);
      expect(notebook?.totalInstallments).toBe(8);
      expect(notebook?.amount).toBe(163686.48);
      expect(notebook?.paymentMethodName).toBe('Visa - Macro');

      const botines = result.items.find((i) => i.description === 'Botines F50');
      expect(botines).toBeDefined();
      expect(botines?.installmentNumber).toBe(1);
      expect(botines?.totalInstallments).toBe(1);
      expect(botines?.amount).toBe(14833.00);
    });

    it('debe reflejar la reducción de cuotas para el mes siguiente (Noviembre 2026)', () => {
      const result = calculateDebtorMonthlyInstallments(mockTransactions, 2026, 11);

      expect(result.year).toBe(2026);
      expect(result.month).toBe(11);
      expect(result.items.length).toBe(2);

      // Botines ya no está en noviembre. Solo Notebook (cuota 2) y Zapatillas (cuota 2)
      // 163686.48 + 27083.16 = 190769.64
      expect(result.totalAmount).toBe(190769.64);

      const notebook = result.items.find((i) => i.description === 'Notebook Asus Ideapad');
      expect(notebook?.installmentNumber).toBe(2);
    });

    it('debe devolver items vacíos y total 0 cuando no hay cuotas en el mes (Enero 2028)', () => {
      const result = calculateDebtorMonthlyInstallments(mockTransactions, 2028, 1);

      expect(result.items.length).toBe(0);
      expect(result.totalAmount).toBe(0);
    });
  });
});


