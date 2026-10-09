# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Specs 001 a 011 completadas y probadas al 100%.
- Base de datos Supabase: Esquema actualizado con `loan_type` y `expected_return_date` en `personal_loans`.
- Vistas activas: Dashboard (`/dashboard`), Landing (`/`), Login (`/login`), Actualizar Clave (`/actualizar-contrasena`), Métodos de Pago (`/metodos-pago`), Gastos Fijos (`/gastos-recurrentes`), Tarjetas/Cuotas (`/transacciones`), Préstamos (`/prestamos`), Deudores (`/deudores`), Portal Público (`/estado-cuenta/[id]`) y Alertas (`/alertas`).
- Suite de pruebas: 73 pruebas unitarias con Vitest y 19 pruebas E2E con Playwright 100% en verde.
- Spec 011: Recuperación de contraseña por email y restablecimiento seguro con Supabase Auth implementado.

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
- Avanzar a Fase 2 (Spec 012): Marcar gastos pagados del mes y visualización de totales en Dashboard.

