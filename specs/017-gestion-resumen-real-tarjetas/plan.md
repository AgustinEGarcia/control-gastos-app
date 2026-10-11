# Plan de Arquitectura e Implementación: Spec 017 — Gestión de Resumen Real de Tarjetas

## 1. Estrategia de Arquitectura y Modelo de Datos

### 1.1 Gestión de Cuotas en Resúmenes (Salteo y Doble Cuota)
- Las cuotas de compras se almacenan en la tabla `installments`, con `due_date` en formato `YYYY-MM-DD`.
- En `src/lib/services/transactions.ts`, implementaremos:
  - `shiftInstallmentMonth(supabase, installmentId, monthsDelta, shiftSubsequent = true)`:
    - Modifica la fecha `due_date` de la cuota indicada sumando o restando `monthsDelta` meses (por ejemplo, `+1` para saltear o `-1` para adelantar).
    - Si `shiftSubsequent` es `true`, desplaza en igual delta todas las cuotas posteriores no pagadas de la misma transacción, preservando la secuencia lógica y el espaciado.
  - `updateInstallmentDueDate(supabase, installmentId, newDueDate)`:
    - Permite asignar directamente un mes o fecha puntual a una cuota específica.

### 1.2 Devoluciones y Créditos a Favor
- Para garantizar compatibilidad total con la base de datos Supabase existente (cero downtime y sin riesgos de constraints):
  - Una devolución se registra como una transacción donde el usuario marca la casilla **"Devolución / Reintegro a favor"**.
  - En la descripción se asocia un identificador interno seguro (o prefijo `[DEVOLUCIÓN]`), y en `TransactionInput` se expone `is_refund: boolean`.
  - Helpers `isRefundTransaction(t)` y `getCleanDescription(t)` para presentación en UI y cálculo.
  - En `calculateMonthlyConsolidated`:
    - Si una cuota o transacción es una devolución, su monto se computa como **crédito / negativo**.
    - Se resta del subtotal de la tarjeta correspondiente en `summaryByPaymentMethod`.
    - Se resta de `totalExpenses` y del saldo general a pagar del mes.

---

## 2. Componentes Afectados y Modificaciones Previstas

1. `src/lib/services/transactions.ts`:
   - Funciones `shiftInstallmentMonth`, `updateInstallmentDueDate`.
   - Soporte para `is_refund` en validación, inserción y helpers de consulta.
2. `src/lib/services/dashboard.ts`:
   - `calculateMonthlyConsolidated` ampliado para computar devoluciones como créditos negativos en el consolidado y en los resúmenes por tarjeta.
3. `src/components/dashboard/MonthlyDueList.tsx`:
   - Acciones interactivas en tarjetas de cuotas:
     - Botón `⏭️ Saltear (+1 mes)` con tooltip explicativo.
     - Botón `⚡ Doble cuota (Adelantar prox)` si hay cuotas posteriores pendientes.
   - Renderizado diferenciado para devoluciones: color esmeralda, badge `🟢 Devolución / Crédito`, monto negativo `-$X.XXX`.
4. `src/components/transactions/TransactionForm.tsx` y `EditTransactionModal.tsx`:
   - Toggle / Checkbox interactivo: `"¿Es una devolución o reintegro a favor?"`.
   - Si se marca, el formulario adapta textos ("Monto del reintegro", "Mes en que impacta el reintegro").
5. `src/components/transactions/InstallmentScheduleModal.tsx` (nuevo componente opcional o integrado):
   - Modal rápido para visualizar y ajustar el mes de cualquier cuota de la compra con selectores de mes directos.
6. Pruebas Unitarias:
   - `src/lib/services/__tests__/spec017.test.ts` con cobertura de desplazamiento de cuotas, cobro doble y cálculo de devoluciones en el dashboard.

---

## 3. Plan de Pruebas y Validación
- Pruebas unitarias de Vitest (`npm test`).
- Pruebas E2E de Playwright (`npx playwright test`).
- Build de producción (`npm run build`).
