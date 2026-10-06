# Spec 006 — Portal de Deudores y Estado de Cuenta Compartido
Estado: implementada

## Contexto, Usuarios e Historias
Como usuario de Control Financiero 360°, presto mi tarjeta de crédito o realizo pagos en nombre de familiares o amigos (beneficiarios de consumos compartidos). Necesito una sección centralizada para gestionar los cobros que me adeudan, registrar los abonos o pagos que me hacen (`payments_received`), y brindarles un enlace transparente de consulta pública (Portal de Deudor / Estado de Cuenta) para que puedan ver exactamente cuánto deben, el detalle de sus compras y los pagos ya acreditados, sin necesidad de crear una cuenta en el sistema.

- **HU-1:** Como usuario, quiero ver un panel consolidado de todas las personas que me deben dinero con el saldo pendiente exacto de cada una.
- **HU-2:** Como usuario, quiero registrar cobros recibidos indicando persona, monto abonado, fecha y comprobante/nota, reduciendo el saldo deudor de esa persona.
- **HU-3:** Como usuario, quiero generar y compartir un enlace único (`/estado-cuenta/[personId]`) para que el deudor consulte su resumen en vivo.
- **HU-4:** Como deudor invitado, quiero abrir el enlace en mi navegador y ver un resumen limpio y transparente de mis compras en cuotas, mis pagos acreditados y el saldo final pendiente.

## Definiciones, Casos límite y Fuera de alcance
- **Definiciones:**
  - *Deuda Acumulada:* Suma de los importes de todas las transacciones donde `beneficiary_person_id = person.id`.
  - *Total Cobrado:* Suma de todos los registros en `payments_received` para esa `person_id`.
  - *Saldo Pendiente por Cobrar:* `Deuda Acumulada - Total Cobrado`.
- **Casos límite:**
  - Deudor sin compras registradas: No muestra saldo o muestra saldo $0.
  - Deudor que ya pagó todo (`Saldo Pendiente <= 0`): Se clasifica como "Al día / Saldado".
  - Monto de pago recibido menor o igual a cero: Rechazado por validación.
  - Acceso al estado de cuenta público: El portal `/estado-cuenta/[id]` debe ser accesible sin requerir autenticación para el invitado, mostrando únicamente los consumos y abonos de esa persona específica.
- **Fuera de alcance en esta spec:**
  - Pagos electrónicos directos vía pasarela de pago (Mercado Pago Checkout). Los cobros se registran manualmente (efectivo/transferencia).
  - Alertas automáticas de vencimiento por email con Resend (se implementarán en Spec 007).

## Requisitos No Funcionales y de Seguridad
- **RNF-1 (Zero Trust en Administración):** La administración y registro de cobros (`/deudores`) solo es accesible por el usuario autenticado con sesión activa.
- **RNF-2 (Visualización Pública Segura):** La ruta pública `/estado-cuenta/[id]` está excluida de la redirección forzada a `/login` en el middleware.
- **RNF-3 (Aesthetic):** Diseño moderno, legible, adaptado a móviles (pensado para que el deudor lo abra desde WhatsApp).

## Requisitos Funcionales (EARS)
- **RF-1 (Permanente):** MIENTRAS el usuario acceda a `/deudores`, EL SISTEMA mostrará la lista consolidada de personas con compras a su nombre, su saldo pendiente y el total recuperado.
- **RF-2 (Evento):** CUANDO el usuario registre un pago recibido con monto y fecha, EL SISTEMA actualizará de inmediato el saldo pendiente del deudor.
- **RF-3 (Permanente):** MIENTRAS un deudor acceda a `/estado-cuenta/[id]`, EL SISTEMA renderizará su detalle de consumos, cuotas y pagos recibidos.
- **RF-4 (Condición no deseada):** SI el monto del cobro recibido es menor o igual a cero, ENTONCES EL SISTEMA rechazará el registro y mostrará un mensaje de error en español.
