# Checklist de Tareas: Spec 003

- [x] **T1. Implementar validador y cálculos matemáticos con pruebas unitarias.** Hecho cuando: `validateRecurringExpenseInput` y `calculateExpenseTotals` tienen tests con Vitest en verde.
- [x] **T2. Implementar servicio CRUD para Supabase en `src/lib/services/recurringExpenses.ts`.** Hecho cuando: Las funciones de consulta, inserción, actualización de monto real y borrado están tipadas.
- [x] **T3. Crear componentes visuales de resumen y cards de gastos.** Hecho cuando: `ExpenseSummaryCards` y `ExpenseCard` renderizan montos y diferencias con formato de moneda.
- [x] **T4. Crear modal de carga `ExpenseForm.tsx`.** Hecho cuando: Permite registrar un gasto con validaciones de categoría, día y monto.
- [x] **T5. Crear página principal `src/app/gastos-recurrentes/page.tsx` y actualizar Navbar.** Hecho cuando: El módulo está conectado en la navegación y protegido por Middleware.
- [x] **T6. Validar con suite de pruebas completa y E2E de Playwright.** Hecho cuando: `npm test` y `npm run test:e2e` pasan al 100%.
