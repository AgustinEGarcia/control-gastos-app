# Tareas de Implementación — Spec 008: Dashboard Consolidado Mensual 360°

- [x] **Tarea 1:** Crear servicio `src/lib/services/dashboard.ts` con tipos y algoritmo puro de consolidación mensual de gastos fijos y cuotas propias vs compartidas.
- [x] **Tarea 2:** Escribir pruebas unitarias en `src/lib/services/dashboard.test.ts` con Vitest y validar ejecución limpia.
- [x] **Tarea 3:** Crear componentes UI:
  - [x] `src/components/dashboard/MonthSelector.tsx`
  - [x] `src/components/dashboard/DashboardMetricCards.tsx`
  - [x] `src/components/dashboard/MonthlyDueList.tsx`
- [x] **Tarea 4:** Construir vista de Dashboard en `src/app/dashboard/page.tsx` y conectar con `src/app/page.tsx`.
- [x] **Tarea 5:** Integrar enlace a `Dashboard` en `Navbar.tsx` y ajustar `middleware.ts`.
- [x] **Tarea 6:** Crear pruebas E2E en `e2e/dashboard.spec.ts` con Playwright.
- [x] **Tarea 7:** Ejecutar `npx.cmd tsc --noEmit`, `npm.cmd test` y `npm.cmd run test:e2e`, verificando 100% verde.
- [x] **Tarea 8:** Actualizar `MEMORY.md` (< 50 líneas) y realizar commit/push con Conventional Commits.
