import { test, expect } from '@playwright/test';

test.describe('Página Principal y Navegación', () => {
  test('debe cargar la página de inicio con el título del producto', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Control Financiero 360°/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Control total de tus');
  });

  test('debe permitir navegar a la pantalla de login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Iniciar Sesión' }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Control Financiero 360°')).toBeVisible();
    await expect(page.getByLabel('Correo Electrónico')).toBeVisible();
  });
});
