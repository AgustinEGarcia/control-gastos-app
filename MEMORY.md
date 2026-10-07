# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Specs 001 a 009 completadas y desplegadas al 100%.
- Base de datos Supabase: Esquema completo actualizado (incluye `payment_method_id` en `recurring_expenses`).
- Vistas activas: Dashboard Consolidado (`/dashboard`), Landing (`/`), Login (`/login`), Métodos de Pago (`/metodos-pago`), Gastos Fijos (`/gastos-recurrentes`), Tarjetas/Cuotas (`/transacciones`), Préstamos (`/prestamos`), Deudores (`/deudores`), Portal Público (`/estado-cuenta/[id]`) y Alertas (`/alertas`).
- Suite de pruebas: 60 pruebas unitarias con Vitest y 17 pruebas E2E con Playwright (Chromium) 100% en verde.
- Spec 009: Suscripciones y débitos fijos permanentes en tarjetas integrados en formularios, badges de tarjetas y cálculos de compromisos mensuales.

## Protocolo Obligatorio ante Nuevos Requerimientos (Interactivo SDD)
1. Explicar qué se entendió y cuál será la modificación exacta prevista.
2. Mostrar paso a paso cada etapa SDD (`spec.md` -> `plan.md` -> `tasks.md`), pidiendo confirmación al usuario tras cada una.
3. Mostrar qué archivos y componentes se modificarán.
4. Modificar código SOLO tras el OK expreso del usuario.
5. Ejecutar pruebas, reportar resultados y commitear con Conventional Commits tras el visto bueno.

## Aprendizajes y errores a evitar
- PostgREST Relationships: Con FKs múltiples, usar sintaxis explícita con fallback en memoria.
- Git Push: El PAT no posee permisos `workflow`. Los crons residen en `vercel.json`.

## Próximos pasos
- Probar la funcionalidad de suscripciones en producción y esperar nuevo requerimiento del usuario.
