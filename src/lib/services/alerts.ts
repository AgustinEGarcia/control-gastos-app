import { Resend } from 'resend';
import type { RecurringExpense } from './recurringExpenses';
import type { Installment, TransactionWithDetails } from './transactions';

export interface DueAlertItem {
  id: string;
  title: string;
  type: 'recurring' | 'installment';
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  categoryOrDetails?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  simulated: boolean;
  error?: string;
}

export interface AlertsSummary {
  dueTomorrow: DueAlertItem[];
  dueToday: DueAlertItem[];
  dueNext7Days: DueAlertItem[];
  totalAmountTomorrow: number;
}

export function formatMoney(val: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(val);
}

export function findUpcomingExpenses(
  expenses: RecurringExpense[],
  referenceDate: Date = new Date()
): DueAlertItem[] {
  const items: DueAlertItem[] = [];
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth(); // 0-11
  const refDay = referenceDate.getDate();

  // Medianoche de la fecha de referencia para cálculos de días exactos
  const refMidnight = new Date(refYear, refMonth, refDay);

  for (const exp of expenses) {
    if (!exp.is_active) continue;

    // Calcular la fecha de pago para el mes actual
    const daysInCurrentMonth = new Date(refYear, refMonth + 1, 0).getDate();
    const effectiveDay = Math.min(exp.payment_day, daysInCurrentMonth);

    let targetDate = new Date(refYear, refMonth, effectiveDay);

    // Si ya pasó en este mes, evaluar el mes siguiente
    if (targetDate.getTime() < refMidnight.getTime()) {
      const nextMonthYear = refMonth === 11 ? refYear + 1 : refYear;
      const nextMonth = (refMonth + 1) % 12;
      const daysInNextMonth = new Date(nextMonthYear, nextMonth + 1, 0).getDate();
      const nextEffectiveDay = Math.min(exp.payment_day, daysInNextMonth);
      targetDate = new Date(nextMonthYear, nextMonth, nextEffectiveDay);
    }

    const diffMs = targetDate.getTime() - refMidnight.getTime();
    const daysUntilDue = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // Solo incluir vencimientos de los próximos 7 días
    if (daysUntilDue >= 0 && daysUntilDue <= 7) {
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      items.push({
        id: `exp-${exp.id}`,
        title: exp.name,
        type: 'recurring',
        amount: Number(exp.actual_amount ?? exp.estimated_amount),
        dueDate: formattedDate,
        daysUntilDue,
        categoryOrDetails: exp.category || 'Gasto Fijo',
      });
    }
  }

  return items;
}

export function findUpcomingInstallments(
  transactions: TransactionWithDetails[],
  referenceDate: Date = new Date()
): DueAlertItem[] {
  const items: DueAlertItem[] = [];
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDay = referenceDate.getDate();
  const refMidnight = new Date(refYear, refMonth, refDay);

  for (const tx of transactions) {
    for (const inst of tx.installments || []) {
      if (inst.is_paid) continue;

      const [y, m, d] = inst.due_date.split('-').map(Number);
      const instDate = new Date(y, m - 1, d);

      const diffMs = instDate.getTime() - refMidnight.getTime();
      const daysUntilDue = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (daysUntilDue >= 0 && daysUntilDue <= 7) {
        items.push({
          id: `inst-${inst.id}`,
          title: `${tx.description} (Cuota ${inst.installment_number}/${tx.installments_count})`,
          type: 'installment',
          amount: Number(inst.amount),
          dueDate: inst.due_date,
          daysUntilDue,
          categoryOrDetails: tx.payment_method?.name || 'Tarjeta / Financiamiento',
        });
      }
    }
  }

  return items;
}

export function consolidateAlerts(
  expenses: RecurringExpense[],
  transactions: TransactionWithDetails[],
  referenceDate: Date = new Date()
): AlertsSummary {
  const expenseAlerts = findUpcomingExpenses(expenses, referenceDate);
  const installmentAlerts = findUpcomingInstallments(transactions, referenceDate);

  const allAlerts = [...expenseAlerts, ...installmentAlerts].sort(
    (a, b) => a.daysUntilDue - b.daysUntilDue
  );

  const dueToday = allAlerts.filter((i) => i.daysUntilDue === 0);
  const dueTomorrow = allAlerts.filter((i) => i.daysUntilDue === 1);
  const totalAmountTomorrow = dueTomorrow.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    dueToday,
    dueTomorrow,
    dueNext7Days: allAlerts,
    totalAmountTomorrow: Number(totalAmountTomorrow.toFixed(2)),
  };
}

export function generateAlertsEmailHtml(
  items: DueAlertItem[],
  recipientEmail: string
): string {
  const rows = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #27272a;">
        <td style="padding: 12px 8px; color: #f4f4f5; font-size: 14px;">
          <strong>${item.title}</strong><br/>
          <span style="font-size: 12px; color: #a1a1aa;">${item.categoryOrDetails}</span>
        </td>
        <td style="padding: 12px 8px; text-align: center; color: ${
          item.daysUntilDue === 0 ? '#ef4444' : '#f59e0b'
        }; font-size: 13px; font-weight: bold;">
          ${item.daysUntilDue === 0 ? 'Vence HOY' : 'Vence MAÑANA (24h)'}
        </td>
        <td style="padding: 12px 8px; text-align: right; color: #10b981; font-size: 15px; font-weight: bold;">
          ${formatMoney(item.amount)}
        </td>
      </tr>
    `
    )
    .join('');

  const total = items.reduce((acc, curr) => acc + curr.amount, 0);

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Alerta Preventiva de Vencimientos</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 24px 12px; margin: 0;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="background-color: #27272a; padding: 20px 24px; border-bottom: 1px solid #3f3f46;">
          <h1 style="margin: 0; font-size: 18px; color: #f4f4f5; font-weight: 700;">
            🔔 Control Financiero 360° — Alerta Preventiva
          </h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #a1a1aa;">
            Vencimientos programados en las próximas 24 horas
          </p>
        </div>
        
        <div style="padding: 24px;">
          <p style="font-size: 14px; color: #d4d4d8; margin-top: 0;">
            Hola, te recordamos que tienes <strong>${items.length} pago(s)</strong> previstos para vencer en breve:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="border-bottom: 2px solid #3f3f46;">
                <th style="padding: 8px; text-align: left; font-size: 12px; color: #a1a1aa; text-transform: uppercase;">Concepto</th>
                <th style="padding: 8px; text-align: center; font-size: 12px; color: #a1a1aa; text-transform: uppercase;">Plazo</th>
                <th style="padding: 8px; text-align: right; font-size: 12px; color: #a1a1aa; text-transform: uppercase;">Importe</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 14px 8px; text-align: right; font-weight: bold; color: #f4f4f5; font-size: 14px;">Total a abonar:</td>
                <td style="padding: 14px 8px; text-align: right; font-weight: bold; color: #34d399; font-size: 16px;">${formatMoney(total)}</td>
              </tr>
            </tfoot>
          </table>

          <div style="text-align: center; margin-top: 28px; margin-bottom: 12px;">
            <a href="http://localhost:3000" style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
              Abrir Panel Financiero
            </a>
          </div>
        </div>

        <div style="background-color: #121215; padding: 14px 24px; border-top: 1px solid #27272a; text-align: center; font-size: 11px; color: #71717a;">
          Notificación preventiva automática enviada a ${recipientEmail}. Costo de infraestructura $0.
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendDueAlertsEmail(
  recipientEmail: string,
  items: DueAlertItem[]
): Promise<SendEmailResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ALERT_EMAIL_FROM || 'Control Financiero <onboarding@resend.dev>';

  if (items.length === 0) {
    return {
      success: true,
      simulated: true,
      messageId: 'no-items-due',
    };
  }

  // Fallback simulado si no hay API key configurada
  if (!apiKey || apiKey.trim() === '') {
    console.log(
      `[SIMULACIÓN RESEND] Enviando alerta a ${recipientEmail} con ${items.length} vencimientos. Clave de API no provista.`
    );
    return {
      success: true,
      simulated: true,
      messageId: `simulated-${Date.now()}`,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const html = generateAlertsEmailHtml(items, recipientEmail);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [recipientEmail],
      subject: `🔔 Alerta Preventiva: ${items.length} pago(s) vencen en las próximas 24h`,
      html,
    });

    if (error) {
      console.error('[RESEND ERROR]', error);
      return {
        success: false,
        simulated: false,
        error: error.message,
      };
    }

    return {
      success: true,
      simulated: false,
      messageId: data?.id,
    };
  } catch (err: any) {
    console.error('[RESEND EXCEPTION]', err);
    return {
      success: false,
      simulated: false,
      error: err.message || 'Error desconocido al despachar correo.',
    };
  }
}
