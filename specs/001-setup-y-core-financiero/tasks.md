# Checklist de Tareas: Spec 001

- [ ] **T1. Generar tipos TypeScript de base de datos en `src/types/database.types.ts`.** Hecho cuando: Las 8 tablas del script SQL de `docs/OPENSPEC.md` están fuertemente tipadas y compilan sin errores.
- [ ] **T2. Implementar cliente Supabase para navegador en `src/lib/supabase/client.ts`.** Hecho cuando: La función `createClient` exporta una instancia válida de `@supabase/ssr` y tiene test unitario en verde.
- [ ] **T3. Implementar cliente Supabase para servidor en `src/lib/supabase/server.ts`.** Hecho cuando: La función asíncrona gestiona cookies según el estándar de Next.js App Router.
- [ ] **T4. Configurar variables locales en `.env.local` y validar conexión.** Hecho cuando: Se conecta exitosamente a la instancia remota de Supabase con credenciales provistas por el usuario.
