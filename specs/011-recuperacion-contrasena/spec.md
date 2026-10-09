# Spec 011 — Recuperación y Restablecimiento de Contraseña
Estado: implementada

## Contexto, Usuarios e Historias de Usuario
- **Contexto**: Actualmente la aplicación cuenta con registro (`signUp`) e inicio de sesión (`signInWithPassword`) en `/login`, pero si un usuario olvida su contraseña no tiene ningún mecanismo para restablecerla de forma autónoma.
- **Usuario**: Usuario registrado en la plataforma que no recuerda sus credenciales de acceso.
- **Historia de Usuario (HU-1)**: Como usuario registrado que olvidó su contraseña, quiero ingresar mi correo electrónico en la pantalla de acceso para recibir un enlace de recuperación seguro.
- **Historia de Usuario (HU-2)**: Como usuario que recibió el enlace de recuperación, quiero acceder a una pantalla de actualización de contraseña para ingresar y confirmar mi nueva clave, recuperando el acceso a mi cuenta.

## Definiciones, Casos Límite y Fuera de Alcance
- **Definiciones**:
  - `resetPasswordForEmail`: Método de Supabase Auth que despacha un email con enlace temporal con token de recuperación (`type=recovery`).
  - `updateUser`: Método de Supabase Auth ejecutado en sesión activa o token de recuperación para establecer la nueva contraseña.
- **Casos límite**:
  - Email inexistente en Supabase: Supabase por seguridad suele no divulgar si el correo existe o no; la interfaz mostrará un mensaje claro e instructivo ("Si el correo está registrado, recibirás un enlace de recuperación").
  - Enlace de recuperación expirado o inválido: Mostrar error amigable y botón para solicitar un nuevo enlace.
  - Contraseñas que no coinciden o de menos de 6 caracteres: Validación en tiempo real en el formulario.
  - Usuario logueado que intenta ingresar a la recuperación: Permitir actualizar contraseña o redirigir de forma coherente.
- **Fuera de alcance**:
  - Autenticación multifactor (MFA/2FA) o inicio de sesión social (OAuth con Google/GitHub).
  - Envío de SMS o recuperación vía WhatsApp.

## Requisitos No Funcionales y de Seguridad
- **Cifrado y Autenticación**: Manejo delegado a Supabase Auth; nunca viajarán contraseñas en texto plano por canales no seguros.
- **Validación**: Mínimo 6 caracteres para la nueva contraseña.
- **Alineación Visual**: Interfaz oscura con estética Glassmorphism, Tailwind CSS y componentes consistentes con la pantalla de `/login`.
- **Accesibilidad y UX**: Feedback visual inmediato (spinners de carga, alertas de error y éxito diferenciadas con iconos).

## Requisitos Funcionales (EARS)
- **RF-1**: CUANDO el usuario haga clic en "¿Olvidaste tu contraseña?" en `/login`, EL SISTEMA debe mostrar el formulario de solicitud de recuperación por correo.
- **RF-2**: CUANDO el usuario envíe su correo electrónico en el formulario de recuperación, EL SISTEMA debe invocar `supabase.auth.resetPasswordForEmail` redirigiendo a la ruta `/actualizar-contrasena` y mostrar un mensaje de éxito indicando que revise su bandeja de entrada.
- **RF-3**: CUANDO el usuario acceda a `/actualizar-contrasena` con un token de recuperación válido, EL SISTEMA debe presentar un formulario para ingresar la nueva contraseña y su confirmación.
- **RF-4**: CUANDO el usuario envíe una nueva contraseña válida (>= 6 caracteres y coincidente con la confirmación), EL SISTEMA debe invocar `supabase.auth.updateUser({ password })` y, ante éxito, mostrar confirmación y botón para ir a `/login` o redirigir al `/dashboard`.
- **RF-5**: SI las contraseñas no coinciden o tienen menos de 6 caracteres, ENTONCES EL SISTEMA debe bloquear el envío y mostrar un mensaje de advertencia.
- **RF-6**: SI el enlace de recuperación es inválido o ha expirado, ENTONCES EL SISTEMA debe mostrar un mensaje descriptivo y un enlace para solicitar un nuevo correo de restablecimiento.
