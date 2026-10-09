# Tareas de Implementación — Spec 014: Edición Integral de Entidades y Eliminación Segura de Personas

- [x] **Tarea 1: Servicios de Actualización y Eliminación Segura de Personas con Tests Unitarios**
  - Implementar `checkPersonHasAssociatedRecords` y `deletePerson` en `src/lib/services/transactions.ts`.
  - Implementar `updateRecurringExpense`, `updatePersonalLoan`, `updateTransaction` y `updatePaymentMethod`.
  - Agregar pruebas unitarias en Vitest para validar las actualizaciones y el bloqueo preventivo de personas con vínculos.
  - Hecho cuando: Las pruebas unitarias pasen al 100%.

- [x] **Tarea 2: Edición de Gastos Fijos (`ExpenseCard.tsx`, `ExpenseForm.tsx`, `gastos-recurrentes/page.tsx`)**
  - Añadir botón `✏️` en `ExpenseCard`.
  - Adaptar `ExpenseForm` para modo edición (`editingExpense`, botón "Guardar Cambios" y "Cancelar").
  - Conectar en `src/app/gastos-recurrentes/page.tsx`.
  - Hecho cuando: Se pueda editar cualquier gasto fijo existente.

- [x] **Tarea 3: Edición de Préstamos Personales (`LoanCard.tsx`, `LoanForm.tsx`, `prestamos/page.tsx`)**
  - Añadir botón `✏️` en `LoanCard`.
  - Adaptar `LoanForm` para precargar y editar préstamos existentes.
  - Conectar en `src/app/prestamos/page.tsx`.
  - Hecho cuando: Se pueda editar cualquier préstamo existente.

- [x] **Tarea 4: Edición de Compras/Cuotas (`TransactionCard.tsx`, `TransactionForm.tsx`, `transacciones/page.tsx`)**
  - Añadir botón `✏️` en `TransactionCard`.
  - Permitir editar datos base de la compra (descripción, fecha, tarjeta).
  - Conectar en `src/app/transacciones/page.tsx`.
  - Hecho cuando: Se pueda editar una compra existente.

- [x] **Tarea 5: Edición de Métodos de Pago y Eliminación Segura de Personas (`PaymentMethodCard.tsx`, `DebtorCard.tsx`)**
  - Añadir botón `✏️` en `PaymentMethodCard` y soporte de edición en `PaymentMethodForm`.
  - Añadir botón `🗑️` para eliminar personas en `DebtorCard` con validación preventiva de registros asociados.
  - Hecho cuando: Se puedan editar tarjetas y eliminar personas que no tengan vínculos.

- [x] **Tarea 6: Pruebas E2E y Verificación Completa del Stack**
  - Crear `e2e/entity-editing.spec.ts`.
  - Ejecutar `npx tsc --noEmit`, `npm test` y `npm run test:e2e`.
  - Hecho cuando: 100% de los tests pasen en verde.

- [ ] **Tarea 7: Documentación, Memoria y Commit**
  - Actualizar `MEMORY.md`.
  - Realizar commit con Conventional Commits (`feat: agregar edicion integral de entidades y eliminacion segura de personas`).
