import { test, expect } from '@playwright/test';

test.describe('Gastos Variables Mensuales y Bolsa de Gastos Varios (Spec 013)', () => {
  test('debe proteger la ruta /dashboard y requerir autenticación', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
  });

  test('debe permitir navegar a la app y comprobar que el link a Dashboard está visible', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Dashboard', exact: true });
    await expect(link).toBeVisible();
  });
});
