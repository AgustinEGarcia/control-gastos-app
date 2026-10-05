# Comando: /sdd-change
Fase: Mantenimiento
Agente: plan

## Parámetros
- `$1`: Identificador del feature (ej. `001-setup-y-core-financiero`).

## Propósito
Gestiona cambios o adiciones de requisitos siguiendo la regla "la spec manda": actualiza primero `spec.md`, luego `plan.md` y `tasks.md`, mostrando el diff antes de tocar código.

## Instrucciones para el Agente
1. Recibe la solicitud de cambio del usuario.
2. Muestra el diff proyectado sobre `specs/$1/spec.md`.
3. Ajusta `specs/$1/plan.md` y añade las nuevas tareas a `specs/$1/tasks.md`.
4. Solicita confirmación antes de permitir cualquier modificación en el código fuente.
