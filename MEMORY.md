# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Specs 001 a 008 completadas al 100%.
- Vistas activas: Dashboard Consolidado (`/dashboard`), Landing (`/`), Login (`/login`), Métodos de Pago (`/metodos-pago`), Gastos Fijos (`/gastos-recurrentes`), Tarjetas/Cuotas (`/transacciones`), Préstamos (`/prestamos`), Deudores (`/deudores`), Portal Público (`/estado-cuenta/[id]`) y Alertas (`/alertas`).
- Suite de pruebas: 55 pruebas unitarias con Vitest y 17 pruebas E2E con Playwright (Chromium) 100% en verde.

## Decisiones (y por qué)
- Dashboard mensual 360°: Vista centralizada con selector de mes/año que separa matemáticamente el total propio a pagar del total a cobrar a terceros por compras compartidas.
- Cronograma cronológico unificado: Ordenamiento de gastos fijos y cuotas de tarjetas por día del mes.
- Redirección inteligente en `/`: Usuarios con sesión activa van directo a `/dashboard`; anónimos ven la landing page.

## Aprendizajes y errores a evitar
- En Playwright usar `exact: true` al seleccionar enlaces con nombres compartidos para evitar violaciones de strict mode.
- Cargar gastos y transacciones en paralelo con `Promise.all` para optimizar latencia.

## Próximos pasos
- Punto 2: Configurar automatización del Cron Job diario (`vercel.json` / GitHub Actions).
- Punto 3: Validar tablas en Supabase y desplegar en Vercel.
