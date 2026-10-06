# Plan de Implementación — Spec 006: Portal de Deudores y Estado de Cuenta Compartido

## 1. Arquitectura y Componentes
- **Servicio de Datos (`src/lib/services/debtors.ts`):**
  - Tipos:
    - `PaymentReceived`: Modelo de `payments_received`.
    - `DebtorAccount`: Perfil de deudor consolidado (persona, transacciones asociadas, total adeudado, total abonado, saldo remanente, estado).
    - `DebtorsSummary`: Métricas generales (total a cobrar global, total cobrado, deudores activos).
    - `PaymentReceivedInput`: Datos para registrar un cobro recibido.
  - Lógica de cálculo puro:
    - `calculateDebtorBalance(transactions, paymentsReceived)`
    - `calculateDebtorsGlobalSummary(debtors)`
    - `validatePaymentReceivedInput(input)`
  - Operaciones Supabase:
    - `getDebtorsOverview(supabase)`: Carga deudores con transacciones y pagos recibidos del usuario.
    - `createPaymentReceived(supabase, input, userId)`: Alta en `payments_received`.
    - `deletePaymentReceived(supabase, paymentId)`: Reversión de cobro.
    - `getPublicDebtorStatement(supabase, personId)`: Consulta del estado de cuenta público para la vista `/estado-cuenta/[id]`.
- **Componentes UI:**
  - `src/components/debtors/DebtorSummaryCards.tsx`: Tarjetas métricas (Total Pendiente de Cobro, Total Cobrado Histórico, Deudores Activos).
  - `src/components/debtors/DebtorCard.tsx`: Tarjeta por persona con saldo a cobrar, botón de copiar enlace al portal, desglose de compras asociadas, historial de abonos y botón para registrar cobro.
  - `src/components/debtors/PaymentReceivedModal.tsx`: Modal para registrar pago recibido con fecha, monto y nota.
- **Vistas:**
  - `src/app/deudores/page.tsx`: Panel privado de gestión de deudores y cobros.
  - `src/app/estado-cuenta/[id]/page.tsx`: Portal público móvil para el deudor invitado.
- **Navegación y Seguridad:**
  - Actualizar `Navbar.tsx` con acceso a `/deudores`.
  - Asegurar que `middleware.ts` proteja `/deudores` pero permita explícitamente el acceso público a `/estado-cuenta/*`.

## 2. Estrategia de Testing (Vitest & Playwright)
- **Unit Testing con Vitest (`src/lib/services/debtors.test.ts`):**
  - Validación de campos requeridos para pagos recibidos.
  - Cálculo de saldos y consolidación de transacciones vs pagos.
  - Clasificación de deudores "al día" vs "con saldo pendiente".
  - Resumen global de cobranza.
- **End-to-End con Playwright (`e2e/debtors.spec.ts`):**
  - Redirección de `/deudores` a `/login` para usuarios no autenticados.
  - Navbar con enlace a "Deudores".
  - Acceso público libre a `/estado-cuenta/test-id` sin forzar redirección a `/login`.
