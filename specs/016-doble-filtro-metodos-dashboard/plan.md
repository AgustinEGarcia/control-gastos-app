# Plan 016 — Doble Filtro en Dashboard, Selección de Mes de Cuotas y Edición Integral de Compras

## 1. Arquitectura y Decisiones Técnicas

### 1.1 Doble Filtro en Dashboard
- **`src/lib/services/dashboard.ts`**:
  - Actualizar `MonthlyDueItem` con `paymentMethodId?: string | null` y `paymentMethodName?: string | null`.
  - En `calculateMonthlyConsolidated`:
    - Para gastos fijos: mapear `paymentMethodId` y `paymentMethodName`.
    - Para cuotas: mapear `paymentMethodId` y `paymentMethodName`.
    - Para variables: `null`.
- **`src/components/dashboard/MonthlyDueList.tsx`**:
  - Extraer los métodos de pago únicos presentes en `items`.
  - Agregar estado `selectedPaymentMethod` ('all' | methodId | 'none').
  - Agregar selector `💳 Tarjeta / Método:` en la barra de filtros.
  - Aplicar doble filtro en memoria (`filter && selectedPaymentMethod`).

### 1.2 Selector Simplificado de Mes de Inicio de Cuotas
- **`src/components/transactions/TransactionForm.tsx`**:
  - Reemplazar el campo complejo de fecha de compra y fecha de primer vencimiento por un selector de **Mes de Inicio del Cobro** (ej. `<input type="month">` o selector de mes y año).
  - Al seleccionar el mes (ej. `2026-10`), se programa la primera cuota en `2026-10-01` y se calcula la serie mensual consecutiva (`generateInstallmentSchedule`).
  - `purchase_date` se establece automáticamente en la fecha actual o en el primer día del mes seleccionado.

### 1.3 Edición Integral de Compras
- **`src/lib/services/transactions.ts`**:
  - Ampliar `UpdateTransactionInput`:
    ```typescript
    export interface UpdateTransactionInput {
      description?: string;
      total_amount?: number;
      installments_count?: number;
      first_installment_date?: string;
      purchase_date?: string;
      payment_method_id?: string | null;
      beneficiary_person_id?: string | null;
    }
    ```
  - Mejorar `updateTransaction(supabase, id, input)`:
    - Actualiza los campos en la tabla `transactions`.
    - Si `total_amount`, `installments_count` o `first_installment_date` fueron modificados:
      - Regenerar las cuotas: eliminar las cuotas anteriores de esa transacción y reinsertar las nuevas generadas con `generateInstallmentSchedule`.
- **`src/components/transactions/EditTransactionModal.tsx`**:
  - Rediseñar el modal para incluir todos los campos del formulario de creación:
    - Campo de descripción.
    - Selector de modo de cálculo: Por Monto Total o Por Valor de Cuota.
    - Monto total / Monto por cuota reactivo.
    - Cantidad de cuotas (1 a 60).
    - Selector de Mes de inicio de pago.
    - Selector de Tarjeta / Método de pago.
    - Selector de Consumo Propio vs A cobrar a Tercero (con selección de persona).
    - Botón para registrar nueva persona al vuelo si fuera necesario.

## 2. Estrategia de Pruebas

### 2.1 Pruebas Unitarias (Vitest)
- Probar `calculateMonthlyConsolidated` con atribución de `paymentMethodId` y `paymentMethodName`.
- Probar `updateTransaction`:
  - Actualización simple de descripción / método.
  - Actualización con recálculo de cuotas cuando cambian montos o cantidad de cuotas.

### 2.2 Pruebas E2E (Playwright)
- Validar selector de tarjeta en `MonthlyDueList` en el dashboard.
- Validar modal de edición completa en transacciones.
