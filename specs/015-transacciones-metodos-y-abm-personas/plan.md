# Plan 015 — Vista de Lista en Transacciones, Filtro por Métodos, Totales en Dashboard y ABM de Personas

## 1. Arquitectura y Decisiones Técnicas

### 1.1 Servicios y Lógica de Negocio
- **`src/lib/services/transactions.ts`**:
  - Agregar `updatePerson(supabase, personId, input: { name: string; email?: string | null })`.
  - Asegurar la validación del nombre obligatorio y no vacío al actualizar.
  - Asegurar que `generateInstallmentSchedule(totalAmount, count, firstDueDate)` distribuya correctamente los importes y use la fecha de primer vencimiento proporcionada.
- **`src/lib/services/dashboard.ts`**:
  - Implementar la función auxiliar `calculatePaymentMethodMonthlyTotals(expenses, transactions, year, month)` que retorne una lista ordenada de métodos con su acumulado:
    `{ paymentMethodId, name, totalAmount, totalInstallments, totalRecurring }[]`.

### 1.2 Componentes de la Pantalla de Transacciones (`/transacciones`)
- **`src/components/transactions/TransactionRow.tsx`** (Nuevo componente de renglón de lista):
  - Componente que sustituye la vista en cuadrícula de tarjetas rectangulares por una fila horizontal elegante.
  - Soporta colapsar/expandir el desglose de cuotas individuales para marcar pagos.
  - Integra botones de edición (`✏️`) y eliminación (`🗑️`).
  - Totalmente adaptado a pantallas móviles y desktop.
- **`src/components/transactions/TransactionForm.tsx`**:
  - Agregar toggle interactivo de modo de entrada: `Total` o `Por Cuota`.
  - Cuando se modifica el monto de la cuota o la cantidad de cuotas en modo `Por Cuota`, calcula automáticamente `totalAmount = cuota * cuotas`.
  - Cuando se modifica el total en modo `Total`, calcula la cuota estimada.
  - Campo de entrada "Primer Vencimiento" (`firstInstallmentDate`) con valor por defecto la fecha actual o el próximo mes, que alimenta la generación del plan de cuotas.
- **`src/app/transacciones/page.tsx`**:
  - Agregar estado `selectedPaymentMethodFilter: string` ('all' o id del método).
  - Selector de método de pago en la barra de filtros superior.
  - Renderizado de `TransactionRow` en un contenedor de listado vertical (`space-y-3` / tabla estilizada).

### 1.3 Componentes del Dashboard (`/dashboard`)
- **`src/components/dashboard/PaymentMethodTotals.tsx`** (Nuevo componente):
  - Se ubica arriba de la lista de vencimientos mensuales (`MonthlyDueList`).
  - Muestra tarjetas/chips con los métodos que tienen consumos ese mes, su nombre y el total acumulado a debitar.
- **`src/app/dashboard/page.tsx`**:
  - Calcular e inyectar los totales por método de pago usando `useMemo`.
  - Renderizar `PaymentMethodTotals` antes de `MonthlyDueList`.

### 1.4 Pantalla de ABM de Personas (`/personas`)
- **`src/app/personas/page.tsx`** (Nueva página):
  - Formulario de alta para registrar nuevas personas (Nombre, Email opcional).
  - Tabla/lista de personas existentes con botones de "Editar" y "Eliminar".
  - Modal o formulario in-place para editar personas existentes usando `updatePerson`.
  - Confirmación y llamada a `deletePerson` con captura amigable de errores si la persona tiene compromisos financieros activos.
- **`src/components/layout/Navbar.tsx`**:
  - Añadir enlace de navegación a `/personas` ("Personas / Contactos").

## 2. Estrategia de Pruebas

### 2.1 Pruebas Unitarias (Vitest)
- Probar `updatePerson`:
  - Actualización exitosa de nombre y email.
  - Rechazo si el nombre está vacío.
- Probar `calculatePaymentMethodMonthlyTotals`:
  - Agrupación correcta sumando cuotas y gastos fijos de un método en el mes dado.
  - Descarte o saldo 0 en métodos sin movimientos ese mes.
- Probar cálculo bidireccional y programación con fecha de primer vencimiento.

### 2.2 Pruebas E2E (Playwright)
- Flujo en `/transacciones`:
  - Verificar renderizado en lista/renglones.
  - Filtrar por un método de pago y verificar que solo aparezcan sus transacciones.
  - Registrar compra ingresando monto de cuota y validar que calcule el total y aplique el primer vencimiento.
- Flujo en `/dashboard`:
  - Verificar la aparición de las tarjetas de totales por método de pago.
- Flujo en `/personas`:
  - Crear una persona, editarla, y validar su persistencia o borrado seguro.
