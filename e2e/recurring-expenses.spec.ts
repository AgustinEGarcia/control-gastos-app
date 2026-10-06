import { test, expect } from '@playwright/test';

test.describe('Módulo de Gastos Fijos Recurrentes', () => {
  test('debe redirigir a /login cuando un usuario sin sesión intenta acceder a /gastos-recurrentes', async ({
    page,
  }) => {
    await page.goto('/gastos-recurrentes');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fgastos-recurrentes/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Control Financiero 360°');
  });

  test('el Navbar muestra el enlace a Gastos Fijos', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Gastos Fijos' });
    await expect(link).toBeVisible();
  });
});
