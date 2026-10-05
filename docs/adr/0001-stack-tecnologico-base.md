# ADR 0001: Selección del Stack Tecnológico Base y Estrategia de Testing

- **Estado:** Aceptado
- **Fecha:** 2026-10-05
- **Autores:** Arquitecto de Software & Agustín

## Contexto
Se requiere construir una solución integral de finanzas personales orientada a costo cero, alta velocidad de desarrollo, seguridad estricta y prevención total de regresiones en cálculos financieros y experiencia de usuario.

## Decisión
Se adopta el siguiente stack arquitectónico:
1. **Framework Frontend/Fullstack:** Next.js 16 (App Router) con TypeScript y Tailwind CSS v4 para tipado estricto, renderizado híbrido y diseño moderno.
2. **Backend & Base de Datos:** Supabase (PostgreSQL serverless con Row Level Security y Auth) usando `@supabase/ssr` y `@supabase/supabase-js`.
3. **Servicio de Notificaciones:** Resend para alertas por email previas al vencimiento de facturas y cuotas.
4. **Testing Unitario / Lógica:** Vitest con jsdom y `@testing-library/react` para ejecución ultrarrápida de pruebas sobre cálculos matemáticos y utilidades.
5. **Testing E2E / UI:** Playwright con Chromium para validación de flujos de usuario completos contra el servidor de desarrollo.

## Consecuencias
- **Positivas:** 
  - Cumplimiento del principio de costo $0.
  - Seguridad delegada a RLS a nivel de base de datos.
  - Suite de testing dual (unitario + E2E) que garantiza estabilidad ante cualquier refactorización.
- **Negativas / Mitigaciones:**
  - Requiere mantener configuraciones sincronizadas entre Vitest y Playwright (resuelto aislando `src/` para Vitest y `e2e/` para Playwright).
