# Spec 015 — Vista de Lista en Transacciones, Filtro por Métodos, Totales en Dashboard y ABM de Personas
Estado: implementada

## Contexto, Usuarios e Historias de Usuario
- **Contexto**:
  1. En `/transacciones`, las compras en cuotas se exhibían en tarjetas rectangulares en grid, lo cual resultaba incómodo para comparar consumos en pantalla. Además, el formulario solo admitía ingresar el monto total sin permitir ingresar directamente el valor de la cuota, ni seleccionar claramente el mes de inicio/primer débito de la cuota 1. Tampoco era posible filtrar las compras por tarjeta o método de pago específico.
  2. En el `/dashboard`, se visualizan métricas globales del mes, pero no existía un desglose directo y visible del total que vence por cada método de pago o tarjeta arriba de la lista de vencimientos.
  3. No existía una pantalla dedicada de ABM (Alta, Baja, Modificación) para personas/terceros (`/personas`), dificultando la gestión de contactos fuera de los modales secundarios o el listado de deudores.

- **Usuario**: Usuario del sistema que gestiona sus compras financiadas, supervisa sus resúmenes de tarjetas en el dashboard y necesita administrar de forma centralizada la lista de personas y contactos vinculados a sus finanzas.

- **Historia de Usuario (HU-1) - Vista de Lista en Transacciones**:
  Como usuario en `/transacciones`, quiero visualizar mis compras y cuotas en formato de lista / renglones compactos con información clave a simple vista, para tener una lectura ágil y ordenada de mis consumos.

- **Historia de Usuario (HU-2) - Filtro por Método de Pago en Transacciones**:
  Como usuario en `/transacciones`, quiero seleccionar un método de pago en un filtro para ver únicamente los consumos asociados a esa tarjeta o cuenta bancaria.

- **Historia de Usuario (HU-3) - Doble Modo de Cálculo y Primer Vencimiento en Registro de Compras**:
  Como usuario en el modal de nueva compra, quiero poder optar entre ingresar el "Monto Total" o el "Monto por Cuota" (calculando automáticamente el otro valor con la cantidad de cuotas), y especificar con exactitud la fecha del primer vencimiento para definir cuándo entra la primera cuota.

- **Historia de Usuario (HU-4) - Totales por Método de Pago en Dashboard**:
  Como usuario en `/dashboard`, quiero ver arriba del listado cronológico de vencimientos del mes una serie de tarjetas o badges con el total acumulado a pagar en cada método de pago en el mes seleccionado.

- **Historia de Usuario (HU-5) - Pantalla de ABM de Personas**:
  Como usuario, quiero acceder a `/personas` desde la navegación para ver el listado de personas registradas, agregar nuevas, editar sus datos (nombre y email) y eliminarlas de forma segura si no tienen vínculos financieros activos.

---

## Definiciones, Casos Límite y Fuera de Alcance
- **Definiciones**:
  - `calculatePaymentMethodMonthlyTotals`: Función que agrupa y calcula el total a pagar en un mes por cada método de pago (sumando cuotas de compras y gastos fijos activos).
  - `updatePerson(supabase, personId, data)`: Función que actualiza el nombre y email de una persona en la tabla `people`.
  - `Modo Cálculo`: Alternancia en formulario entre `total` (ingresa total -> calcula cuota) y `installment` (ingresa cuota -> calcula total).

- **Casos Límite**:
  - *Redondeo de cuotas*: Si el total dividido las cuotas tiene decimales periódicos, la suma de las cuotas debe ser consistente con el total y no diferir por centavos.
  - *Método de pago sin consumos en el mes*: En el dashboard, solo se listan métodos que tengan importes pendientes o asociados en el mes en curso (o con saldo mayor a 0).
  - *Eliminación de persona con registros*: Se bloquea preventivamente con mensaje descriptivo, manteniendo el comportamiento seguro de la Spec 014.
  - *Filtro de método de pago vacío*: Al seleccionar "Todos", se muestran todos los consumos respetando la pestaña activa (Propios, Terceros o Todos).

- **Fuera de Alcance**:
  - Eliminación en cascada forzada de registros vinculados a personas.
  - Modificación de transacciones históricas al cambiar el nombre de una persona (se preserva la integridad referencial).

---

## Requisitos No Funcionales y de Seguridad
- **Consistencia Visual**: Diseño responsivo y moderno (modo oscuro con paleta zinc/emerald/cyan), filas con microinteracciones y feedback inmediato.
- **Rendimiento**: Filtrado y cálculos reactivos en memoria para transiciones instantáneas sin recargas innecesarias.
- **Seguridad RLS**: Todas las consultas y mutaciones limitadas a `auth.uid() = user_id`.

---

## Requisitos Funcionales (EARS)

### Pantalla de Transacciones (`/transacciones`)
- **RF-1**: CUANDO el usuario acceda a `/transacciones`, EL SISTEMA debe renderizar las compras en cuotas en un formato de lista en renglones horizontales, incluyendo descripción, fecha, método de pago, progreso de cuotas pagadas, monto total y acciones (`✏️`, `🗑️`, ver cuotas).
- **RF-2**: CUANDO el usuario seleccione un método de pago en el filtro de `/transacciones`, EL SISTEMA debe filtrar reactivamente el listado mostrando únicamente las compras de ese método de pago.
- **RF-3**: CUANDO el usuario abra el formulario de registrar compra, EL SISTEMA debe permitir alternar entre ingresar "Monto Total" o "Monto por Cuota", recalculando automáticamente el campo complementario al cambiar la cantidad de cuotas.
- **RF-4**: CUANDO el usuario indique la fecha de "Primer Vencimiento" en el formulario de compra, EL SISTEMA debe programar las cuotas a partir de esa fecha con incrementos mensuales correlativos.

### Pantalla de Dashboard (`/dashboard`)
- **RF-5**: CUANDO el usuario visualice el `/dashboard`, EL SISTEMA debe mostrar arriba de la lista de vencimientos del mes un bloque con el total consolidado a pagar por cada método de pago activo en ese mes.

### ABM de Personas (`/personas`)
- **RF-6**: CUANDO el usuario navegue en la aplicación, EL SISTEMA debe incluir en el `Navbar` el enlace directo a "Personas" (`/personas`).
- **RF-7**: CUANDO el usuario acceda a `/personas`, EL SISTEMA debe listar todas las personas registradas por el usuario autenticado.
- **RF-8**: CUANDO el usuario complete el formulario de alta en `/personas`, EL SISTEMA debe validar el nombre, persistir la persona en la base de datos y refrescar el listado.
- **RF-9**: CUANDO el usuario edite una persona en `/personas`, EL SISTEMA debe permitir modificar su nombre y email, actualizando la base de datos previa validación.
- **RF-10**: CUANDO el usuario solicite eliminar una persona en `/personas`, EL SISTEMA debe verificar si tiene registros asociados en `transactions`, `personal_loans` o `payments_received`; si tiene, debe rechazar el borrado explicando el motivo; si no tiene, debe eliminarla previa confirmación.
