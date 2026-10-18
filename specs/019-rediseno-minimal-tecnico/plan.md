# Plan de Implementación — Spec 019: Rediseño Estético Integral: Minimalismo Técnico

## 1. Enfoque General y Directrices de Diseño
El objetivo es transformar la interfaz de usuario de todas las vistas hacia el estilo **Minimalismo Técnico (inspirado en Linear y Vercel)** sin alterar la lógica de negocio, cálculos de saldos ni contratos de datos existentes.
Todos los selectores accesibles, roles, etiquetas y `data-testid` utilizados en las suites de pruebas (Vitest y Playwright) se preservarán rigurosamente para garantizar 100% de tests en verde.

### Tokens de Diseño Minimalista Técnico:
- **Base y Superficie**:
  - Fondo global: `bg-black` o `bg-zinc-950`.
  - Tarjetas principales: `bg-zinc-950 border border-zinc-800/80 rounded-xl`.
  - Superficies internas / métricas: `bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-3 sm:p-4`.
- **Tipografía y Jerarquía**:
  - Cifras monetarias, balances, cuotas y fechas: `font-mono tracking-tight font-semibold`.
  - Etiquetas y subtítulos: `text-xs uppercase tracking-wider text-zinc-400 font-medium`.
  - Textos de lectura: `text-zinc-100` (primario), `text-zinc-400` (secundario), `text-zinc-500` (discreto).
- **Botones y Acciones**:
  - Principal (Primary): `bg-white text-zinc-950 hover:bg-zinc-200 font-medium text-xs sm:text-sm px-3.5 py-2 rounded-lg transition-colors`.
  - Secundario / Contorno: `bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-xs sm:text-sm px-3 py-1.5 rounded-lg transition-colors`.
  - Peligro / Eliminar: `bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs px-2.5 py-1.5 rounded-lg transition-colors`.
- **Badges Semánticos Discretos**:
  - Pagado / Cobrado: `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded font-mono`.
  - Pendiente: `bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2 py-0.5 rounded font-mono`.
  - Vencido / Desvío: `bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs px-2 py-0.5 rounded font-mono`.

---

## 2. Fases de Implementación y Archivos Involucrados

### Fase 1: Shell y Navegación Global
- **Archivo**: `src/components/layout/Navbar.tsx`
  - Reemplazar estilos saturados por barra superior sobria: `border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md`.
  - Navegación con links en `text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50` y estado activo en `bg-zinc-900 border border-zinc-700/60 text-white`.
  - Retirar el enlace temporal `/estilos-demo` del Navbar.

### Fase 2: Dashboard y Componentes de Resumen Mensual
- **Archivos**:
  - `src/components/dashboard/MonthSelector.tsx`: Selector sobrio con botones `bg-zinc-900 border border-zinc-800` y tipografía monoespaciada para el mes/año.
  - `src/components/dashboard/DashboardMetricCards.tsx`: Cards de métricas con bordes `border-zinc-800/80`, tipografía `font-mono` para cifras de pagar/pagado/pendiente, sin sombras pesadas.
  - `src/components/dashboard/PaymentMethodTotals.tsx`: Resumen por método en tarjetas compactas grafito.
  - `src/components/dashboard/MonthlyDueList.tsx`: Tablas y listas de vencimientos con filas de 1px border, badges minimalistas de estado y botones de acción rápida pulidos.
  - `src/components/dashboard/VariableExpenseModal.tsx`: Modal con fondo `bg-zinc-950`, borde `border-zinc-800`, inputs `bg-zinc-900 border-zinc-800`.

### Fase 3: Gastos Recurrentes / Fijos
- **Archivos**:
  - `src/components/recurring-expenses/ExpenseSummaryCards.tsx`: Tarjetas de totales en `bg-zinc-950 border-zinc-800` con `font-mono`.
  - `src/components/recurring-expenses/ExpenseCard.tsx`: Tarjeta individual de gasto recurrente en estilo técnico minimalista.
  - `src/components/recurring-expenses/ExpenseForm.tsx`: Formulario de alta/edición con inputs estructurados y botón primario de alto contraste.

### Fase 4: Tarjetas y Transacciones en Cuotas
- **Archivos**:
  - `src/components/transactions/TransactionSummaryCards.tsx`: KPIs con bordes precisos y valores numéricos tabulares.
  - `src/components/transactions/TransactionCard.tsx` y `TransactionRow.tsx`: Visualización de compras en cuotas con indicador de progreso sobrio y badges discretos.
  - `src/components/transactions/TransactionForm.tsx` y `EditTransactionModal.tsx`: Formularios y modal de edición adaptados a la estética Linear/Vercel.

### Fase 5: Préstamos Personales y Portal de Deudores
- **Archivos**:
  - `src/components/loans/LoanSummaryCards.tsx`, `LoanCard.tsx`, `LoanForm.tsx`, `LoanRepaymentModal.tsx`.
  - `src/components/debtors/DebtorSummaryCards.tsx`, `DebtorCard.tsx`, `PaymentReceivedModal.tsx`.
  - `src/components/payment-methods/PaymentMethodCard.tsx`, `PaymentMethodForm.tsx`.
  - `src/components/alerts/AlertsOverview.tsx`.

### Fase 6: Validación, Pruebas y Limpieza
- Ejecución completa de suite de pruebas unitarias (`npm test`) y pruebas E2E (`npm run test:e2e`).
- Eliminar la ruta temporal `src/app/estilos-demo/` tras validar que toda la app adoptó el diseño.

---

## 3. Criterios de Aceptación
1. Toda la app luce una estética sobria, unificada y de alta gama en fondo grafito/negro con bordes de 1px.
2. Todas las cifras numéricas y fechas clave utilizan `font-mono` para legibilidad técnica.
3. Los botones de acción responden con estilo de alto contraste (`bg-white` para principal).
4. El 100% de las pruebas unitarias y E2E continúan pasando satisfactoriamente.
