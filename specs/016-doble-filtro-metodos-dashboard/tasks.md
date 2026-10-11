# Tareas: Spec 016 — Doble Filtro en Dashboard, Selección de Mes de Cuotas y Edición Integral de Compras

- [x] **Tarea 1: Modelo de Datos y Servicios**
  - [x] 1.1 Actualizar `MonthlyDueItem` en `src/lib/services/dashboard.ts` agregando `paymentMethodId` y `paymentMethodName`.
  - [x] 1.2 Mapear el método de pago en `calculateMonthlyConsolidated` para gastos fijos y cuotas de compras.
  - [x] 1.3 Ampliar `updateTransaction` en `src/lib/services/transactions.ts` para soportar `total_amount`, `installments_count`, `first_installment_date` y regenerar cuotas de ser necesario.
  - [x] 1.4 Crear pruebas unitarias en `src/lib/services/__tests__/spec016.test.ts` para `calculateMonthlyConsolidated` y `updateTransaction`.

- [x] **Tarea 2: Doble Filtro en el Dashboard (`/dashboard`)**
  - [x] 2.1 Actualizar `src/components/dashboard/MonthlyDueList.tsx` agregando el selector de método de pago y la lógica de doble filtro combinado (`tipo/estado && tarjeta`).
  - [x] 2.2 Integrar los métodos disponibles en `src/app/dashboard/page.tsx` para pasarlos a `MonthlyDueList`.

- [x] **Tarea 3: Selector Simplificado de Mes de Inicio de Cuotas**
  - [x] 3.1 Actualizar `src/components/transactions/TransactionForm.tsx` con selector de mes y año (`YYYY-MM`) para la primera cuota, eliminando la complejidad de fechas exactas y cierres.
  - [x] 3.2 Asegurar que `generateInstallmentSchedule` programe las cuotas correlativamente a partir de dicho mes.

- [x] **Tarea 4: Edición Integral de Compras (`EditTransactionModal`)**
  - [x] 4.1 Rediseñar `src/components/transactions/EditTransactionModal.tsx` con todos los campos (descripción, alternancia total/cuota, cuotas, selector de mes, tarjeta y beneficiario).
  - [x] 4.2 Conectar el modal a `updateTransaction` en `src/app/transacciones/page.tsx`.

- [x] **Tarea 5: Pruebas y Validación**
  - [x] 5.1 Ejecutar `npm test` con Vitest y validar 100% de tests pasando.
  - [x] 5.2 Ejecutar pruebas E2E con Playwright.
  - [x] 5.3 Validar compilación de producción con `npm run build`.

- [x] **Tarea 6: Despliegue y Cierre**
  - [x] 6.1 Actualizar `MEMORY.md`.
  - [x] 6.2 Commit con Conventional Commits (`feat: ...`).
  - [x] 6.3 Push a GitHub (`git push origin main`) para despliegue en Vercel.
