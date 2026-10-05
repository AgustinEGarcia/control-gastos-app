# Comando: /sdd-audit
Fase: Seguridad
Agente: plan

## Propósito
Realiza un escaneo estático y auditoría de seguridad preventiva (Zero Trust, OWASP Top 10), detecta dependencias obsoletas o vulnerables (`npm audit`), y verifica que no existan credenciales hardcodeadas ni fugas de RLS previo a un merge o entrega.

## Instrucciones para el Agente
1. Ejecuta análisis de dependencias mediante `npm audit`.
2. Escanea el código en busca de patrones inseguros (secrets hardcodeados, bypassing de RLS, falta de sanitización de inputs, inyecciones).
3. Revisa la integridad del archivo `.env.example` (valores vacíos obligatorios).
4. Genera un reporte detallado clasificando hallazgos por severidad (Crítico, Alto, Medio, Bajo) con sus recomendaciones de mitigación.
