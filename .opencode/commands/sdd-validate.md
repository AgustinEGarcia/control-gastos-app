# Comando: /sdd-validate
Fase: Validación
Agente: build

## Parámetros
- `$1`: Identificador del feature (ej. `001-setup-y-core-financiero`).

## Propósito
Comprueba de forma exhaustiva, Requisito Funcional por Requisito Funcional (RF), que la implementación cumpla con la especificación mediante pruebas automatizadas y verificación en vivo (Playwright/Vitest).

## Instrucciones para el Agente
1. Lee `specs/$1/spec.md` y revisa cada RF.
2. Ejecuta la suite de pruebas unitarias (`npm test`).
3. Ejecuta la suite de pruebas E2E (`npm run test:e2e`).
4. Genera un reporte de conformidad de los criterios de aceptación y marca la spec como `implementada`.
