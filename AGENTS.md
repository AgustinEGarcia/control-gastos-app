<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Protocolo de Proyecto (Flujo Interactivo SDD con Confirmaciones Paso a Paso)
- **Idioma**: Toda interacción, explicación y documentación debe ser 100% en Español.
- **Flujo Obligatorio ante Nuevos Requerimientos**:
  1. **Explicación Inicial**: Explicar qué se entendió del requerimiento y cuál será la modificación prevista.
  2. **Etapas SDD Paso a Paso**: Ir mostrando cada artefacto (`specs/xxx/spec.md`, `plan.md`, `tasks.md`).
  3. **Confirmación en Cada Etapa**: Pedir la confirmación del usuario para validar que todo esté alineado antes de seguir a la siguiente etapa.
  4. **Detalle de Cambios**: Mostrar exactamente qué archivos, funciones y componentes se van a modificar.
  5. **Modificación de Código**: Iniciar la edición de código ÚNICAMENTE tras el OK expreso del usuario.
  6. **Pruebas y Commit**: Ejecutar pruebas (`npm test`, `npm run test:e2e`), reportar resultados y, tras el visto bueno, realizar el commit con Conventional Commits.
- **Memoria y Principios**: Al empezar, consultar `MEMORY.md` y `docs/constitution.md`.
- **Commits**: Usar OBLIGATORIAMENTE Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`).
- **Seguridad**: PROHIBIDO hardcodear credenciales. Usar variables de entorno y sanitizar inputs (Zero Trust).
- **Calidad**: Mantener pruebas unitarias (Vitest) y E2E (Playwright) al 100% verdes.
