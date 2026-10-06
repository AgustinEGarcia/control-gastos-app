# Checklist de Tareas: Spec 002

- [x] **T1. Implementar validador de métodos de pago y pruebas unitarias.** Hecho cuando: `validatePaymentMethodInput` tiene suite de pruebas con Vitest en verde.
- [x] **T2. Implementar servicio de métodos de pago en `src/lib/services/paymentMethods.ts`.** Hecho cuando: Las funciones CRUD para Supabase están tipadas y exportadas.
- [x] **T3. Implementar Middleware de autenticación y sesión en `src/middleware.ts`.** Hecho cuando: Las cookies de sesión se refrescan automáticamente en peticiones de Next.js.
- [x] **T4. Crear componentes de UI para Login y Registro en `src/app/login/page.tsx`.** Hecho cuando: El formulario permite iniciar sesión o registrarse con feedback visual en español.
- [x] **T5. Crear componentes visuales de Métodos de Pago y página en `src/app/metodos-pago/page.tsx`.** Hecho cuando: La página renderiza el grid de tarjetas y el formulario de alta con diseño premium.
- [x] **T6. Crear Navbar y actualizar Layout principal.** Hecho cuando: La barra superior permite navegar entre módulos y cerrar sesión.
- [x] **T7. Validar con pruebas unitarias y E2E de Playwright.** Hecho cuando: `npm test` y `npm run test:e2e` pasan al 100%.
