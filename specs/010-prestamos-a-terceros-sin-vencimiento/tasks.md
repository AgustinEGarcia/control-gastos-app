# Tareas de Implementación — Spec 010: Préstamos de Dinero a Terceros sin Vencimiento

- [x] **Tarea 1: Esquema de BD y Tipos TypeScript**
  - Actualizar `docs/OPENSPEC.md` con las columnas `loan_type` y `expected_return_date` en `personal_loans`.
  - Actualizar `src/types/database.types.ts` con los nuevos campos en `Row`, `Insert` y `Update` de `personal_loans`.

- [x] **Tarea 2: Servicio de Préstamos (`loans.ts`) y Pruebas Unitarias**
  - En `src/lib/services/loans.ts`, extender interfaz `PersonalLoan` e input `PersonalLoanInput`.
  - Adaptar `createPersonalLoan` y `getPersonalLoans` con filtro por tipo (`borrowed` | `lent`).
  - Actualizar pruebas unitarias en `src/lib/services/loans.test.ts`.

- [x] **Tarea 3: Servicio de Deudores (`debtors.ts`) y Consolidación Global**
  - En `src/lib/services/debtors.ts`, unificar la deuda total por persona sumando cuotas de tarjeta + dinero directo prestado pendiente (`loan_type = 'lent'`).
  - Actualizar `debtors.test.ts` con cobertura del saldo combinado.

- [x] **Tarea 4: Interfaz de Préstamos (`/prestamos`) y Formulario**
  - En `src/components/loans/LoanForm.tsx`, añadir selector "Tipo de préstamo" (Me prestaron / Presté dinero) y checkbox "Sin fecha de devolución fija".
  - En `src/app/prestamos/page.tsx`, añadir pestañas para alternar entre "Deudas Propias" y "Dinero Prestado (Por cobrar)".

- [x] **Tarea 5: Interfaz de Deudores y Estado de Cuenta Público**
  - En `src/components/debtors/DebtorCard.tsx`, mostrar badge y desglose discriminado (Cuotas de Tarjeta vs Dinero Prestado).
  - En `src/app/estado-cuenta/[id]/page.tsx`, renderizar sección de préstamos directos y pagos recibidos.

- [x] **Tarea 6: Integración en Dashboard (`/dashboard`)**
  - En `src/lib/services/dashboard.ts` y componentes del dashboard, visibilizar el capital total pendiente de cobro.

- [x] **Tarea 7: Verificación Total (Vitest + Playwright)**
  - Ejecutar `npx tsc --noEmit`, `npm test` y `npm run test:e2e`, asegurando 100% verde.

- [x] **Tarea 8: Cierre y Versión**
  - Actualizar `MEMORY.md` (< 50 líneas), generar comando SQL para Supabase, y realizar commit/push con Conventional Commits.
