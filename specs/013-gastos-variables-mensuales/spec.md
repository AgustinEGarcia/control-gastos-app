# Spec 013 — Gastos Variables Mensuales y Bolsa de Gastos Varios
Estado: implementada

## Contexto, Usuarios e Historias de Usuario
- **Contexto**: Además de los gastos fijos (alquiler, servicios) y las cuotas de tarjetas, los usuarios tienen gastos variables mes a mes (supermercado, combustible, salidas, peluquería, imprevistos). Anotar cada gasto individualmente puede resultar tedioso; los usuarios necesitan poder definir para cada mes un concepto genérico (ej. "Gastos Varios") con un monto presupuestado global o con un desglose interno ágil de conceptos que sumen automáticamente al total de gastos del período.
- **Usuario**: Usuario que planifica sus gastos del mes y quiere incorporar una partida variable consolidada sin sobrecargar su gestión diaria.
- **Historia de Usuario (HU-1)**: Como usuario, quiero ingresar en el Dashboard de cada mes una partida genérica de "Gastos Variables" (o editar su nombre/monto) para que su total sume a los compromisos del mes corriente.
- **Historia de Usuario (HU-2)**: Como usuario, quiero poder cargar de manera opcional un desglose de ítems internos (ej. Supermercado $500.000, Combustible $200.000, Peluquería $50.000) de modo que la suma automática componga el total del concepto genérico.
- **Historia de Usuario (HU-3)**: Como usuario, quiero que la partida de gastos variables se integre en el Dashboard:
  - Que sume al **Total Gastos del Mes**.
  - Que se pueda marcar como pagada/cubierta para actualizar el **Total Ya Pagado** y el **Total Pendiente**.
  - Que aparezca visualmente diferenciada con su badge propio ("Gasto Variable") en el cronograma mensual.

## Definiciones, Casos Límite y Fuera de Alcance
- **Definiciones**:
  - `Gasto Variable Mensual`: Registro asociado a un mes (`year`, `month`) con un título genérico (por defecto "Gastos Varios"), un monto total y una lista opcional de ítems con concepto y monto.
  - `Ítem de Gasto Variable`: Elemento simple `{ id, label, amount }`.
  - `Monto Efectivo`: Si hay ítems desglosados, es la sumatoria de sus montos; si no hay desglose, es el monto directo asignado al concepto.
- **Casos Límite**:
  - Mes sin gastos variables definidos: Se computa $0 sin afectar el resto de los cálculos.
  - Modificación de montos en tiempo real: Si se agrega un ítem o se edita el monto, el Dashboard debe recalcular el Total del Mes, Pagado y Pendiente instantáneamente.
  - Cambio de mes: Cada mes tiene su propia configuración de gastos variables (lo presupuestado para Octubre es independiente de Noviembre).
- **Fuera de Alcance**:
  - Escaneo automático de tickets o facturas por OCR.
  - Integración bancaria en tiempo real.

## Requisitos No Funcionales y de Seguridad
- **Persistencia Resiliente**: Almacenamiento en tabla Supabase (`variable_monthly_expenses`) con fallback transparente en `localStorage` (Zero Downtime).
- **Usabilidad y Agilidad**: Modal o tarjeta intuitiva para ajustar el monto o agregar sub-conceptos en 2 clics.
- **Alineación Visual**: Tarjeta moderna con Glassmorphism integrada al Dashboard existente.

## Requisitos Funcionales (EARS)
- **RF-1**: CUANDO el usuario visualice el Dashboard de un mes, EL SISTEMA debe permitir ver y gestionar la partida de "Gastos Variables del Mes".
- **RF-2**: CUANDO el usuario ingrese un monto directo o agregue ítems al desglose (concepto y monto), EL SISTEMA debe calcular la sumatoria total del concepto y guardarla para ese año y mes.
- **RF-3**: CUANDO exista un monto de gastos variables en el mes, EL SISTEMA debe sumarlo automáticamente al "Total Gastos del Mes" (`totalOwnToPay`).
- **RF-4**: CUANDO el usuario marque el gasto variable como pagado, EL SISTEMA debe sumarlo al "Total Ya Pagado" y descontarlo del "Total Pendiente".
- **RF-5**: CUANDO el usuario alterne entre meses en el selector, EL SISTEMA debe cargar los gastos variables propios de ese mes específico.
