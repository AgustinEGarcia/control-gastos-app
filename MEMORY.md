# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Specs 001 a 006 completadas al 100%.
- Vistas activas: Landing (`/`), Login (`/login`), Métodos de Pago (`/metodos-pago`), Gastos Fijos (`/gastos-recurrentes`), Tarjetas/Cuotas (`/transacciones`), Préstamos (`/prestamos`), Deudores (`/deudores`) y Portal Público (`/estado-cuenta/[id]`).
- Suite de pruebas: 45 pruebas unitarias con Vitest y 11 pruebas E2E con Playwright (Chromium) 100% en verde.

## Decisiones (y por qué)
- Portal público de deudores (`/estado-cuenta/[id]`): Excluido intencionalmente de la redirección forzada a `/login` en el middleware para permitir que los deudores invitados consulten su balance desde el móvil.
- Consolidación de cobros: `payments_received` amortiza el total de compras asociadas al beneficiario.
- Multidivisa estricta en préstamos (ARS y USD independientes).

## Aprendizajes y errores a evitar
- Reutilizar `getTransactions` en servicios derivados para evitar duplicidad de queries tipadas complejas.
- Recordar que en PowerShell se separan comandos con `;` en lugar de `&&`.

## Próximos pasos
- Iniciar Spec 007: Alertas Preventivas por Email con Resend (cron/endpoint para notificar vencimientos a 24 horas).
