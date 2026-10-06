import { test, expect } from '@playwright/test';

test.describe('Módulo de Préstamos Personales Multidivisa (Spec 005)', () => {
  test('debe redirigir a /login cuando un usuario sin sesión intenta acceder a /prestamos', async ({
    page,
  }) => {
    await page.goto('/prestamos');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fprestamos/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Control Financiero 360°');
  });

  test('el Navbar muestra el enlace a Préstamos', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Préstamos' });
    await expect(link).toBeVisible();
  });
});
