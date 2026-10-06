# Spec 002 — Autenticación y Métodos de Pago
Estado: implementada

## Contexto, Usuarios e Historias
Como usuario del Control Financiero 360°, necesito autenticarme de forma segura y gestionar mis métodos de pago (tarjetas de crédito propias, de terceros, Mercado Crédito y efectivo) con sus fechas de cierre y vencimiento para poder asociar mis compras y gastos futuros.

- **HU-1:** Como usuario, quiero registrarme e iniciar sesión con mi correo y contraseña para tener acceso exclusivo a mis finanzas protegidas por RLS.
- **HU-2:** Como usuario, quiero registrar métodos de pago indicando si son propios o prestados por terceros, y sus días de cierre y vencimiento.
- **HU-3:** Como usuario, quiero ver la lista de mis métodos de pago en tarjetas visuales modernas y poder eliminarlos o editarlos.

## Definiciones, Casos límite y Fuera de alcance
- **Definiciones:**
  - *Día de Cierre:* Día del mes (1 a 31) en que se emite el resumen de la tarjeta.
  - *Día de Vencimiento:* Día del mes (1 a 31) límite para abonar el saldo sin punitorios.
- **Casos límite:**
  - Días de cierre o vencimiento fuera del rango 1-31.
  - Nombre del método de pago vacío o con espacios en blanco.
  - Intentos de acceso sin autenticación a rutas protegidas.
- **Fuera de alcance en esta spec:**
  - Carga masiva de transacciones o cuotas (se abordará en Spec 003).

## Requisitos No Funcionales y de Seguridad
- **RNF-1 (Zero Trust & RLS):** Toda consulta a `payment_methods` se filtra automáticamente por `auth.uid() = user_id`.
- **RNF-2 (Sanitización):** Todo input de formulario se limpia de caracteres peligrosos y se valida antes de persistir.
- **RNF-3 (Aesthetic Premium):** Diseño de tarjetas visuales simulando plásticos bancarios con gradientes oscuros y microinteracciones fluidas.

## Requisitos Funcionales (EARS)
- **RF-1 (Evento):** CUANDO el usuario envía credenciales válidas en la pantalla de login, EL SISTEMA inicia su sesión y lo redirige a la vista principal.
- **RF-2 (Permanente):** MIENTRAS la sesión esté activa, EL SISTEMA mostrará los métodos de pago pertenecientes exclusivamente a ese usuario.
- **RF-3 (Evento):** CUANDO el usuario completa el formulario de nuevo método de pago con datos válidos, EL SISTEMA guarda el registro y actualiza la lista inmediatamente.
- **RF-4 (Condición no deseada):** SI el día de cierre o vencimiento es menor a 1 o mayor a 31, ENTONCES EL SISTEMA bloquea el envío y muestra un mensaje de error explicativo en español.
- **RF-5 (Evento):** CUANDO el usuario presiona "Cerrar sesión", EL SISTEMA destruye la cookie de sesión y lo redirige a la pantalla de login.
