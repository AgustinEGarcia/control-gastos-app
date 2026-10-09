# Plan Técnico de Implementación — Spec 012: Control de Pagos Mensuales y Totales en Dashboard

## 1. Arquitectura de Datos y Persistencia

### 1.1 Esquema de Base de Datos (Supabase)
Para registrar los pagos de gastos fijos mes a mes sin alterar la definición recurrente del gasto:
```sql
CREATE TABLE IF NOT EXISTS monthly_expense_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    expense_id UUID REFERENCES recurring_expenses(id) ON DELETE CASCADE,
    year INT NOT NULL,
    month INT NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT true,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_monthly_expense_payment UNIQUE (user_id, expense_id, year, month)
);

ALTER TABLE monthly_expense_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin Full Access" ON monthly_expense_payments FOR ALL USING (auth.uid() = user_id);
```

### 1.2 Estrategia de Resiliencia Zero Downtime
- `src/lib/services/expensePayments.ts`:
  - Intenta consultar y persistir en Supabase `monthly_expense_payments`.
  - Si la tabla aún no existe en Supabase (código `42P01` / relación no encontrada), guarda y recupera automáticamente en `localStorage` con clave `expense_payments_${year}_${month}`.
  - Esto garantiza funcionamiento inmediato e ininterrumpido sin esperar a la consola de Supabase.
- Para cuotas:
  - Se actualiza directamente `is_paid` en la tabla existente `installments`.

---

## 2. Capa de Servicios y Cálculos (`dashboard.ts`)

- Extensión de `MonthlyDueItem`:
  - `targetId: string`: UUID del gasto fijo o de la cuota.
  - `isPaid: boolean`: estado mensual de pago.
- Extensión de `MonthlyConsolidatedSummary`:
  - `totalOwnToPay`: Total de compromisos propios del mes.
  - `paidOwnAmount`: Monto propio efectivamente abonado en el mes.
  - `pendingOwnAmount`: Monto propio pendiente de pago (`totalOwnToPay - paidOwnAmount`).
  - `totalAllCommitments`, `paidCommitmentsAmount`, `pendingCommitmentsAmount`.
  - `paidCommitmentsCount`, `totalCommitmentsCount`, `percentageCompleted`.
- Firma actualizada:
  - `calculateMonthlyConsolidated(expenses, transactions, year, month, expensePaymentsMap?: Record<string, boolean>)`

---

## 3. Capa de Interfaz de Usuario (UI)

### 3.1 `src/components/dashboard/MonthlyDueList.tsx`
- Añadir prop `onTogglePaid?: (item: MonthlyDueItem) => Promise<void> | void`.
- En cada fila de gasto/cuota:
  - Botón de acción interactivo con icono de check:
    - Si está pagado: Badge verde con checkmark (`✓ Pagado`) con opción de desmarcar.
    - Si está pendiente: Botón de marcar (`○ Marcar Pagado`) con hover verde.
  - Deshabilitación transitoria durante la mutación para evitar doble clic.

### 3.2 `src/components/dashboard/DashboardMetricCards.tsx`
- Reorganización de tarjetas de impacto para máxima claridad:
  1. 💳 **Total Gastos del Mes**: Total propio a afrontar en el mes seleccionado.
  2. 💸 **Total Ya Pagado**: Monto saldado hasta el momento (resaltado en verde esmeralda con contador de pagos).
  3. ⏳ **Total Pendiente por Pagar**: Monto restante por pagar (en ámbar si > 0, o badge verde "Al día" si es 0).
  4. 🤝 **A Cobrar a Terceros**: Cuotas compartidas y préstamos en la calle.

### 3.3 `src/app/dashboard/page.tsx`
- Carga paralela de `getMonthlyExpensePayments(supabase, selectedYear, selectedMonth)`.
- Implementación de `handleTogglePaid` con actualización optimista en el estado de React (respuesta en < 50ms) y sincronización con el backend.

---

## 4. Estrategia de Pruebas
1. **Pruebas Unitarias (Vitest)**:
   - `src/lib/services/expensePayments.test.ts`: test de guardado y lectura de pagos mensuales con fallback.
   - `src/lib/services/dashboard.test.ts`: test del cálculo de `paidOwnAmount` y `pendingOwnAmount`.
2. **Pruebas E2E (Playwright)**:
   - `e2e/monthly-payments.spec.ts`: test en el Dashboard de la presencia de las tarjetas métricas de Total, Pagado y Pendiente, y los botones interactivos de marcado de pago.
