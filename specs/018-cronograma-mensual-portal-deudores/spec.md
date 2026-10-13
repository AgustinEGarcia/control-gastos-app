# Spec 018 — Cronograma Mensual y Navegación de Cuotas en Portal de Deudores

## Contexto y Motivación
Cuando un usuario comparte el enlace público de estado de cuenta (`/estado-cuenta/[personId]`) con un deudor o familiar, la vista previa consolidaba el saldo total histórico y el total global financiado de cada compra.
Para el deudor resultaba confuso porque no distinguía cuánto debía transferir o abonar en el mes en curso ni cómo se programaban sus cuotas en los meses futuros.
Esta spec incorpora un navegador mensual interactivo (idéntico al Dashboard principal de la aplicación) para que el deudor pueda consultar mes a mes el detalle exacto de las cuotas a pagar, el total del mes seleccionado y el cronograma venidero.

## Historias de Usuario
- **HU-1 (Navegación Mensual para Deudores):** Como deudor que recibe su enlace de estado de cuenta, quiero poder avanzar y retroceder entre meses para ver exactamente qué cuotas vencen en cada período.
- **HU-2 (Total a Pagar en el Mes):** Como deudor, quiero ver un importe destacado con el total que me corresponde pagar en el mes seleccionado.
- **HU-3 (Detalle de Cuotas del Período):** Como deudor, quiero ver la lista de cuotas de mis compras correspondientes a ese mes con su número de cuota (ej. `Cuota 2 de 8`), nombre de la compra, tarjeta asociada y monto mensual.
- **HU-4 (Resumen Global Preservado):** Como deudor y como titular, quiero que se mantenga visible el saldo general pendiente, los préstamos directos y los pagos/abonos ya acreditados para auditoría y transparencia total.

## Requisitos Funcionales (EARS)
- **RF-1 (Selector Mensual):** MIENTRAS el deudor visualice su estado de cuenta, EL SISTEMA mostrará controles de navegación mensual (`◀ Mes Anterior`, `Mes Año`, `Mes Siguiente ▶` y botón de retorno al `Mes Actual`), inicializado en el mes y año presente.
- **RF-2 (Cálculo de Cuotas del Mes):** CUANDO el deudor seleccione un mes y año, EL SISTEMA filtrará todas las cuotas asociadas a sus compras cuyo `due_date` pertenezca a ese mes y calculará la sumatoria total del mes.
- **RF-3 (Listado de Cuotas del Período):** MIENTRAS existan cuotas con vencimiento en el mes seleccionado, EL SISTEMA renderizará cada ítem con la descripción de la compra, cuota (`X / Total`), tarjeta/método de pago y monto de la cuota.
- **RF-4 (Estado Vacío Mensual):** SI el deudor no tiene cuotas por vencer en el mes seleccionado, EL SISTEMA mostrará un mensaje amigable indicando que no hay cuotas para ese período.
- **RF-5 (Integración con Devoluciones):** Si una compra o crédito a favor tiene cuotas en ese mes, se computará adecuadamente en el total mensual a pagar.

## Requisitos No Funcionales
- **RNF-1 (Accesibilidad Móvil):** Diseño optimizado para celulares y pantallas táctiles (uso frecuente desde WhatsApp).
- **RNF-2 (Zero Trust y Acceso Anónimo):** La consulta opera sobre los datos de la persona devueltos por la RPC segura `get_public_debtor_statement` sin requerir credenciales al deudor.
- **RNF-3 (Rendimiento):** Filtrado y cálculo en memoria ultra rápido sin requests innecesarios adicionales.
