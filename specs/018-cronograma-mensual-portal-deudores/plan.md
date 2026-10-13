# Plan de Implementación — Spec 018: Cronograma Mensual en Portal de Deudores

## 1. Arquitectura y Lógica de Negocio
1. **Lógica de Filtrado y Agrupación (`src/lib/services/debtors.ts`)**:
   - Crear la interfaz `DebtorMonthlyInstallmentItem`:
     ```ts
     export interface DebtorMonthlyInstallmentItem {
       transactionId: string;
       description: string;
       installmentId: string;
       installmentNumber: number;
       totalInstallments: number;
       amount: number;
       dueDate: string;
       paymentMethodName: string | null;
       isPaid: boolean;
     }
     ```
   - Crear la función pura `calculateDebtorMonthlyInstallments(transactions, year, month)`:
     - Recorre cada transacción.
     - Extrae las cuotas cuyo `due_date` cae en el año y mes indicados (parseo UTC/local seguro `YYYY-MM-DD`).
     - Devuelve `{ items: DebtorMonthlyInstallmentItem[], totalAmount: number }`.
     - Manejo de devoluciones/reintegros si correspondiera.

2. **Interfaz de Usuario (`src/app/estado-cuenta/[id]/page.tsx`)**:
   - Agregar estados `selectedYear` y `selectedMonth` inicializados en la fecha actual (`new Date()`).
   - Crear barra de navegación mensual responsiva con:
     - Botón `‹` anterior.
     - Título del mes en español capitalizado (ej. `Octubre 2026`).
     - Botón `›` posterior.
     - Botón `Mes actual` si la selección difiere del mes corriente.
   - Tarjeta destacada de "Total a Pagar en [Mes Año]":
     - Importe grande en color ámbar/índigo.
     - Cantidad de cuotas del mes.
   - Lista desglosada de cuotas del mes:
     - Título de la compra.
     - Badge de cuota (ej: `Cuota 1 de 8`).
     - Tarjeta / Banco emisor.
     - Monto individual de la cuota.
   - Conservar debajo la tarjeta de saldo total consolidado, préstamos directos e historial de pagos.

## 2. Pruebas
- Pruebas unitarias en `src/lib/services/debtors.test.ts`:
  - Filtrado correcto de cuotas por mes y año.
  - Suma acumulada de las cuotas del mes.
  - Compras multicuota distribuidas en diferentes meses.
  - Mes sin cuotas retorna total 0 y array vacío.
- Pruebas E2E en Playwright y suite completa Vitest.
- Verificación de build de producción Next.js.
