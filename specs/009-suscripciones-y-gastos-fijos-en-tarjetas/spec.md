# Spec 009 — Suscripciones y Gastos Fijos Vinculados a Tarjetas de Crédito
Estado: implementada

## Contexto, Usuarios e Historias
Como usuario de Control Financiero 360°, abono servicios mensuales recurrentes mediante débito automático en mis tarjetas de crédito (por ejemplo: suscripciones de streaming como Netflix/Spotify, almacenamiento en la nube, gimnasio o seguros). Estos cargos **no tienen un número finito de cuotas**, sino que son débitos automáticos permanentes que se liquidan en el resumen mensual de la tarjeta. Necesito poder vincular mis gastos fijos recurrentes a un método de pago específico, para conocer con exactitud el total real que vendrá liquidado en cada tarjeta cada mes (sumando las cuotas de compras del mes más las suscripciones permanentes activas).

- **HU-1:** Como usuario, quiero asociar un método de pago (tarjeta de crédito) a cualquier gasto fijo recurrente para reflejar que se debita de forma automática en ese plástico.
- **HU-2:** Como usuario, quiero poder registrar una suscripción o cargo recurrente permanente directamente desde la sección de tarjetas/compras, sin tener que inventar un número ficticio de cuotas.
- **HU-3:** Como usuario, quiero visualizar en la tarjeta de crédito el detalle y monto total de las suscripciones permanentes activas que se debitan en ella.
- **HU-4:** Como usuario, quiero que el Dashboard mensual y el desglose de vencimientos muestren la tarjeta asociada a cada gasto fijo para planificar los límites y saldos disponibles.

## Definiciones, Casos límite y Fuera de alcance
- **Definiciones:**
  - *Cargo Recurrente Permanente en Tarjeta:* Registro en `recurring_expenses` con `payment_method_id` no nulo que se debita mes a mes sin cuotas finitas.
  - *Gasto Fijo sin Tarjeta:* Registro en `recurring_expenses` con `payment_method_id` nulo (ej. alquiler pagado por transferencia o expensas en efectivo).
  - *Resumen Mensual Proyectado de la Tarjeta:* `Suma de Cuotas del Mes (transactions) + Suma de Gastos Fijos Activos debitados en esa tarjeta (recurring_expenses)`.
- **Casos límite:**
  - Tarjeta eliminada: Si se elimina una tarjeta, los gastos fijos asociados deben quedar con `payment_method_id = null` (`ON DELETE SET NULL`), preservando el gasto sin romper la integridad referencial.
  - Gasto fijo pausado (`is_active = false`): No debe sumarse al total proyectado del resumen de la tarjeta del mes.
  - Monto real facturado (`actual_amount`): Si existe, tiene prioridad sobre `estimated_amount` en el cálculo de la tarjeta.
- **Fuera de alcance en esta spec:**
  - Integración vía Open Banking con bancos para lectura automática de extractos (mantiene costo $0).

## Requisitos No Funcionales y de Seguridad
- **RNF-1 (Zero Trust & RLS):** La relación entre `recurring_expenses` y `payment_methods` respeta las políticas de usuario (`user_id`).
- **RNF-2 (Compatibilidad hacia atrás):** El campo `payment_method_id` es opcional (`nullable`), garantizando compatibilidad total con gastos fijos creados previamente.
- **RNF-3 (Aesthetic):** Badges distintivos con ícono de tarjeta y nombre del método de pago en las tarjetas de gastos fijos y cronograma.

## Requisitos Funcionales (EARS)
- **RF-1 (Evento):** CUANDO el usuario cree o edite un gasto fijo y seleccione una tarjeta, EL SISTEMA guardará la relación `payment_method_id` y reflejará la tarjeta en el detalle del gasto.
- **RF-2 (Permanente):** MIENTRAS se visualicen los métodos de pago o el resumen de una tarjeta, EL SISTEMA calculará y mostrará el subtotal de suscripciones fijas mensuales debitadas en ella.
- **RF-3 (Evento):** CUANDO el usuario registre una compra y elija la opción "Suscripción / Cargo Recurrente Mensual", EL SISTEMA creará un registro en `recurring_expenses` vinculado a la tarjeta seleccionada sin exigir cuotas finitas.
- **RF-4 (Permanente):** MIENTRAS se consulte el cronograma de vencimientos en el Dashboard, EL SISTEMA mostrará la tarjeta emisora para cada gasto recurrente que tenga método de pago asignado.
