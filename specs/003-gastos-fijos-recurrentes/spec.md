# Spec 003 — Gastos Fijos Recurrentes
Estado: implementada

## Contexto, Usuarios e Historias
Como usuario de Control Financiero 360°, necesito gestionar mis gastos fijos mensuales (alquiler, expensas, luz, internet, suscripciones, etc.) con sus montos estimados y actualizar al monto real cuando llega la factura para planificar mi liquidez y conocer el costo de vida base mensual.

- **HU-1:** Como usuario, quiero registrar gastos fijos con nombre, categoría, día de pago del mes y monto estimado.
- **HU-2:** Como usuario, quiero actualizar el monto real cuando llega la factura para saber la variación exacta frente a lo presupuestado.
- **HU-3:** Como usuario, quiero visualizar métricas agregadas del mes: Total Estimado, Total Real Facturado y Diferencia (+ / -).
- **HU-4:** Como usuario, quiero poder pausar o reactivar un gasto sin eliminarlo del historial.

## Definiciones, Casos límite y Fuera de alcance
- **Definiciones:**
  - *Monto Estimado:* Presupuesto base mensual proyectado.
  - *Monto Real:* Monto efectivo que vino en la factura del período.
  - *Día de Pago:* Día del mes (1 a 31) en que se debita o abona el gasto.
- **Casos límite:**
  - Monto estimado menor o igual a cero.
  - Día de pago fuera del rango 1 a 31.
  - Monto real negativo.
- **Fuera de alcance en esta spec:**
  - Envío automático de emails vía Resend (se abordará en Spec de Notificaciones).

## Requisitos No Funcionales y de Seguridad
- **RNF-1 (Zero Trust & RLS):** Toda consulta y mutación sobre `recurring_expenses` se restringe al usuario autenticado (`auth.uid() = user_id`).
- **RNF-2 (Precisión Matemática):** Los montos deben manejarse con 2 decimales y cálculo aritmético exacto.
- **RNF-3 (Aesthetic):** Dashboard con tarjetas de resumen visuales, colores de estado y modal responsivo.

## Requisitos Funcionales (EARS)
- **RF-1 (Permanente):** EL SISTEMA listará exclusivamente los gastos fijos del usuario autenticado ordenados por día de pago.
- **RF-2 (Evento):** CUANDO el usuario registre un gasto con datos válidos, EL SISTEMA lo guardará en la tabla `recurring_expenses` y actualizará los totales del mes.
- **RF-3 (Evento):** CUANDO el usuario actualice el monto real de un gasto, EL SISTEMA recalculará la diferencia entre lo estimado y lo real en tiempo real.
- **RF-4 (Condición no deseada):** SI el monto estimado es menor o igual a 0 o el día de pago no está entre 1 y 31, ENTONCES EL SISTEMA rechazará la acción y notificará el error en español.
- **RF-5 (Evento):** CUANDO el usuario alterne el estado activo/pausado de un gasto, EL SISTEMA recalculará los totales considerando solo los gastos activos.
