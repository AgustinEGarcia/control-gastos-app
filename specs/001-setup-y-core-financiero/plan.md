# Plan Técnico: Spec 001 — Conexión con Supabase y Clientes de Datos

## Arquitectura de Clientes
Siguiendo las mejores prácticas de Next.js App Router y `@supabase/ssr`, se estructurarán dos clientes dedicados bajo `src/lib/supabase/`:

1. `src/lib/supabase/client.ts`:
   - Utiliza `createBrowserClient` de `@supabase/ssr`.
   - Función pura `createClient()` para Client Components ('use client').
2. `src/lib/supabase/server.ts`:
   - Utiliza `createServerClient` de `@supabase/ssr` junto con `cookies()` de `next/headers`.
   - Función asíncrona para Server Components, Route Handlers y Server Actions.
3. `src/types/database.types.ts`:
   - Contratos TypeScript de las 8 tablas definidas en `docs/OPENSPEC.md`.

## Validación de Variables de Entorno
- Crear función utilitaria para verificar la presencia de `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, lanzando un error claro si faltan.

## Estrategia de Testing (TDD)
- **Unit Test:** `src/lib/supabase/__tests__/client.test.ts` verificando que la inicialización valida correctamente las variables requeridas y devuelve una instancia válida.
