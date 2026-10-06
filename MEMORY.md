# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Setup base y arquitectura SDD completados al 100%.
- Conexión con Supabase implementada y validada (Spec 001 cerrada): clientes `@supabase/ssr` (browser y server) y tipos en `src/types/database.types.ts`.
- Pruebas unitarias de Vitest al 100% (4 pruebas en verde).

## Decisiones (y por qué)
- Configuración de clientes Supabase con `@supabase/ssr` para compatibilidad nativa con App Router y cookies HTTP-only.
- Modo autónomo de ejecución adoptado para avanzar sin bloqueos intermedios.
- Credenciales seguras en `.env.local` sin exponer datos confidenciales.

## Aprendizajes y errores a evitar
- Supabase actualizó la denominación de anon key a "Publishable key" (`sb_publishable_...`).
- Mantener la URL base limpia sin `/rest/v1/` en `NEXT_PUBLIC_SUPABASE_URL`.

## Próximos pasos
- Iniciar Spec 002: Autenticación de Usuarios (Login/Registro con Supabase Auth) y Gestión de Métodos de Pago.
