# Comando: /sdd-tasks
Fase: Tareas
Agente: plan

## Parámetros
- `$1`: Identificador del feature (ej. `001-setup-y-core-financiero`).

## Propósito
Desglosa el plan técnico en una lista de tareas atómicas (de 20 a 30 minutos) con criterio de aceptación claro en `specs/$1/tasks.md`.

## Instrucciones para el Agente
1. Lee `specs/$1/plan.md`.
2. Genera tareas secuenciales con la plantilla:
   `- [ ] **Tn. <Descripción de tarea>.** Hecho cuando: <condición verificable por test o inspección>.`
3. Ordena las tareas según flujo TDD (primero tests unitarios/infraestructura, luego implementación y validación E2E).
4. Guarda `specs/$1/tasks.md` y solicita confirmación para iniciar la primera tarea.
