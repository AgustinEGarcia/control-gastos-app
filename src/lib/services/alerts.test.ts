import { describe, expect, it } from 'vitest';
import {
  findUpcomingExpenses,
  findUpcomingInstallments,
  consolidateAlerts,
  generateAlertsEmailHtml,
  sendDueAlertsEmail,
  type DueAlertItem,
} from './alerts';
import type { RecurringExpense } from './recurringExpenses';
import type { TransactionWithDetails } from './transactions';

describe('Servicio de Alertas Preventivas por Email (Spec 007)', () => {
  const baseDate = new Date(2026, 2, 10); // 10 de Marzo de 2026

  describe('Detección de Gastos Fijos (findUpcomingExpenses)', () => {
    it('debe detectar un gasto activo que vence mañana (día 11)', () => {
      const expenses: RecurringExpense[] = [
        {
          id: 'exp-1',
          user_id: 'u-1',
          name: 'Internet Fibra Óptica',
          category: 'Servicios',
          estimated_amount: 15000,
          actual_amount: 16500,
          payment_day: 11, // Mañana
          payment_method_id: null,
          is_active: true,
          created_at: '',
        },
      ];

      const alerts = findUpcomingExpenses(expenses, baseDate);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].title).toBe('Internet Fibra Óptica');
      expect(alerts[0].amount).toBe(16500);
      expect(alerts[0].daysUntilDue).toBe(1);
    });

    it('debe ignorar gastos fijos inactivos/pausados', () => {
      const expenses: RecurringExpense[] = [
        {
          id: 'exp-2',
          user_id: 'u-1',
          name: 'Gimnasio',
          category: 'Salud',
          estimated_amount: 20000,
          actual_amount: null,
          payment_day: 11,
          payment_method_id: null,
          is_active: false, // Pausado
          created_at: '',
        },
      ];

      const alerts = findUpcomingExpenses(expenses, baseDate);
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Detección de Cuotas en Tarjetas (findUpcomingInstallments)', () => {
    it('debe detectar cuotas impagas que vencen en las próximas 24h', () => {
      const transactions: TransactionWithDetails[] = [
        {
          id: 'tx-1',
          user_id: 'u-1',
          description: 'Lavarropas Samsung',
          total_amount: 120000,
          installments_count: 6,
          purchase_date: '2026-01-10',
          first_installment_date: '2026-02-11',
          payment_method_id: 'pm-1',
          beneficiary_person_id: null,
          payer_person_id: null,
          created_at: '',
          payment_method: {
            id: 'pm-1',
            user_id: 'u-1',
            name: 'Visa Santander',
            is_own: true,
            owner_name: null,
            closing_day: 25,
            due_day: 11,
            created_at: '',
          },
          beneficiary: null,
          installments: [
            {
              id: 'inst-1',
              transaction_id: 'tx-1',
              installment_number: 2,
              amount: 20000,
              due_date: '2026-03-11', // Mañana
              is_paid: false,
              created_at: '',
            },
          ],
        },
      ];

      const alerts = findUpcomingInstallments(transactions, baseDate);
      expect(alerts).toHaveLength(1);
      expect(alerts[0].title).toContain('Lavarropas Samsung');
      expect(alerts[0].daysUntilDue).toBe(1);
      expect(alerts[0].amount).toBe(20000);
    });

    it('debe ignorar cuotas que ya han sido pagadas', () => {
      const transactions: TransactionWithDetails[] = [
        {
          id: 'tx-1',
          user_id: 'u-1',
          description: 'Lavarropas Samsung',
          total_amount: 120000,
          installments_count: 6,
          purchase_date: '2026-01-10',
          first_installment_date: '2026-02-11',
          payment_method_id: null,
          beneficiary_person_id: null,
          payer_person_id: null,
          created_at: '',
          payment_method: null,
          beneficiary: null,
          installments: [
            {
              id: 'inst-1',
              transaction_id: 'tx-1',
              installment_number: 2,
              amount: 20000,
              due_date: '2026-03-11',
              is_paid: true, // Ya pagada
              created_at: '',
            },
          ],
        },
      ];

      const alerts = findUpcomingInstallments(transactions, baseDate);
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Consolidación de Alertas (consolidateAlerts)', () => {
    it('debe calcular la suma de vencimientos a 24 horas y agrupar por urgencia', () => {
      const expenses: RecurringExpense[] = [
        {
          id: 'exp-1',
          user_id: 'u-1',
          name: 'Alquiler',
          category: 'Vivienda',
          estimated_amount: 200000,
          actual_amount: 200000,
          payment_day: 11, // Mañana
          payment_method_id: null,
          is_active: true,
          created_at: '',
        },
      ];

      const transactions: TransactionWithDetails[] = [
        {
          id: 'tx-1',
          user_id: 'u-1',
          description: 'Notebook Lenovo',
          total_amount: 300000,
          installments_count: 3,
          purchase_date: '2026-01-01',
          first_installment_date: '2026-02-11',
          payment_method_id: null,
          beneficiary_person_id: null,
          payer_person_id: null,
          created_at: '',
          payment_method: null,
          beneficiary: null,
          installments: [
            {
              id: 'inst-1',
              transaction_id: 'tx-1',
              installment_number: 2,
              amount: 100000,
              due_date: '2026-03-11', // Mañana
              is_paid: false,
              created_at: '',
            },
          ],
        },
      ];

      const summary = consolidateAlerts(expenses, transactions, baseDate);
      expect(summary.dueTomorrow).toHaveLength(2);
      expect(summary.totalAmountTomorrow).toBe(300000);
    });
  });

  describe('Plantilla HTML y Fallback Seguro de Resend', () => {
    it('debe generar HTML responsive con formato de montos y correo del usuario', () => {
      const items: DueAlertItem[] = [
        {
          id: '1',
          title: 'Seguro Automotor',
          type: 'recurring',
          amount: 35000,
          dueDate: '2026-03-11',
          daysUntilDue: 1,
          categoryOrDetails: 'Vehículo',
        },
      ];

      const html = generateAlertsEmailHtml(items, 'usuario@ejemplo.com');
      expect(html).toContain('Seguro Automotor');
      expect(html).toContain('usuario@ejemplo.com');
      expect(html).toContain('Control Financiero 360°');
    });

    it('debe ejecutar modo simulado sin error cuando falta la API Key de Resend', async () => {
      delete process.env.RESEND_API_KEY;

      const items: DueAlertItem[] = [
        {
          id: '1',
          title: 'Gasto Demo',
          type: 'recurring',
          amount: 5000,
          dueDate: '2026-03-11',
          daysUntilDue: 1,
        },
      ];

      const result = await sendDueAlertsEmail('demo@test.com', items);
      expect(result.success).toBe(true);
      expect(result.simulated).toBe(true);
    });
  });
});
