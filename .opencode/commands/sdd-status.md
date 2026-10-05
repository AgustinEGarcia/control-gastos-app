# Comando: /sdd-status
Fase: Monitoreo
Agente: plan

## Parámetros
- `$1`: (Opcional) Identificador del feature (ej. `001-setup-y-core-financiero`).

## Propósito
Muestra el estado consolidado de la spec actual, el avance de las tareas en `tasks.md`, las decisiones recientes en `MEMORY.md` y señala exactamente cuál es el siguiente paso a ejecutar.

## Instrucciones para el Agente
1. Lee `MEMORY.md` y determina el feature activo.
2. Si se proporciona `$1`, lee `specs/$1/tasks.md` y calcula el porcentaje de avance (tareas completadas vs pendientes).
3. Reporta el estado claro en formato Markdown y propone el comando exacto para continuar.
