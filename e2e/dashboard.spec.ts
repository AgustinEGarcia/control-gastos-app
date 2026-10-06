import { test, expect } from '@playwright/test';

test.describe('Módulo de Dashboard Consolidado Mensual 360° (Spec 008)', () => {
  test('la página principal / muestra la landing page para usuarios no autenticados', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Control total de tus');
    const loginLink = page.getByRole('link', { name: 'Iniciar Sesión' });
    await expect(loginLink).toBeVisible();
  });

  test('debe redirigir a /login cuando un usuario sin sesión intenta acceder a /dashboard', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Control Financiero 360°');
  });

  test('el Navbar muestra el enlace a Dashboard', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Dashboard', exact: true });
    await expect(link).toBeVisible();
  });
});
