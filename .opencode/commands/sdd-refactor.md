# Comando: /sdd-refactor
Fase: Limpieza
Agente: build

## Parámetros
- `$1`: Archivo o módulo a refactorizar.

## Propósito
Mejora la calidad del código, legibilidad, tipado estricto o modularidad (DRY) SIN alterar ningún Requisito Funcional (RF) ni romper contratos existentes.

## Instrucciones para el Agente
1. Ejecuta la suite de pruebas previa (`npm test`).
2. Aplica la refactorización conservando la misma interfaz pública y comportamiento.
3. Vuelve a ejecutar las pruebas y verifica que se mantengan 100% en verde.
4. Muestra un diff claro con las justificaciones de la refactorización.
