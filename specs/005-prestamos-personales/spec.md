# Spec 005 — Préstamos Personales Multidivisa y Abonos
Estado: implementada

## Contexto, Usuarios e Historias
Como usuario de Control Financiero 360°, necesito registrar préstamos personales tomados en efectivo o transferencia bancaria (ej. deudas con familiares como papá, amigos o prestamistas), soportando múltiples divisas (ARS y USD), para llevar un control estricto de abonos parciales, saldo restante y estado de amortización hasta la liquidación total.

- **HU-1:** Como usuario, quiero registrar un préstamo personal indicando prestamista (de la agenda de personas), monto inicial, divisa (ARS o USD), fecha y notas opcionales.
- **HU-2:** Como usuario, quiero registrar abonos parciales a un préstamo activo con fecha, monto y nota, reduciendo de inmediato el saldo adeudado.
- **HU-3:** Como usuario, quiero visualizar resúmenes separados por divisa (Total adeudado en ARS y Total adeudado en USD) para no mezclar monedas.
- **HU-4:** Como usuario, quiero ver una barra de progreso de pago por préstamo y un historial con todos los abonos efectuados, con la posibilidad de revertir abonos erróneos o liquidar la deuda.

## Definiciones, Casos límite y Fuera de alcance
- **Definiciones:**
  - *Prestamista (`lender_person_id`):* Persona de la tabla `people` a quien el usuario le debe el dinero.
  - *Saldo Restante (`remaining_balance`):* `initial_amount - SUM(loan_repayments.amount_paid)`.
  - *Estado (`status`):* `'active'` si `remaining_balance > 0`, `'paid_off'` si `remaining_balance <= 0`.
- **Casos límite:**
  - Abono mayor al saldo restante: Se restringe o se marca automáticamente el préstamo como cancelado (`paid_off`).
  - Abono con monto negativo o cero: Rechazado.
  - Multidivisa: Los totales de ARS y USD nunca se suman directamente entre sí; se mantienen en paneles independientes para evitar distorsiones cambiarias sin cotización fija.
  - Eliminación de préstamo: Elimina en cascada todos sus abonos asociados.
- **Fuera de alcance en esta spec:**
  - Portal público de deudores (se abordará en Spec 006).
  - Alertas automáticas de vencimiento por email con Resend (Spec 007).

## Requisitos No Funcionales y de Seguridad
- **RNF-1 (Zero Trust & RLS):** Los préstamos y abonos están protegidos por RLS (`auth.uid() = user_id`) y no pueden ser leídos ni modificados por terceros.
- **RNF-2 (Precisión Matemática):** Cálculos decimales redondeados a 2 decimales para evitar desbordes de coma flotante.
- **RNF-3 (Aesthetic):** Diseño moderno, tarjetas con badges distintivos de moneda (azul para ARS, verde esmeralda para USD), microinteracciones y feedback en español.

## Requisitos Funcionales (EARS)
- **RF-1 (Evento):** CUANDO el usuario registre un nuevo préstamo con prestamista, monto y divisa, EL SISTEMA lo guardará como activo y actualizará las métricas de deuda.
- **RF-2 (Evento):** CUANDO el usuario registre un abono sobre un préstamo, EL SISTEMA recalculará de forma reactiva el saldo restante y el porcentaje de amortización.
- **RF-3 (Permanente):** MIENTRAS se visualice el panel de préstamos, EL SISTEMA presentará los saldos agrupados por divisa (ARS y USD por separado).
- **RF-4 (Condición no deseada):** SI el monto de abono es menor o igual a cero o excede el saldo restante, ENTONCES EL SISTEMA rechazará la operación informando el motivo en español.
