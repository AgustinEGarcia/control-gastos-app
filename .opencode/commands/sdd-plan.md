# Comando: /sdd-plan
Fase: Planificación
Agente: plan

## Parámetros
- `$1`: Identificador del feature (ej. `001-setup-y-core-financiero`).

## Propósito
Diseña la arquitectura técnica, funciones puras, esquema de datos, endpoints o componentes de UI y justificaciones técnicas en `specs/$1/plan.md`.

## Instrucciones para el Agente
1. Valida que `specs/$1/spec.md` esté en estado `aprobada`.
2. Modela la solución técnica: diagramas, interfaces TypeScript, funciones puras y contratos.
3. Si impacta en arquitectura global, añade referencia a `docs/adr/`.
4. Escribe `specs/$1/plan.md` y solicita aprobación antes de desglosar tareas.
