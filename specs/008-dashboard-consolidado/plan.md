# Plan de Implementación — Spec 008: Dashboard Consolidado Mensual 360°

## 1. Arquitectura y Componentes
- **Servicio de Datos (`src/lib/services/dashboard.ts`):**
  - Tipos:
    - `MonthFilter`: `{ year: number; month: number }` (mes 1 a 12).
    - `MonthlyDueItem`: Elemento cronológico del mes (título, tipo 'recurring' | 'installment_own' | 'installment_shared', monto, día del mes, fecha completa, pagado/pendiente, tarjeta o categoría, persona beneficiaria si aplica).
    - `MonthlyConsolidatedSummary`:
      - `totalOwnToPay`: Total propio a pagar (Gastos Fijos + Cuotas Propias).
      - `totalRecurring`: Subtotal gastos fijos.
      - `totalInstallmentsOwn`: Subtotal cuotas propias.
      - `totalSharedToCollect`: Total a cobrar a terceros por cuotas prestadas.
      - `totalCommitmentsCount`: Conteo total de pagos en el mes.
      - `paidCommitmentsCount`: Conteo de pagos ya saldados en el mes.
      - `percentageCompleted`: Porcentaje de compromisos cubiertos.
  - Funciones de cálculo:
    - `calculateMonthlyConsolidated(expenses, transactions, year, month)`: Lógica pura desacoplada para filtrado y agregación matemática.
- **Componentes UI:**
  - `src/components/dashboard/MonthSelector.tsx`: Selector con botones previo/siguiente y display del mes actual en español (ej. "Marzo 2026").
  - `src/components/dashboard/DashboardMetricCards.tsx`: 3 KPIs principales (Total a Pagar Propio, Total a Cobrar a Terceros, Progreso del Mes).
  - `src/components/dashboard/MonthlyDueList.tsx`: Listado cronológico de vencimientos por día con badges visuales e indicación de pagos realizados vs pendientes.
- **Páginas y Navegación:**
  - Actualizar `src/app/page.tsx` para renderizar el Dashboard dinámicamente si hay sesión activa, o la Landing Page si no la hay.
  - Crear ruta `/dashboard` (protegida) y enlace en `Navbar.tsx` para acceso instantáneo desde cualquier lugar de la app.
  - Actualizar `middleware.ts` para proteger `/dashboard`.

## 2. Estrategia de Testing (Vitest & Playwright)
- **Unit Testing con Vitest (`src/lib/services/dashboard.test.ts`):**
  - Filtrado exacto de cuotas correspondientes al mes y año seleccionado.
  - Exclusión de gastos inactivos.
  - Separación contable entre cuotas propias y cuotas prestadas a terceros.
  - Cálculo de sumatorias y porcentajes de pago del mes.
- **End-to-End con Playwright (`e2e/dashboard.spec.ts`):**
  - Landing page pública en `/` para usuarios anónimos.
  - Redirección de `/dashboard` a `/login` para anónimos.
  - Navbar con enlace a "Dashboard".
