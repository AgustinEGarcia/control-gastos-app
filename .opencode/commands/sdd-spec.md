# Comando: /sdd-spec
Fase: Especificación
Agente: plan

## Parámetros
- `$1`: Identificador y nombre del feature (ej. `001-setup-y-core-financiero`).

## Propósito
Realiza una entrevista interactiva (una pregunta por vez) al usuario para capturar el QUÉ y el POR QUÉ de la funcionalidad y redactar `specs/$1/spec.md` en formato estricto EARS.

## Instrucciones para el Agente
1. Crea la carpeta `specs/$1/` si no existe.
2. Formula preguntas acotadas sobre actores, historias de usuario y casos límite.
3. Redacta `specs/$1/spec.md` organizando Requisitos Funcionales en formato EARS (CUANDO, MIENTRAS, SI... ENTONCES).
4. Incluye Requisitos No Funcionales y de Seguridad específicos del módulo.
5. Marca el estado de la spec como `borrador` y solicita aprobación.
