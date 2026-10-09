# Spec 014 — Edición Integral de Entidades y Eliminación Segura de Personas
Estado: aprobada

## Contexto, Usuarios e Historias de Usuario
- **Contexto**:
  1. Actualmente las pantallas de Gastos Fijos, Préstamos, Transacciones y Métodos de Pago permiten crear y borrar elementos, pero no editarlos cuando el usuario necesita corregir datos cargados.
  2. Asimismo, en el sistema se registran personas (contactos/deudores), pero no existe la opción de eliminar personas creadas que ya no se utilicen o se hayan creado por error, asegurando que no queden datos huérfanos.
- **Usuario**: Usuario del sistema que necesita actualizar o corregir registros existentes y depurar su lista de contactos/personas de forma segura.
- **Historia de Usuario (HU-1) - Edición de Gastos Fijos**: Como usuario en `/gastos-recurrentes`, quiero hacer clic en "Editar" (`✏️`) en un gasto para modificar su nombre, categoría, monto estimado, día de pago o método de pago.
- **Historia de Usuario (HU-2) - Edición de Préstamos**: Como usuario en `/prestamos`, quiero hacer clic en "Editar" (`✏️`) en un préstamo para corregir la persona asociada, monto original, divisa (ARS/USD), fecha, vencimiento o notas.
- **Historia de Usuario (HU-3) - Edición de Compras/Cuotas**: Como usuario en `/transacciones`, quiero hacer clic en "Editar" (`✏️`) en una transacción para corregir su descripción, fecha de compra o tarjeta asociada.
- **Historia de Usuario (HU-4) - Edición de Métodos de Pago**: Como usuario en `/metodos-pago`, quiero hacer clic en "Editar" (`✏️`) en una tarjeta/cuenta para actualizar su nombre, titular o días de cierre/vencimiento.
- **Historia de Usuario (HU-5) - Eliminación Segura de Personas**: Como usuario en `/deudores` (o gestión de personas), quiero poder eliminar una persona creada, verificando previamente que no tenga ningún gasto, cuota, préstamo ni abono asociado. Si tiene registros vinculados, el sistema debe bloquear la eliminación y explicarle claramente el motivo al usuario.

## Definiciones, Casos Límite y Fuera de Alcance
- **Definiciones**:
  - `deletePerson(supabase, personId)`: Función con validación de integridad referencial preventiva que consulta `transactions`, `personal_loans` y `payments_received`.
  - `Edición In-Place / Modal`: Formulario con campos precargados y botón "Guardar Cambios".
- **Casos Límite**:
  - Intento de eliminar persona con transacciones: Se bloquea y se muestra alerta: *"No se puede eliminar a [Nombre] porque tiene X gastos o compras asociadas."*
  - Intento de eliminar persona con préstamos: Se bloquea y se muestra alerta: *"No se puede eliminar a [Nombre] porque tiene préstamos registrados."*
  - Persona sin registros asociados: Se solicita confirmación explícita y se elimina exitosamente.
  - Edición de préstamo con abonos existentes: Se preservan los abonos y se recalcula el saldo restante con respecto al nuevo monto original.
- **Fuera de Alcance**:
  - Eliminación en cascada forzada de personas con deudas vivas (por seguridad contable se prohíbe el borrado destructivo accidental).

## Requisitos No Funcionales y de Seguridad
- **Integridad Referencial (Zero Data Loss)**: Garantizar que ninguna transacción ni préstamo quede con clave foránea huérfana.
- **Consistencia Visual**: Botón de editar `✏️` estandarizado en todas las tarjetas de la app, con diseño oscuro y feedback visual inmediato.
- **RLS**: Todas las operaciones `UPDATE` y `DELETE` limitadas al `auth.uid() = user_id`.

## Requisitos Funcionales (EARS)
- **RF-1**: CUANDO el usuario visualice una tarjeta en Gastos Fijos, Préstamos, Compras o Métodos de Pago, EL SISTEMA debe mostrar un botón interactivo de "Editar" (`✏️`).
- **RF-2**: CUANDO el usuario haga clic en "Editar", EL SISTEMA debe abrir el formulario correspondiente con los valores precargados.
- **RF-3**: CUANDO el usuario guarde las modificaciones, EL SISTEMA debe validar los datos, persistirlos en Supabase y actualizar la vista en tiempo real.
- **RF-4**: CUANDO el usuario solicite eliminar una persona, EL SISTEMA debe verificar si tiene registros asociados en `transactions`, `personal_loans` o `payments_received`.
- **RF-5**: SI la persona tiene registros asociados, ENTONCES EL SISTEMA debe abortar la eliminación y mostrar un mensaje descriptivo indicando por qué no se puede borrar.
- **RF-6**: SI la persona no tiene ningún registro asociado, ENTONCES EL SISTEMA debe solicitar confirmación y borrarla de la base de datos, actualizando la lista de personas y deudores.
