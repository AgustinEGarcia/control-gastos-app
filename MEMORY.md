# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Specs 001 a 010 completadas y desplegadas al 100%.
- Base de datos Supabase: Esquema actualizado con `loan_type` y `expected_return_date` en `personal_loans`.
- Vistas activas: Dashboard Consolidado (`/dashboard`), Landing (`/`), Login (`/login`), Métodos de Pago (`/metodos-pago`), Gastos Fijos (`/gastos-recurrentes`), Tarjetas/Cuotas (`/transacciones`), Préstamos (`/prestamos`), Deudores (`/deudores`), Portal Público (`/estado-cuenta/[id]`) y Alertas (`/alertas`).
- Suite de pruebas: 62 pruebas unitarias con Vitest y 17 pruebas E2E con Playwright 100% en verde.
- Spec 010: Registro de dinero propio prestado a terceros sin vencimiento fijo ("A convenir"), consolidado y discriminado en Deudores, Estado de Cuenta Público y Dashboard Consolidado.

## Protocolo Obligatorio ante Nuevos Requerimientos (Interactivo SDD)
1. Explicar qué se entendió y cuál será la modificación exacta prevista.
2. Mostrar paso a paso cada etapa SDD (`spec.md` -> `plan.md` -> `tasks.md`), pidiendo confirmación al usuario tras cada una.
3. Mostrar qué archivos y componentes se modificarán.
4. Modificar código SOLO tras el OK expreso del usuario.
5. Ejecutar pruebas, reportar resultados y commitear con Conventional Commits tras el visto bueno.

## Aprendizajes y errores a evitar
- PostgREST Relationships: Con FKs múltiples, usar sintaxis explícita con fallback en memoria.
- Git Push: El PAT no posee permisos `workflow`. Los crons residen en `vercel.json`.
- Préstamos: `expected_return_date: null` denota "A término abierto / A convenir".

## Próximos pasos
- El usuario debe ejecutar el script SQL de migración en Supabase (`ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS loan_type ...`).

