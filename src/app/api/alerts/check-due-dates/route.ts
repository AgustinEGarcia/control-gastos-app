import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRecurringExpenses } from '@/lib/services/recurringExpenses';
import { getTransactions } from '@/lib/services/transactions';
import { consolidateAlerts, sendDueAlertsEmail } from '@/lib/services/alerts';

export async function GET(request: NextRequest) {
  return handleCheckDueDates(request);
}

export async function POST(request: NextRequest) {
  return handleCheckDueDates(request);
}

async function handleCheckDueDates(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : null;

  // 1. Verificación de Seguridad Zero Trust
  let isAuthorized = false;
  let userEmail: string | null = null;

  // Opción A: Cron Secret configurado y válido
  if (cronSecret && bearerToken === cronSecret) {
    isAuthorized = true;
  }

  // Opción B: Usuario con sesión activa de Supabase
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    isAuthorized = true;
    userEmail = user.email || null;
  }

  if (!isAuthorized) {
    return NextResponse.json(
      {
        error: 'No autorizado. Se requiere token Bearer CRON_SECRET o sesión activa.',
      },
      { status: 401 }
    );
  }

  try {
    // 2. Obtener gastos fijos y compras
    const [expenses, transactions] = await Promise.all([
      getRecurringExpenses(supabase),
      getTransactions(supabase),
    ]);

    // 3. Consolidar vencimientos preventivos (24 horas)
    const summary = consolidateAlerts(expenses, transactions);
    const targetEmail = userEmail || process.env.ALERT_EMAIL_FROM || 'admin@control-gastos.com';

    // 4. Si hay vencimientos para mañana (o para hoy), despachar alerta
    const itemsToNotify = [...summary.dueTomorrow, ...summary.dueToday];
    let sendResult = null;

    if (itemsToNotify.length > 0) {
      sendResult = await sendDueAlertsEmail(targetEmail, itemsToNotify);
    }

    return NextResponse.json({
      success: true,
      message: `Evaluación de vencimientos finalizada con éxito.`,
      targetEmail,
      itemsToNotifyCount: itemsToNotify.length,
      dueTomorrowCount: summary.dueTomorrow.length,
      dueTodayCount: summary.dueToday.length,
      totalAmountTomorrow: summary.totalAmountTomorrow,
      sendResult,
      items: itemsToNotify,
    });
  } catch (err: any) {
    console.error('Error en check-due-dates:', err);
    return NextResponse.json(
      {
        error: 'Error interno al procesar los vencimientos preventivos.',
        details: err.message,
      },
      { status: 500 }
    );
  }
}
