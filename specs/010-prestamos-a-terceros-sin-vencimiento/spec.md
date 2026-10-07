# Especificación de Requerimiento — Spec 010: Préstamos de Dinero a Terceros sin Fecha de Vencimiento

## 1. Resumen Ejecutivo
Permitir al usuario registrar dinero propio prestado directamente a terceras personas (en efectivo, transferencia bancaria, etc.) sin exigir una fecha de devolución fija (vencimiento abierto / indefinido / a convenir). Este dinero por cobrar debe computarse de forma consolidada en el saldo total de la persona deudora, en el portal público de estado de cuenta y en el dashboard financiero general.

---

## 2. Historias de Usuario y Criterios de Aceptación (Gherkin)

### HU-01: Registro de Dinero Prestado a Terceros sin Vencimiento
**Como** usuario de la aplicación,  
**Quiero** registrar que le presté una cantidad de dinero a una persona sin tener que definir una fecha de devolución obligatoria,  
**Para** no olvidar el préstamo y llevar el control exacto de cuánto me debe.

- **Escenario 1.1: Préstamo sin fecha de devolución (a término abierto)**
  - **Dado** que el usuario ingresa a la sección de deudores o préstamos y presiona "+ Prestar Dinero",
  - **Cuando** completa el deudor (ej. "Carlos"), el monto (ej. $50.000 ARS), la fecha de entrega y deja la fecha de devolución vacía o desmarcada,
  - **Entonces** el sistema guarda el préstamo con estado `active`, fecha de devolución `null` / "A convenir", e incrementa la deuda activa de Carlos en $50.000.

- **Escenario 1.2: Préstamo con notas explicativas y soporte multimoneda**
  - **Dado** que el usuario presta dinero en dólares (USD) o pesos (ARS),
  - **Cuando** selecciona la divisa USD y añade la nota "Transferencia para repuesto de auto",
  - **Entonces** el sistema discrimina el monto en la divisa correspondiente y mantiene la nota asociada al historial de la persona.

---

### HU-02: Registro de Abonos y Devoluciones Parciales o Totales
**Como** usuario,  
**Quiero** registrar cuando el deudor me entrega dinero de vuelta (parcial o total),  
**Para** que su saldo pendiente disminuya hasta saldar el préstamo.

- **Escenario 2.1: Abono parcial de dinero prestado**
  - **Dado** que Carlos me debe $50.000 ARS y me transfiere $20.000,
  - **Cuando** registro un abono de $20.000 a ese préstamo,
  - **Entonces** el sistema registra el movimiento, reduce el saldo pendiente a $30.000 y el estado continúa en `active`.

- **Escenario 2.2: Liquidación total del préstamo**
  - **Dado** que Carlos me debía un saldo remanente de $30.000,
  - **Cuando** registro un pago de $30.000,
  - **Entonces** el saldo remanente llega a $0.00 y el préstamo pasa automáticamente al estado `paid` (liquidado).

---

### HU-03: Consolidación en Portal de Deudores y Estado de Cuenta Público
**Como** usuario y como deudor (vía enlace público),  
**Quiero** ver en una sola vista tanto las compras con tarjeta compartidas como el dinero directo prestado,  
**Para** tener transparencia total de la deuda global sin mezclar conceptos.

- **Escenario 3.1: Ficha consolidada de la persona en `/deudores`**
  - **Dado** que Carlos tiene $15.000 pendientes en cuotas de tarjeta y un préstamo directo de $50.000,
  - **Entonces** la tarjeta de Carlos muestra:
    - Deuda total consolidada: $65.000 ARS.
    - Desglose claro: Cuotas de compras ($15.000) + Dinero prestado directo ($50.000).

- **Escenario 3.2: Portal público `/estado-cuenta/[id]`**
  - **Dado** que Carlos abre su enlace compartido,
  - **Entonces** visualiza dos secciones ordenadas: "Compras con Tarjeta" y "Préstamos de Dinero Directo (Sin fecha límite)", con sus comprobantes y abonos registrados.

---

### HU-04: Visibilidad en el Dashboard Consolidado General (`/dashboard`)
**Como** usuario,  
**Quiero** que el Dashboard general refleje este dinero por cobrar,  
**Para** conocer mi capital total en la calle sin distorsionar los compromisos del mes corriente.

- **Escenario 4.1: Métrica de Dinero en la Calle**
  - **Dado** que el usuario consulta el Dashboard,
  - **Entonces** el resumen financiero incluye una métrica explícita de "Dinero Prestado a Cobrar" que no depende de un mes calendario cerrado, manteniéndose visible hasta que sea devuelto.

---

## 3. Requerimientos Funcionales en Sintaxis EARS

1. **Ubiquitous (Siempre activo):**  
   El sistema SIEMPRE deberá permitir que la fecha estimada de devolución (`due_date`) sea nula (`NULL`), interpretándola en la interfaz como *"Sin fecha fija / A convenir"*.
2. **Event-driven (Disparado por evento):**  
   CUANDO el usuario registre un abono cuyo monto acumulado iguale o supere el capital prestado, el sistema DEBERÁ marcar el estado del préstamo como `'paid'`.
3. **State-driven (Basado en estado):**  
   MIENTRAS un préstamo a un tercero permanezca en estado `'active'`, su saldo remanente DEBERÁ sumarse al saldo deudor de la persona en `/deudores`, `/estado-cuenta/[id]` y `/dashboard`.
4. **Unwanted Behaviors (Comportamientos no deseados):**  
   SI el usuario intenta registrar un monto prestado menor o igual a 0, el sistema DEBERÁ rechazar la operación indicando *"El monto prestado debe ser mayor a 0"*.

---

## 4. Casos Límite y Consideraciones
- **Préstamos Multidivisa**: Si se presta en USD, el saldo en USD debe mantenerse separado de ARS en la ficha del deudor para evitar mezclar monedas con tipos de cambio volátiles.
- **Cancelación o corrección**: Poder editar o eliminar un préstamo erróneo, restituyendo el balance de la persona.
- **Relación con tabla de préstamos existente (`personal_loans`)**:  
  Actualmente `personal_loans` tiene `user_id` y `lender_person_id` (quien prestó). Podemos enriquecer la tabla para soportar `loan_type: 'borrowed' | 'lent'` (dinero que pedí prestado vs dinero que yo presté) o `borrower_person_id`, manteniendo compatibilidad total con los datos existentes.
