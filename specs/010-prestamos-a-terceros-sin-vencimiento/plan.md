# Plan Técnico de Implementación — Spec 010: Préstamos de Dinero a Terceros sin Fecha de Vencimiento

## 1. Arquitectura de Datos y Migración Supabase

### 1.1 Extensión de la Tabla `personal_loans`
Para no fragmentar el modelo ni duplicar tablas de abonos, enriquecemos la tabla existente `personal_loans`:
- **`loan_type VARCHAR(20) NOT NULL DEFAULT 'borrowed'`**:
  - `'borrowed'`: Préstamo recibido (un tercero le prestó dinero al usuario).
  - `'lent'`: Préstamo otorgado (el usuario le prestó dinero a un tercero).
- **`expected_return_date DATE NULL`**:
  - Fecha estimada de devolución. Si es `NULL`, representa *"Sin fecha fija / A término abierto"*.
- Script SQL compatible y retroactivo:
  ```sql
  ALTER TABLE personal_loans 
  ADD COLUMN IF NOT EXISTS loan_type VARCHAR(20) NOT NULL DEFAULT 'borrowed';

  ALTER TABLE personal_loans 
  ADD COLUMN IF NOT EXISTS expected_return_date DATE NULL;
  ```

---

## 2. Capa de Servicios (`src/lib/services/`)

### 2.1 Actualización de `src/lib/services/loans.ts`
- Extender la interfaz `PersonalLoan`:
  ```ts
  export interface PersonalLoan {
    // ... campos existentes
    loan_type: 'borrowed' | 'lent';
    expected_return_date: string | null;
  }
  ```
- Extender `PersonalLoanInput` con `loan_type?: 'borrowed' | 'lent'` y `expected_return_date?: string | null`.
- Soporte para listar préstamos otorgados: `getPersonalLoans(supabase, { type?: 'borrowed' | 'lent' })`.
- Mantener la compatibilidad y fallback si las nuevas columnas no estuvieran creadas en PostgREST remoto.

### 2.2 Actualización de `src/lib/services/debtors.ts`
- Enriquecer `calculateDebtorSummaries` y `getDebtorDetails`:
  - Obtener tanto las transacciones compartidas como los préstamos con `loan_type = 'lent'`.
  - Computar el saldo total del deudor: `saldoTotal = deudaCuotasTarjeta + deudaPrestamosDirectos`.
  - Exponer `directLoans: LoanWithRepayments[]` para desglose transparente.

### 2.3 Actualización de `src/lib/services/dashboard.ts`
- Incorporar en el resumen financiero el total acumulado de dinero prestado activo por cobrar a terceros (`totalLentPending`), discriminando lo que vence en el mes corriente versus lo que está a término abierto.

---

## 3. Capa de Interfaz de Usuario (UI & Componentes)

### 3.1 Módulo `/prestamos`
- Actualizar `src/app/prestamos/page.tsx` con pestañas:
  - 📥 **Deudas Propias (Me prestaron)**
  - 📤 **Dinero Prestado (Por cobrar)**
- En `LoanForm.tsx`:
  - Opción de tipo de operación: "Me prestaron dinero" vs "Presté dinero a alguien".
  - Campo "Fecha de devolución": opcional, con selector o toggle *"Sin fecha fija / A convenir"*.

### 3.2 Módulo `/deudores` y `/estado-cuenta/[id]`
- En `DebtorCard.tsx`:
  - Mostrar badge y desglose: `💳 Cuotas: $X` | `💵 Dinero directo: $Y`.
- En `src/app/estado-cuenta/[id]/page.tsx`:
  - Agregar sección de "Préstamos directos sin fecha fija" con botón para descargar comprobante o registrar abono.

### 3.3 Dashboard (`/dashboard`)
- En las tarjetas métricas superiores, visibilizar la tarjeta "Capital a Cobrar en la Calle" para dar certidumbre financiera total.

---

## 4. Estrategia de Pruebas
1. **Pruebas Unitarias (Vitest)**:
   - Validar cálculo de saldos en `loans.test.ts` con préstamos `'lent'`.
   - Validar consolidación combinada (tarjetas + dinero directo) en `debtors.test.ts`.
2. **Pruebas de Componentes / E2E (Playwright)**:
   - Formulario de préstamo sin fecha de devolución.
   - Verificación de renderizado en `/deudores` y portal `/estado-cuenta/[id]`.
