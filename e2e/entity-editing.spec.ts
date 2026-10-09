import { test, expect } from '@playwright/test';

test.describe('Edición Integral de Entidades y Eliminación Segura de Personas (Spec 014)', () => {
  test('debe redirigir a login al entrar sin sesión a /gastos-recurrentes, /prestamos, /transacciones y /metodos-pago', async ({
    page,
  }) => {
    await page.goto('/gastos-recurrentes');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fgastos-recurrentes/);

    await page.goto('/prestamos');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fprestamos/);

    await page.goto('/transacciones');
    await expect(page).toHaveURL(/\/login\?redirect=%2Ftransacciones/);

    await page.goto('/metodos-pago');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fmetodos-pago/);
  });

  test('el menú de navegación contiene enlaces a todas las secciones gestionables', async ({ page }) => {
    await page.goto('/');

    const nav = page.locator('nav');
    const links = [
      'Dashboard',
      'Compras y Cuotas',
      'Gastos Fijos',
      'Métodos de Pago',
      'Deudores',
      'Préstamos',
    ];

    for (const name of links) {
      const link = nav.getByRole('link', { name, exact: true });
      await expect(link).toBeVisible();
    }
  });
});
