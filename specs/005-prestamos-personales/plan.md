# Plan de Implementación — Spec 005: Préstamos Personales Multidivisa y Abonos

## 1. Arquitectura y Componentes
- **Capa de Lógica / Servicios (`src/lib/services/loans.ts`):**
  - Tipos: `PersonalLoan`, `LoanRepayment`, `LoanWithDetails`, `LoanSummaryByCurrency`, `LoanSummaries`.
  - Validaciones: `validateLoanInput`, `validateRepaymentInput`.
  - Cálculos puros: `calculateLoanBalance`, `calculateLoansSummary`.
  - Operaciones con Supabase:
    - `getLoans(supabase)`: Carga préstamos con prestamista y abonos.
    - `createLoan(supabase, input, userId)`: Inserción en `personal_loans`.
    - `createRepayment(supabase, input)`: Inserción en `loan_repayments` y auto-actualización de estado si se cancela.
    - `deleteRepayment(supabase, repaymentId)`: Reversión de abono.
    - `deleteLoan(supabase, loanId)`: Eliminación en cascada.
- **Capa de Interfaz de Usuario:**
  - `src/components/loans/LoanSummaryCards.tsx`: Tarjetas de resumen en ARS y USD (Saldo pendiente, Total amortizado, Total tomado).
  - `src/components/loans/LoanCard.tsx`: Tarjeta por préstamo con badge de moneda, barra de progreso de pago, desglose numérico, botón para registrar abono y modal desplegable de historial de abonos.
  - `src/components/loans/LoanForm.tsx`: Modal / Formulario para alta de préstamo con selector o creación instantánea de prestamista.
  - `src/components/loans/LoanRepaymentModal.tsx`: Modal rápido para ingresar abono con monto máximo asistido (saldo restante).
  - `src/app/prestamos/page.tsx`: Vista principal protegida por sesión.
- **Navegación:**
  - Actualizar enlaces de cabecera en `src/app/layout.tsx` para incluir `/prestamos`.

## 2. Estrategia de Testing (Vitest & Playwright)
- **Unit Testing con Vitest (`src/lib/services/loans.test.ts`):**
  - Validación de campos requeridos (monto > 0, moneda válida, prestamista).
  - Cálculo de saldo remanente y porcentaje amortizado.
  - Comprobación de que saldos en ARS y USD se calculan sin mezclarse.
  - Manejo de cancelación total (`paid_off`).
- **End-to-End con Playwright (`tests/loans.spec.ts`):**
  - Renderizado del encabezado y resúmenes de deuda multidivisa.
  - Formulario de nuevo préstamo: validaciones y campos.
  - Enlaces de navegación activos.
