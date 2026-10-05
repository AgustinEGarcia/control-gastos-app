# Comando: /sdd-clarify
Fase: Clarificación
Agente: plan

## Parámetros
- `$1`: Identificador del feature (ej. `001-setup-y-core-financiero`).

## Propósito
Audita la especificación existente como un QA y Security Senior para detectar ambigüedades, omisiones, fallos lógicos, vacíos de autenticación o casos límite antes de planificar.

## Instrucciones para el Agente
1. Lee `specs/$1/spec.md`.
2. Identifica puntos ciegos (ej. concurrencia, permisos RLS, pérdida de conexión, validaciones de montos negativos).
3. Presenta una lista de preguntas de clarificación al usuario.
4. Con las respuestas aprobadas, actualiza `specs/$1/spec.md`.
