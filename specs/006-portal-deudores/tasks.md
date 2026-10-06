# Tareas de Implementación — Spec 006: Portal de Deudores y Estado de Cuenta Compartido

- [x] **Tarea 1:** Crear servicio `src/lib/services/debtors.ts` con tipos, validaciones, consolidación contable de deudores y métodos de Supabase.
- [x] **Tarea 2:** Escribir pruebas unitarias en `src/lib/services/debtors.test.ts` con Vitest y validar ejecución limpia.
- [x] **Tarea 3:** Crear componentes UI:
  - [x] `src/components/debtors/DebtorSummaryCards.tsx`
  - [x] `src/components/debtors/PaymentReceivedModal.tsx`
  - [x] `src/components/debtors/DebtorCard.tsx`
- [x] **Tarea 4:** Construir panel privado de deudores en `src/app/deudores/page.tsx`.
- [x] **Tarea 5:** Construir portal público para deudores en `src/app/estado-cuenta/[id]/page.tsx`.
- [x] **Tarea 6:** Configurar navegación en `Navbar.tsx` y ajustar `middleware.ts` para proteger `/deudores` y permitir acceso público a `/estado-cuenta`.
- [x] **Tarea 7:** Crear pruebas E2E en `e2e/debtors.spec.ts` con Playwright.
- [x] **Tarea 8:** Ejecutar `npm.cmd test` y `npm.cmd run test:e2e`, verificando 100% verde.
- [x] **Tarea 9:** Actualizar `MEMORY.md` (< 50 líneas) y realizar commit/push con Conventional Commits.
