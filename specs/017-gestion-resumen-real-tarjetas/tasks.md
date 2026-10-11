# Tareas: Spec 017 — Gestión de Resumen Real de Tarjetas (Cuotas Salteadas, Cuotas Dobles y Devoluciones)

- [x] **Tarea 1: Lógica de Servicios y Modelo de Datos**
  - [x] 1.1 Implementar `shiftInstallmentMonth` y `updateInstallmentDueDate` en `src/lib/services/transactions.ts`.
  - [x] 1.2 Agregar helpers de soporte de devoluciones (`isRefundTransaction`, `cleanRefundDescription`) en `src/lib/services/transactions.ts`.
  - [x] 1.3 Actualizar `calculateMonthlyConsolidated` en `src/lib/services/dashboard.ts` para restar devoluciones de totales y de resúmenes por tarjeta.
  - [x] 1.4 Crear pruebas unitarias completas en `src/lib/services/__tests__/spec017.test.ts`.

- [x] **Tarea 2: Soporte de Salteo y Doble Cuota en Dashboard (`/dashboard`)**
  - [x] 2.1 Integrar acciones `⏭️ Saltear (+1 mes)` y `⏮️ -1m` en `src/components/dashboard/MonthlyDueList.tsx`.
  - [x] 2.2 Conectar las acciones a las funciones del servicio y refrescar el estado del dashboard.
  - [x] 2.3 Mostrar devoluciones con badge distintivo `🟢 Devolución` y monto negativo `-$X.XXX`.

- [x] **Tarea 3: Registro y Edición de Devoluciones en Transacciones (`/transacciones`)**
  - [x] 3.1 Agregar opción "Devolución / Reintegro a favor" en `src/components/transactions/TransactionForm.tsx`.
  - [x] 3.2 Soportar edición de tipo devolución en `src/components/transactions/EditTransactionModal.tsx`.
  - [x] 3.3 Visualización en lista/renglones con indicativo de reintegro en verde (`TransactionRow` y `TransactionCard`).

- [x] **Tarea 4: Gestión de Cuotas en Resumen**
  - [x] 4.1 Permitir desplazar cuotas hacia adelante o atrás con ajuste correlativo para cuotas cobradas juntas o salteadas.

- [x] **Tarea 5: Pruebas, Build y Despliegue**
  - [x] 5.1 Ejecutar suite de pruebas unitarias (`npm test`) y verificar 100% verde (103 tests pasados).
  - [x] 5.2 Ejecutar pruebas E2E con Playwright (28 tests pasados).
  - [x] 5.3 Validar build de producción con `npm run build` (Next.js compilado exitosamente).
  - [x] 5.4 Actualizar `MEMORY.md` y marcar tareas completadas.
  - [x] 5.5 Commit con Conventional Commits y push a producción (`origin main`).
