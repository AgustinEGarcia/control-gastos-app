# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Specs 001 a 004 completadas al 100%.
- Vistas activas: Landing (`/`), Login (`/login`), Métodos de Pago (`/metodos-pago`), Gastos Fijos (`/gastos-recurrentes`) y Tarjetas/Cuotas (`/transacciones`).
- Suite de pruebas: 24 pruebas unitarias con Vitest y 6 pruebas E2E con Playwright (Chromium) 100% en verde.

## Decisiones (y por qué)
- Algoritmo de cuotas exacto con compensación de centavos remanentes en la 1° cuota para garantizar suma 100.00% idéntica al total.
- Separación contable entre consumos propios y consumos prestados a terceros mediante `beneficiary_person_id`.
- Checkboxes individuales por cuota con actualización instantánea de porcentaje de progreso en la UI.

## Aprendizajes y errores a evitar
- Manejar saltos de mes en cuotas fijas con control de días límite para evitar fechas erróneas (ej. 30 de febrero).
- Incluir relaciones y joins tipados en Supabase para evitar consultas N+1 en transacciones.

## Próximos pasos
- Iniciar Spec 005: Préstamos Personales Multidivisa (ARS / USD) y Abonos (deudas con terceros y portal de deudores).
