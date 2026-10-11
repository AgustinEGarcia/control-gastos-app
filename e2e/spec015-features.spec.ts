import { test, expect } from '@playwright/test';

test.describe('Spec 015 — Lista Transacciones, Totales y ABM Personas', () => {
  test('debe redirigir a login al acceder a /personas sin sesión', async ({ page }) => {
    await page.goto('/personas');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fpersonas/);
  });

  test('el Navbar contiene el enlace a la nueva sección Personas', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    const link = nav.getByRole('link', { name: 'Personas', exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/personas');
  });

  test('Navbar contiene enlace a Compras y Cuotas', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    const link = nav.getByRole('link', { name: 'Compras y Cuotas', exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/transacciones');
  });
});
