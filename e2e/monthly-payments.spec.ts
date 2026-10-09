import { test, expect } from '@playwright/test';

test.describe('Control de Pagos Mensuales y Métricas de Dashboard (Spec 012)', () => {
  test('debe redirigir a login si no hay sesión y registrar el redirect', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
  });

  test('el enlace de Dashboard está accesible desde la navegación principal', async ({ page }) => {
    await page.goto('/');
    const dashboardLink = page.getByRole('link', { name: 'Dashboard', exact: true });
    await expect(dashboardLink).toBeVisible();
    await dashboardLink.click();
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
  });
});
