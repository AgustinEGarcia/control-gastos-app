<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Protocolo de Proyecto (Modo Autónomo)
- Idioma: Toda interacción, explicación y documentación debe ser 100% en Español.
- Autonomía: Cuando el usuario pida avanzar o implementar una tarea, ejecútala DE PRINCIPIO A FIN sin frenar a pedir confirmaciones o aprobaciones intermedias. Reporta el resultado al finalizar.
- Al empezar, lee MEMORY.md para conocer el estado y docs/constitution.md para los principios.
- Al terminar una tarea, ejecuta pruebas (npm test) y actualiza MEMORY.md (~50 líneas máx).
- Commits: Usa OBLIGATORIAMENTE Conventional Commits (feat:, fix:, chore:, refactor:, docs:, test:).
- Seguridad y Datos: PROHIBIDO hardcodear credenciales, tokens o contraseñas. Usa SIEMPRE variables de entorno vacías en .env.example. Valida y sanitiza todo input de usuario (Zero Trust).
- Verificación y Calidad: Tras cada cambio relevante, verifica funcionalmente con Vitest y visualmente con Playwright.
