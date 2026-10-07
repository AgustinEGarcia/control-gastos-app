# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Specs 001 a 009 completadas al 100%.
- Vistas activas: Dashboard Consolidado (`/dashboard`), Landing (`/`), Login (`/login`), Métodos de Pago (`/metodos-pago`), Gastos Fijos (`/gastos-recurrentes`), Tarjetas/Cuotas (`/transacciones`), Préstamos (`/prestamos`), Deudores (`/deudores`), Portal Público (`/estado-cuenta/[id]`) y Alertas (`/alertas`).
- Suite de pruebas: 60 pruebas unitarias con Vitest y 17 pruebas E2E con Playwright (Chromium) 100% en verde.
- Spec 009: Suscripciones y débitos fijos permanentes en tarjetas integrados en formularios, badges de tarjetas y cálculos de compromisos mensuales.

## Decisiones (y por qué)
- Suscripciones permanentes en tarjetas: Vinculadas a `recurring_expenses.payment_method_id` sin cuotas finitas. Se pueden cargar desde Gastos Fijos o desde el modal de Tarjetas con switch interactivo.
- Resumen mensual de tarjetas: Consolida cuotas finitas que vencen ese mes + suscripciones activas debitadas en esa tarjeta.
- Dashboard mensual 360°: Vista centralizada que separa matemáticamente el total propio a pagar del total a cobrar a terceros por compras compartidas.

## Aprendizajes y errores a evitar
- Supabase PostgREST Ambiguous Relationships: Cuando hay múltiples FKs a una misma tabla o relaciones opcionales, usar relación explícita con fallback seguro en memoria.
- Git Push: El PAT no posee permisos `workflow`. Todo cron debe residir en `vercel.json`.

## Próximos pasos
- Ejecutar el ALTER TABLE en Supabase: `ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL;`.
