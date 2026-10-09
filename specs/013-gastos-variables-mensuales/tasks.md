# Tareas de Implementación — Spec 013: Gastos Variables Mensuales y Bolsa de Gastos Varios

- [x] **Tarea 1: Servicio de Gastos Variables (`variableExpenses.ts`) y Pruebas Unitarias**
  - Crear `src/lib/services/variableExpenses.ts` con funciones de lectura, guardado, cálculo de sumatorias y fallback en localStorage.
  - Crear `src/lib/services/variableExpenses.test.ts` con pruebas en Vitest.
  - Hecho cuando: `npm test src/lib/services/variableExpenses.test.ts` pase al 100%.

- [x] **Tarea 2: Consolidación en Dashboard (`dashboard.ts`) y Tests de Cálculo**
  - En `src/lib/services/dashboard.ts`, incorporar soporte para `totalVariable` y `type: 'variable'` en `MonthlyDueItem`.
  - Sumar gastos variables a `totalOwnToPay` y contemplar su estado `isPaid`.
  - Actualizar pruebas en `src/lib/services/dashboard.test.ts`.
  - Hecho cuando: Las pruebas reflejen la inclusión del gasto variable en los totales propios del mes.

- [x] **Tarea 3: Componente Modal de Gastos Variables (`VariableExpenseModal.tsx`)**
  - Crear componente modal con Glassmorphism para:
    - Ingreso de monto global directo.
    - Carga de conceptos individuales con sumatoria automática.
    - Botón de guardado rápido con feedback.
  - Hecho cuando: El usuario pueda configurar o editar la partida variable del mes desde la interfaz.

- [x] **Tarea 4: Integración en Métricas y Listado (`DashboardMetricCards.tsx`, `MonthlyDueList.tsx`, `page.tsx`)**
  - En `DashboardMetricCards.tsx`, visibilizar el desglose de Gastos Variables en la tarjeta de Total Gastos.
  - En `MonthlyDueList.tsx`, mostrar badge púrpura/violeta `Gasto Variable` con detalles de ítems y botón de toggle de pago.
  - En `src/app/dashboard/page.tsx`, integrar botón "+ Gastos Variables del Mes", carga paralela y handler de pago.
  - Hecho cuando: El gasto variable aparezca en el Dashboard y recalcule los totales en tiempo real.

- [x] **Tarea 5: Pruebas E2E y Verificación Completa del Stack**
  - Crear `e2e/variable-expenses.spec.ts` verificando la integración en el Dashboard.
  - Ejecutar `npx tsc --noEmit`, `npm test` y `npm run test:e2e`.
  - Hecho cuando: 100% de los tests pasen en verde sin regresiones.

- [x] **Tarea 6: Cierre, Esquema SQL y Commit**
  - Actualizar `docs/OPENSPEC.md` con la tabla `variable_monthly_expenses`.
  - Actualizar `MEMORY.md`.
  - Realizar commit con Conventional Commits (`feat(dashboard): implementar gastos variables mensuales y bolsa de gastos varios`).
