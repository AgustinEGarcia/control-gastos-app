# Checklist de Tareas: Spec 004

- [x] **T1. Implementar generador de cuotas exacto y validador con pruebas unitarias.** Hecho cuando: `generateInstallmentSchedule` y `validateTransactionInput` tienen suite de Vitest en verde.
- [x] **T2. Implementar servicio de transacciones, cuotas y personas en `src/lib/services/transactions.ts`.** Hecho cuando: Las funciones de creación transaccional y pagos están tipadas y exportadas.
- [x] **T3. Crear componentes de resumen métrico y card con desglose de cuotas.** Hecho cuando: `TransactionSummaryCards` y `TransactionCard` permiten ver progreso y tildar cuotas pagadas.
- [x] **T4. Crear modal interactivo `TransactionForm.tsx` con simulación de cuotas.** Hecho cuando: Permite registrar compras con cálculo de cuotas en vivo y asignación a terceros.
- [x] **T5. Crear página principal `src/app/transacciones/page.tsx` y actualizar Navbar.** Hecho cuando: El módulo está conectado en la navegación y protegido por Middleware.
- [x] **T6. Validar con pruebas unitarias y E2E de Playwright.** Hecho cuando: Todas las pruebas unitarias y de navegación pasan al 100%.
