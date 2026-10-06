# Plan Técnico: Spec 003 — Gastos Fijos Recurrentes

## 1. Capa de Servicios y Lógica Pura
- `src/lib/services/recurringExpenses.ts`:
  - `validateRecurringExpenseInput(input)`: Función pura con validaciones de nombre, montos positivos y días 1-31.
  - `calculateExpenseTotals(expenses)`: Función pura que retorna `{ totalEstimated, totalActual, difference, countActive }`.
  - Métodos Supabase:
    - `getRecurringExpenses(supabase)`
    - `createRecurringExpense(supabase, input, userId)`
    - `updateRecurringExpense(supabase, id, input)`
    - `toggleExpenseStatus(supabase, id, isActive)`
    - `deleteRecurringExpense(supabase, id)`

## 2. Componentes de Interfaz
- `src/components/recurring-expenses/ExpenseSummaryCards.tsx`: 3 cards de métricas (Total Estimado, Total Facturado Real, Diferencia presupuestaria con badge dinámico).
- `src/components/recurring-expenses/ExpenseCard.tsx`: Fila o card de gasto con categoría, día de pago, monto estimado, input de monto real editable y switch de activo/pausa.
- `src/components/recurring-expenses/ExpenseForm.tsx`: Modal para crear/editar con selector de categoría (Vivienda, Servicios, Seguros, Suscripciones, Educación, Salud, Transporte, Otros).

## 3. Página y Navegación
- `src/app/gastos-recurrentes/page.tsx`: Vista principal con filtros por categoría, búsqueda y totales reactivos.
- Actualización de `src/components/layout/Navbar.tsx`: Enlace activo a "Gastos Fijos".
- Actualización de `src/middleware.ts`: Proteger la ruta `/gastos-recurrentes`.

## 4. Estrategia de Pruebas
- **Vitest:** `src/lib/services/__tests__/recurringExpenses.test.ts` evaluando validaciones de entrada y cálculos agregados de totales y diferencias.
- **Playwright:** `e2e/recurring-expenses.spec.ts` validando la navegación a la vista de gastos recurrentes.
