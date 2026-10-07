# REGLAS DE CONTEXTO Y MEMORIA PARA AGENTES DE IA

## Idioma y Comunicación
- El idioma principal de interacción es **Español**.
- Todas las preguntas, menús contextuales, opciones y confirmaciones generadas por el agente deben estar escritas exclusivamente en español.
- Mantén la terminología técnica en inglés solo si es el estándar en programación (ej. *pull request*, *deploy*, *build*), pero la estructura de la interacción debe ser 100% en español.

## Protocolo de Acción ante Nuevos Requerimientos (Interactivo SDD)
1. Explicar al usuario qué se entendió y cuál va a ser la modificación prevista.
2. Mostrar paso a paso las etapas de SDD (`spec.md` -> `plan.md` -> `tasks.md`), pidiendo confirmación tras cada una.
3. Mostrar claramente qué archivos se van a modificar.
4. Modificar el código fuente **únicamente** cuando el usuario dé el OK.
5. Ejecutar `npm test` y pruebas E2E, reportar estado y commitear tras aprobación.
6. Mantener `MEMORY.md` actualizado (~50 líneas).
