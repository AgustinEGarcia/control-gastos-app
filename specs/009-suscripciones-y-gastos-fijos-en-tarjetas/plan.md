# Plan de Implementación — Spec 009: Suscripciones y Gastos Fijos en Tarjetas

## 1. Arquitectura y Esquema de Datos
- **Base de Datos & Tipos:**
  - Agregar columna `payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL` en `recurring_expenses`.
  - Actualizar `docs/OPENSPEC.md` con la sentencia `ALTER TABLE` y el script unificado.
  - Actualizar `src/types/database.types.ts` en `recurring_expenses.Row`, `Insert` y `Update`.
- **Capa de Servicios:**
  - `src/lib/services/recurringExpenses.ts`:
    - Ampliar `RecurringExpense` e interfaces con `payment_method_id: string | null`.
    - Definir `RecurringExpenseWithMethod` incluyendo `payment_method: PaymentMethod | null`.
    - En `getRecurringExpenses`, incluir `payment_methods` con fallback seguro en memoria.
    - Actualizar `createRecurringExpense` y `updateRecurringExpense` para persistir `payment_method_id`.
  - `src/lib/services/dashboard.ts`:
    - Actualizar `calculateMonthlyConsolidated` para incluir en `details` la tarjeta asociada al gasto fijo si existe.
- **Capa de Interfaz de Usuario:**
  - `src/components/recurring-expenses/ExpenseForm.tsx`:
    - Dropdown para seleccionar "Método de Pago / Tarjeta de Débito Automático" (opcional).
  - `src/components/recurring-expenses/ExpenseCard.tsx`:
    - Mostrar badge con el nombre de la tarjeta asociada (ej. `💳 Visa Santander`).
  - `src/components/transactions/TransactionForm.tsx`:
    - Agregar selector de tipo: `[ Compra en Cuotas ]` / `[ Suscripción Permanente en Tarjeta ]`.
    - Si se selecciona "Suscripción Permanente", cambia el input a "Monto mensual estimado" y día de cobro/cierre, guardándolo en `recurring_expenses` con la tarjeta seleccionada.
  - `src/components/payment-methods/PaymentMethodCard.tsx`:
    - Mostrar conteo y suma de suscripciones automáticas activas debitadas en esa tarjeta.

## 2. Estrategia de Testing (Vitest & Playwright)
- **Unit Testing con Vitest:**
  - Validar asignación de `payment_method_id` en creación y actualización de gastos fijos.
  - Validar cálculo consolidado de gastos fijos asociados a tarjetas en el dashboard.
- **End-to-End con Playwright:**
  - Validar que el formulario de gastos fijos muestre el selector de método de pago.
  - Validar que el formulario de compras permita alternar a suscripción permanente.
