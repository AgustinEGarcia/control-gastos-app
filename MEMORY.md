# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Specs 001 a 007 completadas al 100% (Todos los módulos del PRD cubiertos).
- Vistas activas: Landing (`/`), Login (`/login`), Métodos de Pago (`/metodos-pago`), Gastos Fijos (`/gastos-recurrentes`), Tarjetas/Cuotas (`/transacciones`), Préstamos (`/prestamos`), Deudores (`/deudores`), Portal Público (`/estado-cuenta/[id]`) y Alertas (`/alertas`).
- Suite de pruebas: 52 pruebas unitarias con Vitest y 14 pruebas E2E con Playwright (Chromium) 100% en verde.

## Decisiones (y por qué)
- Alertas preventivas por email con Resend a costo $0: Despacho a 24 horas del vencimiento con fallback simulado seguro ante falta de API Key.
- Endpoint de cron (`/api/alerts/check-due-dates`): Autenticado con `CRON_SECRET` o sesión de usuario para invocación desatendida.
- Portal público de deudores (`/estado-cuenta/[id]`): Acceso sin login para deudores invitados.
- Multidivisa estricta en préstamos (ARS y USD independientes).

## Aprendizajes y errores a evitar
- Instalar dependencias con `npm.cmd` en Windows y validar compatibilidad SSR con endpoints API.
- Mantener siempre variables de entorno vacías en `.env.example` (Principio Zero Trust).

## Próximos pasos
- Proyecto base al 100% según el PRD. Listo para feedback de usuario, pulido estético adicional o despliegue en Vercel.
