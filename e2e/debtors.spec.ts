import { test, expect } from '@playwright/test';

test.describe('Módulo de Portal de Deudores y Estado de Cuenta (Spec 006)', () => {
  test('debe redirigir a /login cuando un usuario sin sesión intenta acceder a /deudores', async ({
    page,
  }) => {
    await page.goto('/deudores');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdeudores/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Control Financiero 360°');
  });

  test('el Navbar muestra el enlace a Deudores', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Deudores' });
    await expect(link).toBeVisible();
  });

  test('la ruta pública /estado-cuenta/[id] no fuerza redirección a /login', async ({
    page,
  }) => {
    await page.goto('/estado-cuenta/00000000-0000-0000-0000-000000000000');
    // No debe redirigir a login
    await expect(page).not.toHaveURL(/\/login/);
    // Debe renderizar la UI de estado de cuenta (o no disponible)
    await expect(page.getByText(/estado de cuenta/i)).toBeVisible();
  });
});
