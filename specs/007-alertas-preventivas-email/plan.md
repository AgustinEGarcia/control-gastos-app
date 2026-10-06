# Plan de Implementación — Spec 007: Alertas Preventivas por Email con Resend

## 1. Arquitectura y Componentes
- **Servicio de Alertas por Email (`src/lib/services/alerts.ts`):**
  - Tipos:
    - `DueAlertItem`: Representa un gasto fijo o cuota próxima a vencer (título, tipo 'recurring' | 'installment', monto, fecha de vencimiento, días faltantes).
    - `SendAlertResult`: Resultado del despacho (éxito, id de email, simulado o real).
  - Lógica de detección:
    - `findUpcomingExpenses(expenses, targetDate, daysWindow)`
    - `findUpcomingInstallments(installments, targetDate, daysWindow)`
    - `generateEmailHtml(items, recipientName)`: Plantilla HTML responsive para el email.
  - Envío con Resend:
    - `sendDueAlertsEmail(recipientEmail, items, options)`
- **API Handler (`src/app/api/alerts/check-due-dates/route.ts`):**
  - Soporta método `POST` y `GET`.
  - Valida `Bearer CRON_SECRET` o sesión de usuario autenticado.
  - Ejecuta la búsqueda de vencimientos para las próximas 24 horas y despacha correos.
  - Retorna JSON con el resumen de alertas enviadas.
- **Componentes UI y Vista `/alertas`:**
  - `src/components/alerts/AlertsOverview.tsx`: Panel informativo del estado de Resend, resumen de vencimientos a 24h y a 7 días.
  - `src/app/alertas/page.tsx`: Vista protegida donde el usuario puede ver los próximos vencimientos y probar el envío de emails con un clic.
- **Navegación y Seguridad:**
  - Enlace a `Alertas` en `Navbar.tsx`.
  - Protección de `/alertas` en `middleware.ts`.
  - Exclusión del endpoint `/api/alerts/*` del middleware de páginas para permitir autenticación por Bearer token.

## 2. Estrategia de Testing (Vitest & Playwright)
- **Unit Testing con Vitest (`src/lib/services/alerts.test.ts`):**
  - Detección precisa de gastos fijos según el día del mes.
  - Detección precisa de cuotas impagas en la ventana de 24 horas (excluyendo cuotas pagadas).
  - Generación de HTML con formato de montos en español.
  - Manejo de modo simulación cuando no hay API Key.
- **End-to-End con Playwright (`e2e/alerts.spec.ts`):**
  - Redirección de `/alertas` a `/login` para usuarios anónimos.
  - Navbar con enlace a "Alertas".
  - Endpoint `/api/alerts/check-due-dates` rechaza peticiones no autorizadas con 401.
