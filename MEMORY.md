# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Specs 001 a 013 completadas y probadas al 100%.
- Base de datos Supabase: Esquema incluye `monthly_expense_payments` y `variable_monthly_expenses` (con fallback local resiliente Zero Downtime).
- Vistas activas: Dashboard (`/dashboard`), Landing (`/`), Login (`/login`), Actualizar Clave (`/actualizar-contrasena`), Métodos de Pago (`/metodos-pago`), Gastos Fijos (`/gastos-recurrentes`), Tarjetas/Cuotas (`/transacciones`), Préstamos (`/prestamos`), Deudores (`/deudores`), Portal Público (`/estado-cuenta/[id]`) y Alertas (`/alertas`).
- Suite de pruebas: 87 pruebas unitarias con Vitest y 23 pruebas E2E con Playwright 100% en verde.
- Specs 011, 012 y 013: Recuperación de clave por email, marcado interactivo de gastos pagados en Dashboard, y bolsa de gastos variables mensuales con desglose de conceptos sumando al consolidado.

## Protocolo Obligatorio ante Nuevos Requerimientos (Interactivo SDD)
1. Explicar qué se entendió y cuál será la modificación exacta prevista.
2. Mostrar paso a paso cada etapa SDD (`spec.md` -> `plan.md` -> `tasks.md`), pidiendo confirmación al usuario tras cada una.
3. Mostrar qué archivos y componentes se modificarán.
4. Modificar código SOLO tras el OK expreso del usuario.
5. Ejecutar pruebas, reportar resultados y commitear con Conventional Commits tras el visto bueno.

## Aprendizajes y errores a evitar
- PostgREST Relationships: Con FKs múltiples, usar sintaxis explícita con fallback en memoria.
- Git Push: El PAT no posee permisos `workflow`. Los crons residen en `vercel.json`.
- Pagos y Variables: Sincronización transparente con localStorage asegura alta disponibilidad sin bloqueos.

## Próximos pasos
- El usuario puede ejecutar las migraciones SQL documentadas en `docs/OPENSPEC.md` en Supabase Studio cuando lo desee.

