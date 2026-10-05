# Spec 001 — Conexión con Supabase y Clientes de Datos
Estado: aprobada

## Contexto, Usuarios e Historias
Como desarrollador y usuario del sistema, necesito establecer una conexión segura y tipada entre Next.js y Supabase para permitir la persistencia de datos financieros (gastos, tarjetas, préstamos) y la autenticación con políticas RLS.

- **HU-1:** Como usuario, quiero que la aplicación se conecte de forma segura a mi instancia de Supabase en la nube usando variables de entorno para que mis transacciones y datos queden centralizados.
- **HU-2:** Como desarrollador, quiero contar con clientes de Supabase optimizados para Next.js App Router (cliente de navegador y cliente de servidor) para respetar el modelo de Server Components y Server Actions de forma segura.

## Definiciones, Casos límite y Fuera de alcance
- **Definiciones:**
  - *Cliente Browser:* Instancia creada con `createBrowserClient` de `@supabase/ssr` para Client Components.
  - *Cliente Server:* Instancia creada con `createServerClient` de `@supabase/ssr` para Server Components / Server Actions con manejo de cookies.
- **Casos límite:**
  - Variables de entorno no configuradas o con formato incorrecto.
  - Conexión caída o interrupción de red al contactar Supabase.
- **Fuera de alcance en esta spec:**
  - Pantallas complejas de dashboards o vistas de deudores (se abordarán en specs posteriores).

## Requisitos No Funcionales y de Seguridad
- **RNF-1 (Zero Trust):** La clave anónima pública (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) solo tiene permisos definidos por RLS. En ningún caso se debe exponer `SERVICE_ROLE_KEY` en el frontend.
- **RNF-2 (Tipado Estricto):** Las llamadas al cliente de Supabase deben admitir o inferir las definiciones de TypeScript de las tablas de la base de datos.
- **RNF-3 (Costo $0):** La conexión debe operar 100% sobre el free-tier de Supabase.

## Requisitos Funcionales (EARS)
- **RF-1 (Permanente):** EL SISTEMA mantendrá las credenciales de conexión (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`) aisladas en `.env.local`, fuera del control de versiones.
- **RF-2 (Evento):** CUANDO un Client Component requiera interactuar con Supabase, EL SISTEMA proveerá un cliente instanciado mediante `@supabase/ssr` compatible con el ciclo de vida del navegador.
- **RF-3 (Evento):** CUANDO un Server Component o Server Action requiera interactuar con Supabase, EL SISTEMA proveerá un cliente de servidor con acceso a las cookies de sesión HTTP-only.
- **RF-4 (Condición no deseada):** SI alguna variable de entorno obligatoria de Supabase no está definida, ENTONCES EL SISTEMA lanzará un error descriptivo en tiempo de ejecución impidiendo operaciones inseguras.
