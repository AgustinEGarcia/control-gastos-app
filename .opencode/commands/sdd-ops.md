# Comando: /sdd-ops
Fase: DevOps/CI
Agente: build

## Propósito
Genera o actualiza la configuración de despliegue seguro, integración continua (GitHub Actions), verificación de build (`next build`) y empaquetado si aplica.

## Instrucciones para el Agente
1. Valida la preparación del entorno para producción ejecutando `npm run build`.
2. Genera flujos de trabajo de CI/CD (ej. `.github/workflows/ci.yml`) que ejecuten linters (`npm run lint`), pruebas unitarias (`npm test`) y pruebas E2E (`npm run test:e2e`).
3. Asegura que las variables de entorno de producción estén adecuadamente configuradas en el proveedor (Vercel/GitHub Secrets).
