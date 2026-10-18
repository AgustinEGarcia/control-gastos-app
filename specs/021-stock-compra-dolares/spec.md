# Spec 021: Módulo de Stock y Compras de Dólares (USD)

## 1. Contexto y Problema
El usuario necesita llevar un control preciso de sus compras de moneda extranjera (Dólares USD) y de su tenencia actual acumulada. Busca saber exactamente cuántos dólares tiene ahorrados/comprados, en qué fechas los adquirió, a qué tipo de cambio o cotización en pesos los compró y cuál es su costo promedio de adquisición.

## 2. Requerimientos Funcionales
1. **Registro de Compra de Dólares**:
   - **Fecha**: Por defecto la fecha actual (`YYYY-MM-DD`), con selector de calendario para poder modificarla si fue una compra anterior.
   - **Cantidad de Dólares (USD)**: Número positivo mayor a 0 (ej: 500.00).
   - **Cotización de Compra ($ ARS)**: Tipo de cambio pagado por dólar (ej: 1320.50).
   - **Total Pagado en Pesos ($ ARS)**: Cálculo automático reactivo (`USD * Cotización`).
   - **Notas / Origen (Opcional)**: Campo de texto para indicar procedencia (ej: "Dólar MEP", "Dólar Blue", "Ahorro bancario").
2. **Panel de Métricas Principales**:
   - **Total Stock USD**: Suma acumulada de dólares disponibles.
   - **Cotización Promedio de Compra**: Promedio ponderado (`Total ARS invertidos / Total USD comprados`).
   - **Total Invertido en ARS**: Suma total de pesos destinados a la compra de dólares.
   - **Total de Operaciones Registradas**: Conteo de compras históricas.
3. **Tabla e Historial de Operaciones**:
   - Listado cronológico de compras ordenadas por fecha descendente.
   - Columnas: Fecha, USD comprados, Cotización pagada, Total en ARS, Origen/Notas, Acciones.
   - Acciones:
     - **Editar**: Permite modificar cualquier dato de una compra anterior.
     - **Eliminar**: Elimina el registro con confirmación previa.
4. **Diseño y Estética**:
   - Integración visual bajo **Minimalismo Técnico (Linear / Vercel)**:
     - Fondos `bg-black` y `bg-zinc-950`.
     - Bordes sutiles `border-zinc-800/80`.
     - Tipografía financiera monoespaciada (`font-mono`) para divisas, tipos de cambio y fechas.
     - Botones de acción en blanco sólido y secundario grafito.
5. **Acceso y Navegación**:
   - Incorporar la nueva sección `/dolares` en el Navbar tanto en versión escritorio como en el nuevo menú móvil.
6. **Validación en Local**:
   - Ejecutar la aplicación en servidor de desarrollo local (`localhost:3000/dolares`) para que el usuario pueda visualizar la pantalla y otorgar su visto bueno antes de realizar el commit y push final a producción.
