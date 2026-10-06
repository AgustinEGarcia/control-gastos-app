# Spec 007 — Alertas Preventivas por Email con Resend
Estado: implementada

## Contexto, Usuarios e Historias
Como usuario de Control Financiero 360°, requiero que el sistema me notifique de manera preventiva por correo electrónico (vía Resend a costo $0) exactamente 1 día (24 horas) antes de que venza un gasto fijo mensual (alquiler, servicios, seguros) o la cuota de una tarjeta de crédito, permitiéndome aprovisionar los fondos bancarios necesarios y evitar multas o recargos por intereses punitorios.

- **HU-1:** Como usuario, quiero recibir un email claro y visual 1 día antes del día de pago de cualquier gasto recurrente activo.
- **HU-2:** Como usuario, quiero recibir un email de alerta 1 día antes del vencimiento de cualquier cuota de compra en tarjeta que aún permanezca impaga.
- **HU-3:** Como sistema desatendido (Cron Job diario), quiero ejecutar un endpoint seguro (`/api/alerts/check-due-dates`) con autenticación mediante `CRON_SECRET` para procesar los vencimientos de la jornada.
- **HU-4:** Como usuario, quiero una vista `/alertas` para consultar los vencimientos preventivos de los próximos 7 días y realizar envíos de prueba para verificar la configuración de Resend.

## Definiciones, Casos límite y Fuera de alcance
- **Definiciones:**
  - *Vencimiento Preventivo (24 horas):* Elementos cuyo día de pago (`payment_day` para gastos fijos) o fecha límite (`due_date` para cuotas) coincide con el día de mañana (o el día actual para alertas de urgencia).
  - *Resend a Costo $0:* Uso del free tier de Resend (hasta 3.000 emails/mes o 100/día), usando `onboarding@resend.dev` o dominio personalizado.
- **Casos límite:**
  - Gastos fijos pausados (`is_active = false`): Se excluyen estrictamente.
  - Cuotas ya pagadas (`is_paid = true`): Se excluyen estrictamente.
  - Fin de mes / Meses cortos (ej. febrero 28 vs día de pago 31): Manejo con clamp de días para no omitir alertas.
  - Entorno sin `RESEND_API_KEY`: El servicio opera en modo simulación/desarrollo registrando los emails en consola sin producir excepciones fatales.
- **Fuera de alcance en esta spec:**
  - Notificaciones por WhatsApp o SMS (requerirían infraestructura de pago con costo no $0).
  - Alertas masivas de marketing.

## Requisitos No Funcionales y de Seguridad
- **RNF-1 (Zero Trust):** El endpoint `/api/alerts/check-due-dates` requiere header `Authorization: Bearer <CRON_SECRET>` para accesos desatendidos o sesión de usuario activa.
- **RNF-2 (Costo $0 Perpetuo):** Dependencia única de Resend sin librerías pesadas ni servicios de pago.
- **RNF-3 (Aesthetic en Correo):** Plantilla HTML responsive con tipografía moderna, detalles del gasto y botón directo para abrir la app.

## Requisitos Funcionales (EARS)
- **RF-1 (Evento):** CUANDO el endpoint de cron se ejecute diariamente, EL SISTEMA identificará los gastos fijos activos y cuotas pendientes que vencen en las próximas 24 horas y despachará los correos.
- **RF-2 (Permanente):** MIENTRAS el usuario consulte la sección `/alertas`, EL SISTEMA listará los próximos vencimientos ordenados cronológicamente con su estado de notificación.
- **RF-3 (Condición no deseada):** SI la llamada al endpoint de cron no incluye el `CRON_SECRET` correcto ni una sesión de usuario válida, ENTONCES EL SISTEMA retornará código 401 Unauthorized.
- **RF-4 (Evento):** CUANDO el usuario presione "Enviar Email de Prueba" en `/alertas`, EL SISTEMA disparará un correo de prueba al email del usuario para validar el canal de comunicación.
