# Tareas de Implementación — Spec 011: Recuperación y Restablecimiento de Contraseña

- [x] **Tarea 1: Servicio de Autenticación (`auth.ts`) y Pruebas Unitarias**
  - Crear `src/lib/services/auth.ts` con funciones `validatePassword`, `requestPasswordReset` y `updateUserPassword`.
  - Crear `src/lib/services/auth.test.ts` con pruebas unitarias en Vitest para validar reglas y flujos de error/éxito.
  - Hecho cuando: `npm test src/lib/services/auth.test.ts` pase al 100%.

- [x] **Tarea 2: Ajuste de Middleware (`src/middleware.ts`)**
  - Configurar `/actualizar-contrasena` en las rutas permitidas de auth para que no sea interceptada ni redirigida a `/dashboard` ni requiera autenticación previa.
  - Hecho cuando: El middleware no bloquee el acceso a `/actualizar-contrasena`.

- [x] **Tarea 3: Formulario de Solicitud de Recuperación en `/login`**
  - En `src/app/login/page.tsx`, agregar modo `forgot_password` con enlace "¿Olvidaste tu contraseña?".
  - Implementar envío de correo con feedback de éxito/error y botón de retorno al login.
  - Hecho cuando: El usuario pueda solicitar el correo de recuperación desde la UI de login.

- [x] **Tarea 4: Página de Restablecimiento (`src/app/actualizar-contrasena/page.tsx`)**
  - Crear vista moderna con Glassmorphism para ingresar y confirmar la nueva clave.
  - Validaciones de longitud mínima y coincidencia, manejo de sesión con Supabase Auth y feedback visual.
  - Hecho cuando: La página permita ingresar una nueva clave y ejecutar `updateUser`.

- [x] **Tarea 5: Pruebas E2E y Verificación Completa de la Suite**
  - Crear `e2e/auth-reset.spec.ts` verificando el flujo en la UI.
  - Ejecutar `npx tsc --noEmit`, `npm test` y `npm run test:e2e` asegurando que no existan regresiones.
  - Hecho cuando: Toda la suite pase al 100% en verde.

- [x] **Tarea 6: Cierre, Memoria y Commit**
  - Actualizar `MEMORY.md` (~50 líneas).
  - Realizar commit con Conventional Commits (`feat(auth): implementar recuperacion y restablecimiento de contrasena`).
