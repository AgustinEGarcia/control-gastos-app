# Comando: /sdd-constitution
Fase: Constitución
Agente: plan

## Propósito
Genera o audita el archivo `docs/constitution.md` definiendo los principios innegociables del proyecto (incluyendo obligatoriamente principios de seguridad, privacidad y arquitectura).

## Instrucciones para el Agente
1. Revisa si `docs/constitution.md` existe y está actualizado.
2. Si no existe, realiza preguntas al usuario para consensuar los principios innegociables.
3. Asegura que al menos un principio esté enfocado en Seguridad, Privacidad de Datos y Zero Trust.
4. Redacta o actualiza el archivo y actualiza `MEMORY.md`.
