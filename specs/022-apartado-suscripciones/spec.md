# Spec 022: Apartado de Suscripciones y Estimación Mensual

## 1. Contexto y Problema
El usuario necesita un apartado exclusivo y dedicado para gestionar todas sus suscripciones periódicas (plataformas de streaming, servicios en la nube, herramientas digitales, membresías o débitos automáticos). El objetivo principal es tener visibilidad inmediata de **cuánto dinero se gasta por mes en suscripciones** (monto mensual estimado acumulado), en qué fechas se debitan y con qué tarjetas o medios de pago se abonan.

## 2. Requerimientos Funcionales
1. **Registro y Edición de Suscripciones**:
   - **Nombre del Servicio**: Texto obligatorio (ej: "Netflix", "Spotify Familiar", "ChatGPT Plus", "iCloud 200GB", "Gimnasio").
   - **Monto Estimado Mensual**: Valor numérico positivo mayor a 0.
   - **Moneda**: Selección entre Pesos ($ ARS) y Dólares ($ USD).
   - **Día de Cobro / Débito**: Día del mes (1 a 31).
   - **Método de Pago**: Tarjeta o cuenta asociada (opcional o de la lista de métodos de pago).
   - **Categoría**: Clasificación temática (Streaming & Video, Música & Audio, Software & IA, Almacenamiento, Fitness & Salud, Otros).
   - **Estado**: Activa o Pausada / Cancelada (para mantener el registro sin que sume al total mensual).
2. **Panel de Métricas Clave**:
   - **Gasto Mensual Estimado en ARS**: Suma total de suscripciones activas en pesos.
   - **Gasto Mensual en USD**: Suma de suscripciones activas en dólares.
   - **Total de Suscripciones Activas**: Conteo de servicios activos.
   - **Próximo Débito**: Servicio más cercano a cobrarse según el día actual del mes.
3. **Listado y Visualización**:
   - Tarjetas o tabla con estética de **Minimalismo Técnico (Linear / Vercel)**.
   - Filtros por categoría y por estado (Activas vs Pausadas).
   - Acciones directas:
     - Alternar estado (Pausar / Reactivar con 1 clic).
     - Editar datos.
     - Eliminar suscripción.
4. **Navegación e Integración**:
   - Acceso en el Navbar principal y en el nuevo menú móvil mediante el enlace **"Suscripciones"** (`/suscripciones`).
   - Sincronización con el ecosistema de gastos recurrentes de la app.
5. **Persistencia Resiliente**:
   - Almacenamiento con persistencia resiliente (Supabase + fallback local Zero Downtime) garantizando funcionamiento tanto en desarrollo como en producción.
