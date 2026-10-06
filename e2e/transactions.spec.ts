import { test, expect } from '@playwright/test';

test.describe('Módulo de Transacciones y Cuotas', () => {
  test('debe redirigir a /login cuando un usuario sin sesión intenta acceder a /transacciones', async ({
    page,
  }) => {
    await page.goto('/transacciones');
    await expect(page).toHaveURL(/\/login\?redirect=%2Ftransacciones/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Control Financiero 360°');
  });

  test('el Navbar muestra el enlace a Compras y Cuotas', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Compras y Cuotas' });
    await expect(link).toBeVisible();
  });
});
