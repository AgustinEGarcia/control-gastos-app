# Spec 017 — Gestión de Resumen Real de Tarjetas: Cuotas Salteadas, Cuotas Dobles y Devoluciones

**Estado**: implementada  
**Fecha**: 2026-10-11  

---

## 1. Contexto, Problema e Historias de Usuario

### Contexto y Problema
En el uso cotidiano de tarjetas de crédito y financiamiento en cuotas ocurren discrepancias frecuentes entre el cronograma teórico proyectado y lo que la entidad emisora realmente liquida en el resumen mensual:
1. **Mes salteado (Cuota no facturada)**: Por demoras de procesamiento comercial o desfasaje con la fecha de cierre, una cuota no entra en el resumen previsto y recién aparece al mes siguiente. Si el sistema la cuenta en el mes salteado, el total a pagar queda inflado artificialmente y no coincide con el resumen bancario.
2. **Doble cuota en el mismo resumen**: La tarjeta liquida dos cuotas en el mismo período (por ejemplo, porque la cuota del mes anterior no ingresó a tiempo o por acumulación de cierres). El usuario necesita que ambas cuotas sumen en el mismo mes y que las subsiguientes mantengan la correlación.
3. **Devoluciones, cancelaciones y reintegros a favor**: Cuando un comercio reembolsa una compra, se cancela un producto o el banco aplica un reintegro promocional, en el extracto aparece un crédito a favor (monto con signo negativo) que reduce el total a pagar de la tarjeta en ese mes. El sistema carecía de un mecanismo para computar estos créditos restando del total del resumen.

---

### Historias de Usuario

#### HU-1: Postergar / Saltear Cuota no Facturada en el Resumen
- **Como** usuario que revisa su resumen mensual de tarjeta en el Dashboard o en la pantalla de Transacciones,
- **Quiero** marcar con un clic que una cuota no vino en el resumen del mes actual,
- **Para que** esa cuota se traslade al mes siguiente (+1 mes), no sume al gasto de este mes y el total liquidado de la tarjeta coincida con mi resumen real.

#### HU-2: Adelantar / Agrupar Cuotas Cobradas Juntas en el Mismo Resumen
- **Como** usuario al que la tarjeta le cobró dos cuotas en el mismo resumen,
- **Quiero** adelantar la siguiente cuota a este mismo mes (o seleccionar el mes de cobro de cada cuota),
- **Para que** ambas cuotas figuren sumando en el resumen del mes actual.

#### HU-3: Registro de Devoluciones y Créditos a Favor en Tarjetas
- **Como** usuario que recibió un reintegro, cancelación de compra o devolución en su tarjeta,
- **Quiero** registrar una devolución indicando la descripción, monto a favor, tarjeta asociada y mes de liquidación,
- **Para que** se muestre claramente en el Dashboard en color verde/negativo y **reste** del total a pagar de esa tarjeta y del total general del mes.

---

## 2. Requerimientos Funcionales y Criterios de Aceptación

### RF-1: Acción Rápida "Saltear Cuota (+1 Mes)"
- En cada cuota de compra en `MonthlyDueList` (Dashboard) y en el detalle de cuotas de `TransactionList` (`/transacciones`), se dispondrá de una acción: `⏭️ Saltear mes`.
- Al ejecutarla, la fecha de vencimiento (`due_date`) de esa cuota (y opcionalmente de las cuotas pendientes futuras de la misma compra) se incrementa en 1 mes.
- La cuota deja de computarse en el mes actual y pasa a computarse en el mes siguiente.
- Se podrá revertir el cambio (`⏮️ Deshacer salteo (-1 mes)`) si se aplicó por equivocación.

### RF-2: Acción Rápida "Cobro Doble / Adelantar Cuota (-1 Mes a la Próxima Cuota)"
- Si la tarjeta cobra dos cuotas en el mismo resumen, el usuario puede adelantar la cuota inmediata posterior al mes actual.
- Ambas cuotas quedan registradas con vencimiento en el mes seleccionado (`YYYY-MM`) y se computan sumando en el Dashboard.
- Editor modal de calendario de cuotas: Permite visualizar todas las cuotas de una compra y ajustar el mes de imputación de cualquiera de ellas con un desplegable.

### RF-3: Registro y Cómputo de Devoluciones / Reintegros a Favor
- En `/transacciones`, el formulario de registro y edición permitirá marcar un movimiento como **"Devolución / Crédito a favor"** (monto negativo o tipo reembolso).
- Campos:
  - Descripción (ej: "Devolución Mercado Libre zapatillas", "Reintegro Banco Galicia").
  - Monto a favor (positivo en el input, se almacena o procesa como crédito / resta).
  - Tarjeta / Método de pago asociado.
  - Mes en el que impacta en el resumen (`YYYY-MM`).
  - Beneficiario opcional (por si el reintegro corresponde a una compra de un tercero).
- Impacto en Dashboard (`calculateMonthlyConsolidated`):
  - Las devoluciones del mes se listan con estilo distintivo (color verde esmeralda, badge `🟢 Devolución`, monto en negativo `-$X.XXX`).
  - **Restan del total de la tarjeta**: `Total Tarjeta = Suma Cuotas - Devoluciones`.
  - **Restan del total general a pagar**: `Total Mes = Gastos Fijos + Cuotas + Variables - Devoluciones`.

---

## 3. Requerimientos No Funcionales
- **RNF-1**: Persistencia transparente en Supabase manteniendo fallback local para modo offline / Zero Downtime.
- **RNF-2**: Los montos totales nunca deben ser negativos a nivel de resumen general (si las devoluciones superan las compras, el total de la tarjeta muestra crédito a favor `$0` o saldo a favor explícito).
- **RNF-3**: Interfaz 100% en Español, accesible y responsive en dispositivos móviles y de escritorio.
- **RNF-4**: 100% de cobertura en pruebas unitarias y E2E antes del despliegue a producción.
