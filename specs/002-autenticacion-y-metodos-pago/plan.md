# Plan Técnico: Spec 002 — Autenticación y Métodos de Pago

## 1. Arquitectura de Autenticación
- **Middleware (`src/middleware.ts`):**
  - Utiliza `createServerClient` para actualizar la sesión de Supabase Auth en cada request.
  - Redirige a `/login` si se intenta acceder a rutas protegidas (`/metodos-pago`, etc.) sin sesión activa.
- **Páginas de Auth:**
  - `src/app/login/page.tsx`: Formulario unificado de Login y Registro (conmutador rápido), validación de email y contraseña.
  - `src/components/auth/AuthForm.tsx`: Componente interactivo con feedback visual de estados de carga y errores en español.

## 2. Módulo de Métodos de Pago
- **Servicios / Acciones:**
  - `src/lib/services/paymentMethods.ts`: Funciones puras y llamadas a Supabase:
    - `getPaymentMethods()`
    - `createPaymentMethod(data)`
    - `deletePaymentMethod(id)`
    - `validatePaymentMethodInput(data)`: Función pura con validaciones exhaustivas.
- **Componentes:**
  - `src/components/payment-methods/PaymentMethodCard.tsx`: Tarjeta visual con gradiente premium, indicación de "Propia" vs "De tercero", día de cierre y día de vencimiento.
  - `src/components/payment-methods/PaymentMethodForm.tsx`: Modal / Formulario con inputs para nombre, titular, cierre y vencimiento.
- **Página Principal:**
  - `src/app/metodos-pago/page.tsx`: Vista completa con listado, botón de crear, estados vacíos atractivos y feedback.
- **Navegación / Layout:**
  - `src/components/layout/Navbar.tsx`: Barra superior con logo, enlaces rápidos y perfil/cerrar sesión.

## 3. Pruebas Automatizadas
- **Vitest:** `src/lib/services/__tests__/paymentMethods.test.ts` evaluando la función de validación de datos (límites de días 1-31, titular requerido para tarjetas de terceros, etc.).
- **Playwright:** `e2e/auth-flow.spec.ts` validando la renderización de la página de login y la protección de rutas.
