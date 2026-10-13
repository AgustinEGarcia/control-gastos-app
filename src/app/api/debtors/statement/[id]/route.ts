import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { getPublicDebtorStatement } from '@/lib/services/debtors';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID de persona no provisto.' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const statement = await getPublicDebtorStatement(supabase, id);

    if (!statement) {
      return NextResponse.json(
        { error: 'No se encontró el estado de cuenta solicitado o el enlace no es válido.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ statement });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al consultar estado de cuenta.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
