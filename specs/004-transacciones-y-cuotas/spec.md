# Spec 004 — Transacciones, Cuotas y Consumos Compartidos
Estado: implementada

## Contexto, Usuarios e Historias
Como usuario de Control Financiero 360°, necesito registrar consumos con tarjetas de crédito y financiamientos (Mercado Crédito / bancos), desglosar compras en cuotas fijas mensuales con fechas de vencimiento y asignar compras a terceros para saber exactamente cuánto debo pagar de mi bolsillo y cuánto tengo pendiente de cobro a familiares o amigos.

- **HU-1:** Como usuario, quiero registrar una compra indicando descripción, monto total, método de pago, cantidad de cuotas (1 a 48) y fecha de la primera cuota.
- **HU-2:** Como usuario, quiero que el sistema genere automáticamente el plan de cuotas mensuales con el importe exacto centavo a centavo y fechas de vencimiento consecutivas.
- **HU-3:** Como usuario, quiero poder asignar una compra a un tercero (beneficiario) para separar mis gastos propios de lo que presté en mi tarjeta.
- **HU-4:** Como usuario, quiero marcar cuotas individuales como abonadas y ver el progreso (ej. "Cuota 3/12").

## Definiciones, Casos límite y Fuera de alcance
- **Definiciones:**
  - *Consumo Propio:* Compra donde el beneficiario es el propio usuario titular (`beneficiary_person_id` es nulo).
  - *Consumo Compartido / Prestado:* Compra realizada con la tarjeta del usuario pero consumida por un tercero (`beneficiary_person_id` asignado a una persona).
- **Casos límite:**
  - División de cuotas inexactas (ej. $100 / 3 cuotas): El primer centavo remanente se ajusta en la primera cuota para que la sumatoria sea 100.00% idéntica al total.
  - Cantidad de cuotas menor a 1 o mayor a 60.
  - Monto total menor o igual a cero.
- **Fuera de alcance en esta spec:**
  - Préstamos en efectivo/transferencia recibidos (se abordarán en Spec 005: Préstamos Personales Multidivisa).

## Requisitos No Funcionales y de Seguridad
- **RNF-1 (Zero Trust & RLS):** Las transacciones, cuotas y personas solo son accesibles por su creador autenticado.
- **RNF-2 (Integridad Referencial):** Al eliminar una transacción, sus cuotas asociadas se eliminan en cascada (`ON DELETE CASCADE`).
- **RNF-3 (Aesthetic):** Barra de progreso visual por compra (ej. 4 de 12 cuotas pagadas) y desglose desplegable.

## Requisitos Funcionales (EARS)
- **RF-1 (Evento):** CUANDO el usuario registre una compra en N cuotas, EL SISTEMA generará automáticamente N registros en la tabla `installments` calculando el importe de cada una y sus vencimientos mensuales.
- **RF-2 (Permanente):** MIENTRAS se visualice el panel de transacciones, EL SISTEMA mostrará tarjetas separando el total a pagar propio del total a cobrar a terceros.
- **RF-3 (Evento):** CUANDO el usuario marque o desmarque una cuota como pagada, EL SISTEMA actualizará su estado y el porcentaje de progreso de la compra.
- **RF-4 (Condición no deseada):** SI el monto total es menor o igual a 0 o las cuotas no son un entero válido entre 1 y 60, ENTONCES EL SISTEMA rechazará la creación y notificará el error en español.
