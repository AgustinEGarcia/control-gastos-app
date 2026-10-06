# Plan Técnico: Spec 004 — Transacciones, Cuotas y Consumos Compartidos

## 1. Algoritmos Puros y Lógica Matemática
- `src/lib/services/transactions.ts`:
  - `generateInstallmentSchedule(totalAmount, installmentsCount, firstInstallmentDate)`:
    - Divide `totalAmount / installmentsCount` con precisión de 2 decimales.
    - Distribuye cualquier centavo sobrante en la primera cuota para que la suma sea exactamente igual al total.
    - Incrementa los meses en `firstInstallmentDate` de forma segura (manejando meses de 28, 30 y 31 días).
  - `validateTransactionInput(input)`:
    - Valida descripción, fechas en formato ISO, montos positivos y cuotas 1..60.
  - `calculateTransactionSummaries(transactionsWithInstallments)`:
    - Total de compras activas.
    - Total cuotas propias pendientes del período.
    - Total a cobrar a terceros pendiente.

## 2. Servicios de Persistencia en Supabase
- `getTransactions(supabase)`: Trae transacciones con joins a `payment_methods`, `people` e `installments`.
- `createTransactionWithInstallments(supabase, input, userId)`:
  - Inserta transacción en `transactions`.
  - Inserta el array de cuotas generado en `installments`.
- `deleteTransaction(supabase, id)`: Borra transacción (las cuotas se borran en cascada).
- `toggleInstallmentPaid(supabase, installmentId, isPaid)`: Actualiza `is_paid`.
- `getPeople(supabase)` & `createPerson(supabase, name, email, userId)`: Gestión ágil de terceros para consumos compartidos.

## 3. Componentes de UI
- `src/components/transactions/TransactionSummaryCards.tsx`: Tarjetas de totales (Compromisos Propios, A Cobrar a Terceros, Total Financiado).
- `src/components/transactions/TransactionCard.tsx`: Card de compra con barra de progreso, método de pago, etiqueta de beneficiario, y lista colapsable de cuotas para tildar como pagadas.
- `src/components/transactions/TransactionForm.tsx`: Modal con selector de método de pago, toggle de "Compra para un tercero" (con selector/creador de persona rápida), cálculo en vivo del valor de cada cuota.

## 4. Página y Navegación
- `src/app/transacciones/page.tsx`: Dashboard con filtros ("Todas", "Solo Mías", "A Cobrar").
- `src/components/layout/Navbar.tsx`: Enlace a "Tarjetas y Cuotas".
- `src/middleware.ts`: Proteger `/transacciones`.
