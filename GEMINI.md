# REGLAS DE CONTEXTO Y MEMORIA PARA AGENTES DE IA

## Idioma y Comunicación
- El idioma principal de interacción es **Español**.
- Todas las preguntas, menús contextuales, opciones y confirmaciones generadas por el agente deben estar escritas exclusivamente en español.
- Mantén la terminología técnica en inglés solo si es el estándar en programación (ej. *pull request*, *deploy*, *build*), pero la estructura de la interacción debe ser 100% en español.

## Protocolo de Acción
Antes de realizar cualquier acción:
1. Lee `docs/PRD.md` y `docs/OPENSPEC.md` para entender el negocio y las reglas técnicas.
2. Lee `docs/MEMORY.md` para identificar la tarea inmediata y el estado actual.
3. Al finalizar una tarea, ejecuta `npm test` y actualiza `docs/MEMORY.md` con los avances.
