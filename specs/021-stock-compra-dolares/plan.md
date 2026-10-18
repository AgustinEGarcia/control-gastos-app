# Plan de Arquitectura — Spec 021: Módulo de Stock y Compras de Dólares (USD)

## 1. Modelo de Datos y Servicio (`src/lib/services/dollarPurchases.ts`)
- Tipo `DollarPurchase`:
  - `id`: string
  - `user_id`: string
  - `purchase_date`: string (YYYY-MM-DD)
  - `amount_usd`: number
  - `exchange_rate`: number
  - `total_ars`: number
  - `notes`: string | null
  - `created_at`: string
- Tabla Supabase: `dollar_purchases`
  - Incluir persistencia local resiliente con `localStorage` (fallback Zero Downtime) en caso de que la tabla aún no esté creada en la base de datos de producción/remota, permitiendo funcionamiento inmediato tanto en desarrollo local como en producción sin interrupciones.
- Funciones del servicio:
  - `getDollarPurchases(supabase)`
  - `createDollarPurchase(supabase, input, userId)`
  - `updateDollarPurchase(supabase, id, input)`
  - `deleteDollarPurchase(supabase, id)`
  - `calculateDollarSummary(purchases)`: Retorna `{ totalUsd, averageRate, totalArs, count }`.

## 2. Componentes UI (`src/components/dollars/`)
- `DollarSummaryCards.tsx`: Tarjetas de resumen métrico (Total USD en stock, Cotización promedio de compra, Total ARS invertidos, Operaciones).
- `DollarPurchaseForm.tsx`: Modal para registrar o editar una compra (con fecha de hoy por defecto, inputs numéricos y cálculo automático de total en ARS).
- `DollarPurchasesTable.tsx`: Historial cronológico con diseño minimalista técnico, badges de origen, formato monoespaciado y botones de editar/eliminar.

## 3. Página Principal (`src/app/dolares/page.tsx`)
- Ruta `/dolares` protegida por autenticación.
- Encabezado minimalista con título `/ Stock y Compras de Dólares (USD)`.
- Botón primario blanco "+ Registrar Compra".
- Integración de cards de resumen y tabla de historial.

## 4. Navegación (`src/components/layout/Navbar.tsx`)
- Añadir el enlace "Dólares" tanto en el menú horizontal de escritorio como en el menú desplegable móvil.

## 5. Pruebas Unitarias
- `src/lib/services/__tests__/dollarPurchases.test.ts`: Pruebas para cálculos de promedio ponderado, validaciones de montos y operaciones CRUD.
