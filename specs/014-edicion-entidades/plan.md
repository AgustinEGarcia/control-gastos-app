# Plan Técnico de Implementación — Spec 014: Edición Integral de Entidades y Eliminación Segura de Personas

## 1. Capa de Servicios (`src/lib/services/`)

### 1.1 `src/lib/services/transactions.ts`
- Implementar validación de integridad para personas:
  ```ts
  export async function checkPersonHasAssociatedRecords(
    supabase: SupabaseClient<Database>,
    personId: string
  ): Promise<{ hasRecords: boolean; count: number; summary: string[] }>
  ```
- Implementar `deletePerson(supabase, personId)`:
  - Invoca `checkPersonHasAssociatedRecords`.
  - Si existen registros asociados, lanza un `Error` descriptivo impidiendo el borrado.
  - Si no existen vínculos, ejecuta `DELETE FROM people WHERE id = personId`.
- Implementar `updateTransaction(supabase, id, input)`:
  - Permite actualizar `description`, `purchase_date` y `payment_method_id`.

### 1.2 `src/lib/services/recurringExpenses.ts`
- Implementar `updateRecurringExpense(supabase, id, input)`:
  - Actualiza `name`, `category`, `estimated_amount`, `payment_day` y `payment_method_id`.

### 1.3 `src/lib/services/loans.ts`
- Implementar `updatePersonalLoan(supabase, id, input)`:
  - Actualiza `lender_person_id`, `initial_amount`, `currency`, `loan_date`, `expected_return_date` y `notes`.

### 1.4 `src/lib/services/paymentMethods.ts`
- Implementar `updatePaymentMethod(supabase, id, input)`:
  - Actualiza `name`, `is_own`, `owner_name`, `closing_day` y `due_day`.

---

## 2. Capa de Componentes y Formularios (UI)

### 2.1 Gastos Fijos (`/gastos-recurrentes`)
- `ExpenseCard.tsx`: Añadir botón `✏️` en la cabecera que dispara `onEdit(expense)`.
- `ExpenseForm.tsx`: Soportar prop `editingExpense?: RecurringExpenseWithMethod | null` y `onCancel?: () => void`. Si está en modo edición, precarga todos los valores y muestra el botón *"Guardar Cambios"*.
- `src/app/gastos-recurrentes/page.tsx`: Manejo de estado `editingExpense` y función `handleUpdateExpense`.

### 2.2 Préstamos (`/prestamos`)
- `LoanCard.tsx`: Añadir botón `✏️` en la cabecera que dispara `onEditLoan(loan)`.
- `LoanForm.tsx`: Soportar `editingLoan?: LoanWithDetails | null` y `onCancel?: () => void`. Precargar prestamista, monto, moneda, fechas y notas.
- `src/app/prestamos/page.tsx`: Manejo de estado `editingLoan` y actualización.

### 2.3 Compras y Cuotas (`/transacciones`)
- `TransactionCard.tsx`: Añadir botón `✏️` que dispara `onEdit(transaction)`.
- `TransactionForm.tsx`: Soportar edición de datos de la compra (descripción, fecha y tarjeta) con botón *"Guardar Cambios"*.
- `src/app/transacciones/page.tsx`: Manejo de estado `editingTransaction`.

### 2.4 Métodos de Pago (`/metodos-pago`)
- `PaymentMethodCard.tsx`: Añadir botón `✏️` que dispara `onEdit(method)`.
- `PaymentMethodForm.tsx`: Soportar prop `editingMethod?: PaymentMethod | null` y `onCancel?: () => void`.
- `src/app/metodos-pago/page.tsx`: Manejo de estado `editingMethod`.

### 2.5 Eliminación Segura de Personas (`/deudores`)
- `DebtorCard.tsx`: Añadir botón `🗑️ Eliminar Persona`.
- Al hacer clic, invoca `deletePerson` con control de errores descriptivos que alertan si tiene gastos o préstamos vinculados.

---

## 3. Estrategia de Pruebas
1. **Pruebas Unitarias (Vitest)**:
   - Test de `checkPersonHasAssociatedRecords` y bloqueo preventivo de `deletePerson`.
   - Test de funciones `update` en los servicios correspondientes.
2. **Pruebas E2E (Playwright)**:
   - Crear `e2e/entity-editing.spec.ts` para verificar la presencia de los botones de edición y el flujo de cancelar/guardar.
