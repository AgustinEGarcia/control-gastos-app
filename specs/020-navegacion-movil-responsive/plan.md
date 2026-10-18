# Plan de Arquitectura — Spec 020: Navegación Móvil Responsive

## 1. Alcance Arquitectónico
- Modificar el componente `src/components/layout/Navbar.tsx` para incorporar:
  - Estado local `mobileMenuOpen` (boolean).
  - Efecto `useEffect` que detecte cambios en `pathname` y cierre automáticamente el menú móvil.
  - Botón trigger (`md:hidden`) en la barra superior con iconos accesibles (`hamburger` y `close`).
  - Panel colapsable/desplegable con animación CSS sutil (`animate-in fade-in slide-in-from-top-2 duration-200`).
  - Renderizado de los 8 enlaces de navegación en disposición vertical con espaciado táctil confortable (`py-2.5 px-3 rounded-lg`).
  - Sección inferior del menú móvil con indicador del correo de la sesión actual y botón de cerrar sesión.

## 2. Archivos Afectados
- `src/components/layout/Navbar.tsx`: Componente principal de navegación.

## 3. Plan de Pruebas
- Pruebas unitarias existentes de Vitest (`npm test`).
- Pruebas E2E de Playwright (`npm run test:e2e`), verificando especialmente `e2e/home.spec.ts` y las pruebas de redirección y enlaces de navegación del Navbar.
