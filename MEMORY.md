# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Setup base completado: Next.js 16, TypeScript, Tailwind CSS v4, Vitest, Playwright y Supabase instalados.
- Arquitectura SDD configurada: Gobernanza, ADRs, constitución, skills y comandos CLI activos.
- Repositorio Git inicializado y sincronizado con GitHub (`main`).

## Decisiones (y por qué)
- Stack costo $0: Next.js + Supabase + Tailwind + Resend + Vitest + Playwright (Ver docs/adr/0001-stack-tecnologico-base.md).
- Gobernanza SDD: La spec manda; todo incremento se divide en specs/NNN-*/ con formato EARS.
- Doble testing: Vitest para lógica y Playwright para E2E con Chromium.

## Aprendizajes y errores a evitar
- Instalar Node.js LTS en Windows requirió ajustar PATH y ejecución de scripts en PowerShell.
- Aislar rutas de pruebas en vitest.config.ts para evitar colisiones con tests E2E de Playwright.
- Evitar almacenar o compartir tokens en texto plano (Zero Trust).

## Próximos pasos
- Ejecutar script SQL de docs/OPENSPEC.md en el SQL Editor de Supabase.
- Configurar credenciales del proyecto en .env.local.
- Iniciar implementación de specs/001-setup-y-core-financiero/.
