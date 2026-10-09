# Spec 012 — Control de Pagos Mensuales y Totales en Dashboard
Estado: implementada

## Contexto, Usuarios e Historias de Usuario
- **Contexto**: El sistema calcula y consolida mensualmente los gastos fijos recurrentes y las cuotas de compras. Sin embargo, en el Dashboard el usuario no puede marcar directamente qué gastos ya pagó durante el mes, ni ver un desglose claro e inmediato de cuánto sumó lo que ya pagó frente al total restante por abonar en el período seleccionado.
- **Usuario**: Usuario que gestiona sus finanzas personales mes a mes y necesita saber con certeza qué cuentas ya saldó y cuánto dinero le resta pagar en el mes.
- **Historia de Usuario (HU-1)**: Como usuario que consulta su Dashboard mensual, quiero marcar o desmarcar con un solo clic cualquier gasto (fijo o cuota) como "Pagado" para llevar el control operativo del mes.
- **Historia de Usuario (HU-2)**: Como usuario en el Dashboard, quiero ver tarjetas métricas destacadas que muestren:
  1. El Total General de gastos propios del mes.
  2. El Total Ya Pagado en el mes.
  3. El Total Pendiente por pagar restante.
  4. La cantidad de gastos abonados sobre el total y el porcentaje cubierto.

## Definiciones, Casos Límite y Fuera de Alcance
- **Definiciones**:
  - `Gasto Pagado en el Mes`: Un compromiso (gasto fijo o cuota) marcado explícitamente como saldado para el período (`year`, `month`) seleccionado.
  - `Total Propio del Mes`: Suma de gastos fijos activos y cuotas de tarjetas propias del mes.
  - `Total Pagado`: Suma de los montos de compromisos propios con estado pagado en el mes.
  - `Total Pendiente`: Diferencia aritmética `Total Propio del Mes - Total Pagado`.
- **Casos Límite**:
  - Un gasto fijo marcado como pagado en un mes (ej. Octubre) no debe aparecer como pagado en otros meses (ej. Noviembre). El estado es mensual.
  - Cambio de mes en el selector: Debe recalcular inmediatamente los totales abonados y pendientes del mes seleccionado.
  - Gasto sin monto real cargado: Se utiliza su monto estimado para el cálculo de pagado o pendiente.
  - Reversión de pago: El usuario puede desmarcar un gasto pagado en cualquier momento para volverlo a estado pendiente, recalculando los totales al instante.
- **Fuera de Alcance**:
  - Conciliación bancaria automática o conexión por API con entidades bancarias (Open Banking).
  - Generación de comprobantes fiscales de pago de servicios.

## Requisitos No Funcionales y de Seguridad
- **Resiliencia y Offline/Fallback**: Almacenamiento con persistencia resiliente (tabla Supabase con sincronización y fallback local seguro para evitar bloqueos si no se corrió la migración).
- **Reactividad Visual**: Actualización instantánea en la UI al tildar o destildar un pago, sin recargar toda la página.
- **Estética**: Diseño Glassmorphism oscuro con badges y checkboxes con animaciones sutiles acordes a la identidad visual de la app.

## Requisitos Funcionales (EARS)
- **RF-1**: CUANDO el usuario visualice el Cronograma de Vencimientos en `/dashboard`, EL SISTEMA debe mostrar una acción interactiva (botón/checkbox de alternancia de pago) en cada gasto o cuota.
- **RF-2**: CUANDO el usuario haga clic para marcar un gasto como pagado en el mes actual, EL SISTEMA debe persistir el estado de pago del ítem para ese año y mes, y actualizar visualmente su badge a "Pagado".
- **RF-3**: CUANDO el usuario desmarque un gasto previamente pagado, EL SISTEMA debe revertir el estado a "Pendiente" y recalcular las métricas.
- **RF-4**: CUANDO cambie el estado de pago de uno o más gastos, EL SISTEMA debe actualizar en tiempo real las tarjetas métricas del Dashboard:
  - "Total Gastos del Mes"
  - "Total Ya Pagado" (resaltado en verde esmeralda)
  - "Total Pendiente por Pagar" (resaltado en advertencia/ámbar si hay pendiente)
  - Barra de porcentaje y contador "X de Y pagados".
- **RF-5**: SI el usuario cambia el año o mes en el selector, ENTONCES EL SISTEMA debe consultar y aplicar los pagos correspondientes al nuevo período seleccionado.
