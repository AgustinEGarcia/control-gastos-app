# Tareas de Implementación — Spec 012: Control de Pagos Mensuales y Totales en Dashboard

- [x] **Tarea 1: Servicio de Pagos Mensuales de Gastos (`expensePayments.ts`) y Pruebas Unitarias**
  - Crear `src/lib/services/expensePayments.ts` con funciones `getMonthlyExpensePayments`, `toggleExpenseMonthlyPayment` y `updateInstallmentPaidStatus` con resiliencia y fallback en localStorage.
  - Crear `src/lib/services/expensePayments.test.ts` con pruebas unitarias en Vitest.
  - Hecho cuando: `npm test src/lib/services/expensePayments.test.ts` pase al 100%.

- [x] **Tarea 2: Lógica de Consolidación y Métricas de Pago (`dashboard.ts`)**
  - En `src/lib/services/dashboard.ts`, integrar `targetId` en `MonthlyDueItem`.
  - Recibir `expensePaymentsMap` y calcular `paidOwnAmount` y `pendingOwnAmount`.
  - Actualizar pruebas en `src/lib/services/dashboard.test.ts`.
  - Hecho cuando: Los cálculos de total, pagado y pendiente pasen al 100% en los tests.

- [x] **Tarea 3: Componente de Métricas (`DashboardMetricCards.tsx`)**
  - Actualizar las tarjetas métricas para mostrar claramente:
    - Total de Gastos Propios del Mes.
    - Total Ya Pagado (resaltado en verde esmeralda con número de pagos).
    - Total Pendiente por Pagar (resaltado en ámbar/naranja si hay saldo por pagar).
    - Total a Cobrar a Terceros.
  - Hecho cuando: El componente renderice los tres indicadores de gasto más las cuentas por cobrar.

- [x] **Tarea 4: Lista Interactiva de Vencimientos (`MonthlyDueList.tsx`) y Vista Dashboard (`page.tsx`)**
  - En `MonthlyDueList.tsx`, añadir botón/toggle de alternancia de pago para cada ítem.
  - En `src/app/dashboard/page.tsx`, integrar carga de pagos mensuales y actualización optimista instantánea al hacer clic en pagar/desmarcar.
  - Hecho cuando: El usuario pueda marcar o desmarcar cualquier gasto o cuota y ver los totales actualizarse al instante.

- [x] **Tarea 5: Pruebas E2E y Verificación Completa del Stack**
  - Crear `e2e/monthly-payments.spec.ts` para verificar la presencia de las métricas y la interacción de pago en el Dashboard.
  - Ejecutar `npx tsc --noEmit`, `npm test` y `npm run test:e2e` para garantizar 0 regresiones.
  - Hecho cuando: Todos los tests pasen al 100% en verde.

- [x] **Tarea 6: Cierre, Esquema SQL y Commit**
  - Actualizar `docs/OPENSPEC.md` con el script de la tabla `monthly_expense_payments`.
  - Actualizar `MEMORY.md`.
  - Realizar commit con Conventional Commits (`feat(dashboard): implementar control de pagos mensuales y metricas consolidadas`).
