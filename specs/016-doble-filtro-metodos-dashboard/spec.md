# Spec 016 — Doble Filtro en Dashboard, Selección de Mes de Cuotas y Edición Integral de Compras
Estado: implementada

## Contexto, Usuarios e Historias de Usuario
- **Contexto**:
  1. En el Dashboard (`/dashboard`), el listado mensual de compromisos no permite filtrar simultáneamente por estado/tipo y por tarjeta/método de pago.
  2. En el registro de compras con tarjeta (`/transacciones`), el uso de fechas exactas de compra y días de cierre genera confusión y desfasajes en el cálculo de las cuotas. Se requiere simplificar la carga permitiendo al usuario elegir directamente el **mes en el que se debita la primera cuota** mediante un selector de meses.
  3. El modal de edición de compras (`EditTransactionModal`) solo permitía cambiar la descripción, fecha y método, pero impedía corregir montos, cantidad de cuotas, mes de inicio o persona asignada. Se requiere una interfaz de edición idéntica a la de creación que permita editar **todos los campos**.

- **Usuario**: Usuario del sistema que necesita consultar selectivamente sus gastos por tarjeta en el dashboard, programar el mes exacto de inicio de sus compras en cuotas sin cálculos engorrosos de cierres, y poder corregir cualquier dato de una compra existente.

- **Historia de Usuario (HU-1) - Doble Filtro en Dashboard**:
  Como usuario en `/dashboard`, quiero combinar el filtro de estado/tipo (Pendientes, Pagados, Fijos, Cuotas, Variables) con un filtro de método de pago (tarjeta específica o todas), para ver con exactitud los gastos de una tarjeta en ese estado.

- **Historia de Usuario (HU-2) - Selección Simplificada por Mes de Inicio de Cuotas**:
  Como usuario al registrar una compra en cuotas, quiero seleccionar únicamente el **mes y año en el que se debita la primera cuota** (ej. Octubre 2026), sin tener que calcular fechas de compra ni de cierre, asegurando que las cuotas caigan en los meses esperados.

- **Historia de Usuario (HU-3) - Edición Integral de Compras**:
  Como usuario en `/transacciones`, quiero hacer clic en "Editar" en una compra y contar con una pantalla con todos los campos (descripción, alternancia entre monto total o por cuota, cantidad de cuotas, mes de inicio, tarjeta y persona asociada), para poder corregir cualquier error de carga sin tener que borrar y volver a crear la compra.

---

## Definiciones, Casos Límite y Fuera de Alcance
- **Definiciones**:
  - `startMonthYear`: Cadena en formato `YYYY-MM` que define el mes a partir del cual se genera la cuota 1 (ej. `2026-10` genera vencimientos `2026-10-01`, `2026-11-01`, etc.).
  - `updateTransactionWithInstallments`: Actualización en `transactions` y, si cambiaron los montos, cantidad de cuotas o fecha inicial, regeneración del plan de cuotas en `installments`.

- **Casos Límite**:
  - *Edición de cuotas con pagos previos*: Si se editan los montos o cantidad de cuotas de una compra que ya tenía cuotas marcadas como pagadas, se avisa o se regenera el cronograma manteniendo la consistencia financiera.
  - *Filtro de tarjeta en Dashboard con gastos variables*: Los gastos variables (sin tarjeta) solo se mostrarán cuando el filtro de tarjeta esté en "Todas" o "Sin tarjeta / Efectivo".
  - *Selección de mes en cambio de año*: El selector de mes permite navegar años (ej. Dic 2026 -> Ene 2027) sin desfasajes de días de mes (ej. día 28/29/30/31).

- **Fuera de Alcance**:
  - Edición individual manual de fechas arbitrarias cuota por cuota fuera de su correlatividad mensual.

---

## Requisitos No Funcionales y de Seguridad
- **Simplicidad de UI**: Selectores limpios de mes (`<input type="month">` o desplegable de meses) que eviten fricción al usuario.
- **Integridad Transaccional**: La actualización de una compra y sus cuotas asociadas debe ejecutarse de forma consistente en Supabase.
- **Consistencia Visual**: Modales con diseño responsivo oscuro (zinc/emerald/cyan).

---

## Requisitos Funcionales (EARS)

### Doble Filtro en Dashboard (`/dashboard`)
- **RF-1**: CUANDO el usuario consulte `/dashboard`, EL SISTEMA debe incluir en `MonthlyDueItem` el `paymentMethodId` y `paymentMethodName` de cada gasto fijo y cuota de tarjeta.
- **RF-2**: CUANDO el usuario acceda a `MonthlyDueList`, EL SISTEMA debe mostrar un selector de tarjeta (`💳 Filtrar tarjeta`) junto a los filtros de estado/tipo.
- **RF-3**: CUANDO el usuario seleccione una tarjeta y un estado, EL SISTEMA debe filtrar el listado mostrando únicamente los ítems que cumplan ambas condiciones simultáneamente.

### Selección de Mes de Inicio de Cuotas (`TransactionForm`)
- **RF-4**: CUANDO el usuario registre una compra en cuotas, EL SISTEMA debe solicitar el mes de inicio del débito (`startMonth`) mediante un selector de mes y año, eliminando la obligatoriedad de calcular fechas de cierre.
- **RF-5**: CUANDO el usuario confirme la compra, EL SISTEMA debe programar las cuotas correlativamente a partir del primer día del mes seleccionado.

### Edición Integral de Compras (`EditTransactionModal`)
- **RF-6**: CUANDO el usuario abra el modal de editar compra, EL SISTEMA debe presentar un formulario completo con todos los campos precargados:
  - Descripción.
  - Modo de cálculo (Por Total o Por Cuota) con sus montos.
  - Cantidad de cuotas.
  - Mes de inicio del cobro.
  - Tarjeta o método de pago.
  - Asignación de consumo propio o persona beneficiaria.
- **RF-7**: CUANDO el usuario guarde las modificaciones en una compra, EL SISTEMA debe persistir los cambios en la transacción y, de haberse modificado montos, cuotas o mes de inicio, actualizar el cronograma de cuotas en la base de datos.
