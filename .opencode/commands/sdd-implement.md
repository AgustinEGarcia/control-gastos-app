# Comando: /sdd-implement
Fase: Implementación
Agente: build

## Parámetros
- `$1`: Identificador del feature (ej. `001-setup-y-core-financiero`).
- `$2`: Número de tarea a ejecutar (ej. `T1`).

## Propósito
Implementa ÚNICAMENTE la tarea indicada ($2) aplicando TDD con el runner del proyecto (Vitest) y se detiene inmediatamente.

## Instrucciones para el Agente
1. Lee `specs/$1/tasks.md` y toma exclusivamente la tarea `$2`.
2. Escribe primero la prueba unitaria o de integración (en rojo).
3. Escribe el código mínimo necesario para poner el test en verde (`npm test`).
4. Marca la casilla `[x]` de `$2` en `specs/$1/tasks.md`.
5. Actualiza `MEMORY.md` y se DETIENE sin comenzar la siguiente tarea sin permiso.
