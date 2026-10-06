# Tareas de Implementación — Spec 007: Alertas Preventivas por Email con Resend

- [x] **Tarea 1:** Crear servicio `src/lib/services/alerts.ts` con algoritmos de detección de vencimientos, generador de plantillas HTML y adaptador de Resend.
- [x] **Tarea 2:** Escribir pruebas unitarias en `src/lib/services/alerts.test.ts` con Vitest y validar ejecución limpia.
- [x] **Tarea 3:** Crear endpoint API `src/app/api/alerts/check-due-dates/route.ts` con soporte para llamadas de cron autenticadas (`CRON_SECRET`) y usuarios logueados.
- [x] **Tarea 4:** Crear componentes UI y panel de control en `src/components/alerts/AlertsOverview.tsx` y `src/app/alertas/page.tsx`.
- [x] **Tarea 5:** Integrar enlace en `Navbar.tsx` y ajustar reglas de seguridad en `middleware.ts`.
- [x] **Tarea 6:** Crear pruebas E2E con Playwright en `e2e/alerts.spec.ts`.
- [x] **Tarea 7:** Ejecutar `npm.cmd test` y `npm.cmd run test:e2e`, verificando 100% verde.
- [x] **Tarea 8:** Actualizar `MEMORY.md` (< 50 líneas) y realizar commit/push con Conventional Commits.
