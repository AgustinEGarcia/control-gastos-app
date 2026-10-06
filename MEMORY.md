# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Specs 001 a 005 completadas al 100%.
- Vistas activas: Landing (`/`), Login (`/login`), Métodos de Pago (`/metodos-pago`), Gastos Fijos (`/gastos-recurrentes`), Tarjetas/Cuotas (`/transacciones`) y Préstamos Multidivisa (`/prestamos`).
- Suite de pruebas: 36 pruebas unitarias con Vitest y 8 pruebas E2E con Playwright (Chromium) 100% en verde.

## Decisiones (y por qué)
- Multidivisa estricta: Los préstamos y deudas en ARS y USD se calculan y presentan en paneles independientes sin mezclar saldos.
- Amortización reactiva: Los abonos en `loan_repayments` reducen instantáneamente el saldo restante y marcan `paid_off` automáticamente al llegar a cero.
- Algoritmo de cuotas exacto con compensación de centavos en la 1° cuota.

## Aprendizajes y errores a evitar
- Incluir rutas nuevas en el arreglo `isProtectedRoute` de `middleware.ts` para garantizar el Principio Zero Trust.
- En Windows PowerShell usar `npm.cmd` o `npx.cmd` para evitar bloqueos por ExecutionPolicy.

## Próximos pasos
- Iniciar Spec 006: Portal de Deudores / Estado de Cuenta Compartido (tabla `payments_received` y consulta pública para deudores).
- Iniciar Spec 007: Alertas Preventivas por Email con Resend (cron a 24 horas del vencimiento).
