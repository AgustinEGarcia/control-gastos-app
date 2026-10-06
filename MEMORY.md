# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Spec 001 (Conexión Supabase y Tipos) y Spec 002 (Auth y Métodos de Pago) completadas al 100%.
- Vistas implementadas: Landing Page (`/`), Autenticación (`/login`) y Métodos de Pago (`/metodos-pago`).
- Suite de pruebas: 9 pruebas unitarias con Vitest y 2 pruebas E2E con Playwright (Chromium) 100% en verde.

## Decisiones (y por qué)
- Modo Webpack activado en `next dev --webpack` para evitar restricciones de directivas binarias de Windows en Turbopack.
- Middleware con `@supabase/ssr` para protección de rutas y refresco automático de cookies de sesión.
- Validación pura desacoplada en `src/lib/services/paymentMethods.ts` para facilitar pruebas unitarias estrictas.

## Aprendizajes y errores a evitar
- Configurar flags del dev server para asegurar que el webServer de Playwright levante sin colisiones de binarios en Windows.
- En tarjetas de terceros, exigir obligatoriamente el nombre del titular para evitar registros huérfanos.

## Próximos pasos
- Iniciar Spec 003: Módulo de Gastos Fijos Recurrentes (plantillas mensuales, actualización de facturas y montos reales).
