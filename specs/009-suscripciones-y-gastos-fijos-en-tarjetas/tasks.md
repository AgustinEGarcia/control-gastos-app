# Tareas de Implementación — Spec 009: Suscripciones y Gastos Fijos en Tarjetas

- [x] **Tarea 1:** Actualizar esquema y tipos en `docs/OPENSPEC.md` y `src/types/database.types.ts` incorporando `payment_method_id` a `recurring_expenses`.
- [x] **Tarea 2:** Actualizar servicio `src/lib/services/recurringExpenses.ts` con tipado `RecurringExpenseWithMethod`, métodos CRUD extendidos y fallback seguro.
- [x] **Tarea 3:** Actualizar pruebas unitarias en `src/lib/services/__tests__/recurringExpenses.test.ts` y validar ejecución con Vitest.
- [x] **Tarea 4:** Actualizar `ExpenseForm.tsx` y `ExpenseCard.tsx` para permitir seleccionar y mostrar la tarjeta de débito automático.
- [x] **Tarea 5:** Actualizar `TransactionForm.tsx` en `/transacciones` para permitir registrar compras en cuotas o suscripciones permanentes en tarjeta.
- [x] **Tarea 6:** Actualizar `src/lib/services/dashboard.ts` y tarjetas de métodos de pago para computar suscripciones permanentes.
- [x] **Tarea 7:** Crear pruebas de componentes y E2E en Playwright y Vitest con cobertura completa.
- [x] **Tarea 8:** Ejecutar `npx.cmd tsc --noEmit`, `npm.cmd test` y `npm.cmd run test:e2e`, verificando 100% verde (60 unitarios, 17 E2E).
- [x] **Tarea 9:** Actualizar `MEMORY.md` (< 50 líneas) y realizar commit/push con Conventional Commits.
