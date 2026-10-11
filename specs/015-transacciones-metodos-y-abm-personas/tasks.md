# Tareas: Spec 015 — Vista de Lista en Transacciones, Filtro por Métodos, Totales en Dashboard y ABM de Personas

- [x] **Tarea 1: Lógica de Servicios y Pruebas Unitarias**
  - [x] 1.1 Agregar función `updatePerson` en `src/lib/services/transactions.ts` con validación de nombre.
  - [x] 1.2 Agregar función `calculatePaymentMethodMonthlyTotals` en `src/lib/services/dashboard.ts`.
  - [x] 1.3 Crear pruebas unitarias en `src/lib/services/__tests__/spec015.test.ts` cubriendo `updatePerson`, `calculatePaymentMethodMonthlyTotals` y cálculo bidireccional.

- [x] **Tarea 2: Formulario y Vista de Lista en Transacciones (`/transacciones`)**
  - [x] 2.1 Actualizar `src/components/transactions/TransactionForm.tsx` con modo dual de cálculo (Total / Cuota) y selección explícita del primer vencimiento.
  - [x] 2.2 Crear el componente de fila horizontal `src/components/transactions/TransactionRow.tsx` con soporte para expandir cuotas, marcar pagos, editar y borrar.
  - [x] 2.3 Modificar `src/app/transacciones/page.tsx` para incorporar el filtro por método de pago y renderizar la lista con `TransactionRow`.

- [x] **Tarea 3: Totales por Método de Pago en Dashboard (`/dashboard`)**
  - [x] 3.1 Crear componente `src/components/dashboard/PaymentMethodTotals.tsx` para mostrar tarjetas/chips con los totales del mes agrupados por tarjeta.
  - [x] 3.2 Integrar `PaymentMethodTotals` en `src/app/dashboard/page.tsx` justo arriba de la lista de vencimientos `MonthlyDueList`.

- [x] **Tarea 4: Pantalla ABM de Personas y Navegación (`/personas`)**
  - [x] 4.1 Crear la página `src/app/personas/page.tsx` con alta, edición in-place o modal, y eliminación segura con feedback.
  - [x] 4.2 Agregar enlace "Personas" en `src/components/layout/Navbar.tsx`.

- [x] **Tarea 5: Pruebas Automatizadas y Validación**
  - [x] 5.1 Ejecutar `npm test` y verificar 100% de tests unitarios pasando.
  - [x] 5.2 Crear o actualizar pruebas E2E en `e2e/spec015-features.spec.ts`.
  - [x] 5.3 Validar build y pruebas.

- [x] **Tarea 6: Commit, Push a GitHub y Actualización de Memoria**
  - [x] 6.1 Actualizar `MEMORY.md`.
  - [x] 6.2 Hacer commit con Conventional Commits (`feat: ...`).
  - [x] 6.3 Hacer `git push origin main`.

