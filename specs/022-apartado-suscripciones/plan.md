# Plan de Arquitectura — Spec 022: Apartado de Suscripciones y Estimación Mensual

## 1. Modelo de Datos y Servicio (`src/lib/services/subscriptions.ts`)
- Tipo `Subscription`:
  - `id`: string
  - `user_id`: string
  - `name`: string
  - `amount`: number
  - `currency`: 'ARS' | 'USD'
  - `billing_day`: number (1 a 31)
  - `payment_method_id`: string | null
  - `category`: string (Streaming, Música, Software & IA, Almacenamiento, Fitness, Otros)
  - `is_active`: boolean
  - `notes`: string | null
  - `created_at`: string
- Persistencia resiliente con fallback en `localStorage` (Zero Downtime) para garantizar funcionamiento continuo si la tabla `subscriptions` no está aún creada en la base remota.
- Métodos del servicio:
  - `getSubscriptions(supabase)`
  - `createSubscription(supabase, input, userId)`
  - `updateSubscription(supabase, id, input)`
  - `toggleSubscriptionStatus(supabase, id, currentStatus)`
  - `deleteSubscription(supabase, id)`
  - `calculateSubscriptionSummary(subscriptions)`: Retorna `{ totalMonthlyArs, totalMonthlyUsd, activeCount, pausedCount, nextBillingItem }`.

## 2. Componentes UI (`src/components/subscriptions/`)
- `SubscriptionSummaryCards.tsx`: Tarjetas métricas (Total mensual estimado en ARS, Total mensual en USD, Suscripciones activas, Próximo cobro en radar).
- `SubscriptionForm.tsx`: Modal para crear/editar suscripción (nombre, importe, moneda ARS/USD, día de cobro, método de pago, categoría).
- `SubscriptionsTable.tsx`: Tabla minimalista técnica con badge de estado, toggle rápido pausar/activar, detalles y acciones (editar/eliminar).

## 3. Página Principal (`src/app/suscripciones/page.tsx`)
- Ruta protegida `/suscripciones`.
- Encabezado con estética Minimalismo Técnico.
- Botón "+ Nueva Suscripción".
- Filtro por estado (Todas / Activas / Pausadas).

## 4. Navegación (`src/components/layout/Navbar.tsx`)
- Incorporar el enlace "Suscripciones" tanto en escritorio como en el menú desplegable móvil.

## 5. Pruebas y Validación
- Pruebas unitarias de cálculo y validaciones: `src/lib/services/__tests__/subscriptions.test.ts`.
- Ejecución de `npm run build` para asegurar 100% de compatibilidad con Vercel.
- Ejecución de `npm test` para garantizar suite completa verde.
