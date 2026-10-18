# Spec 020: Navegación Móvil Responsive y Menú Desplegable

## 1. Contexto y Problema
En la versión actual de la aplicación, el componente `Navbar` contiene todos los enlaces de navegación dentro de un elemento con clase `hidden md:flex`. En dispositivos móviles (pantallas con ancho `< 768px`), la barra de navegación no muestra ninguna opción de acceso a las secciones de la aplicación (Dashboard, Gastos Fijos, Compras en Cuotas, Préstamos, Deudores, Métodos de Pago, Alertas, Personas), impidiendo al usuario navegar cuando accede desde su teléfono celular.

## 2. Objetivos
- Dotar al `Navbar` de un botón de menú hamburguesa visible exclusivamente en pantallas móviles (`md:hidden`).
- Desplegar un menú móvil sobrio, elegante y fluido bajo la estética de **Minimalismo Técnico (Linear / Vercel)**:
  - Fondo `bg-zinc-950/95` con borde inferior `border-zinc-800/80` y backdrop blur.
  - Lista de enlaces ordenados con tipografía limpia, estados activo/hover destacados y badges semánticos si corresponde.
  - Inclusión de los datos del usuario conectado (email) y botón de cierre de sesión accesible en móvil.
- Comportamiento de cierre automático:
  - Cerrar el menú al hacer clic en cualquier enlace.
  - Cerrar al presionar el botón de cierre (icono `✕`).
  - Cerrar al cambiar de ruta (`pathname`).
- Mantener compatibilidad 100% con todas las pruebas unitarias y E2E existentes.

## 3. Criterios de Aceptación
1. **Visibilidad Condicional**: El botón de menú sólo es visible en móviles (`< md`), mientras que en pantallas de escritorio (`>= md`) se mantiene la barra horizontal actual.
2. **Interactividad**: Al presionar el botón hamburguesa, se abre el panel de navegación móvil mostrando todos los links:
   - Dashboard (`/dashboard`)
   - Gastos Fijos (`/gastos-recurrentes`)
   - Compras y Cuotas (`/transacciones`)
   - Préstamos (`/prestamos`)
   - Deudores (`/deudores`)
   - Métodos de Pago (`/metodos-pago`)
   - Alertas (`/alertas`)
   - Personas (`/personas`)
3. **Cierre de Sesión Móvil**: El usuario puede ver su email y un botón para cerrar sesión desde el menú móvil.
4. **Pruebas Verdes**: Ningún test E2E o unitario debe romperse.
