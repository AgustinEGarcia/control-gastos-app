# Plan Técnico de Implementación — Spec 013: Gastos Variables Mensuales y Bolsa de Gastos Varios

## 1. Arquitectura de Datos y Persistencia

### 1.1 Esquema de Base de Datos (Supabase)
```sql
CREATE TABLE IF NOT EXISTS variable_monthly_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    year INT NOT NULL,
    month INT NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT 'Gastos Varios',
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    items JSONB DEFAULT '[]'::jsonb,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_variable_expense_month UNIQUE (user_id, year, month)
);

ALTER TABLE variable_monthly_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin Full Access" ON variable_monthly_expenses FOR ALL USING (auth.uid() = user_id);
```

### 1.2 Servicio Resiliente (`src/lib/services/variableExpenses.ts`)
- Modelo TypeScript:
  ```ts
  export interface VariableExpenseItem {
    id: string;
    label: string;
    amount: number;
  }

  export interface VariableMonthlyExpense {
    id?: string;
    year: number;
    month: number;
    name: string;
    amount: number;
    items: VariableExpenseItem[];
    is_paid: boolean;
  }
  ```
- Estrategia Zero Downtime:
  - Lee y escribe en Supabase; si la tabla no existe aún en remoto (código `42P01`), sincroniza con `localStorage` con clave `variable_expense_${year}_${month}` para disponibilidad 100% inmediata.

---

## 2. Capa de Servicios y Consolidación (`src/lib/services/dashboard.ts`)

- Extensión de `MonthlyDueItem`:
  - `type`: `'recurring' | 'installment_own' | 'installment_shared' | 'variable'`.
- Extensión de `MonthlyConsolidatedSummary`:
  - `totalVariable: number`: subtotal de gastos variables del mes.
  - `totalOwnToPay = totalRecurring + totalInstallmentsOwn + totalVariable`.
- Integración en `calculateMonthlyConsolidated`:
  - Recibe `variableExpense?: VariableMonthlyExpense | null`.
  - Si `variableExpense && variableExpense.amount > 0`:
    - Incorpora el ítem en la lista cronológica con badge especial.
    - Suma a los totales propios (`totalOwnToPay`), abonados y pendientes.

---

## 3. Capa de Interfaz de Usuario (UI)

### 3.1 Componente Modal/Drawer: `VariableExpenseModal.tsx`
- Acceso directo desde el Dashboard con botón "+ Gastos Varios del Mes".
- Modos:
  1. **Monto Directo**: Campo de importe para cargar una suma fija rápida (ej. `$1.000.000`).
  2. **Desglose de Conceptos**: Lista dinámica donde el usuario puede añadir sub-conceptos (ej. *Supermercado*, *Combustible*, *Peluquería*) con cálculo de sumatoria automática en tiempo real.
- Botón para guardar con persistencia instantánea.

### 3.2 Actualización de `DashboardMetricCards.tsx`
- En la tarjeta **Total Gastos del Mes**, incluir el desglose:
  - Gastos Fijos: `$X`
  - Cuotas Propias: `$Y`
  - Gastos Variables: `$Z` (si > 0).

### 3.3 Actualización de `MonthlyDueList.tsx` y `page.tsx`
- Soporte para tipo `'variable'` con badge violeta/púrpura `"Gasto Variable"`.
- Marcado de pago directo conectado al handler `onTogglePaid`.

---

## 4. Estrategia de Pruebas
1. **Pruebas Unitarias (Vitest)**:
   - `src/lib/services/variableExpenses.test.ts`: test de cálculo de sumatoria de ítems, guardado y fallback local.
   - `src/lib/services/dashboard.test.ts`: test de consolidación con gastos variables sumando a los totales propios del mes.
2. **Pruebas E2E (Playwright)**:
   - `e2e/variable-expenses.spec.ts`: test de navegación y visualización de la opción de gastos variables en el Dashboard.
