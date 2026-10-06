# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Specs 001, 002 y 003 completadas al 100%.
- Vistas activas: Landing Page (`/`), Auth (`/login`), Métodos de Pago (`/metodos-pago`) y Gastos Fijos (`/gastos-recurrentes`).
- Suite de pruebas: 16 pruebas unitarias con Vitest y 4 pruebas E2E con Playwright (Chromium) 100% en verde.

## Decisiones (y por qué)
- Cálculo reactivo de variaciones de gastos en `calculateExpenseTotals` comparando montos reales vs estimados solo en gastos activos.
- Input editable inline en tarjetas de gastos para actualización ágil de montos al recibir facturas.
- Rutas protegidas centralizadas en `src/middleware.ts`.

## Aprendizajes y errores a evitar
- Modo Webpack activado en `next dev --webpack` para compatibilidad en Windows con el webServer de Playwright.
- En gastos recurrentes sin factura cargada, tomar el estimado como base para el total mensual proyectado.

## Próximos pasos
- Iniciar Spec 004: Transacciones y Cuotas (compras con tarjeta propia/tercero, Mercado Crédito y consumos compartidos a cobrar).
