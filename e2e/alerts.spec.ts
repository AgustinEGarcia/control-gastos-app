import { test, expect } from '@playwright/test';

test.describe('Módulo de Alertas Preventivas por Email (Spec 007)', () => {
  test('debe redirigir a /login cuando un usuario sin sesión intenta acceder a /alertas', async ({
    page,
  }) => {
    await page.goto('/alertas');
    await expect(page).toHaveURL(/\/login\?redirect=%2Falertas/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Control Financiero 360°');
  });

  test('el Navbar muestra el enlace a Alertas', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Alertas' });
    await expect(link).toBeVisible();
  });

  test('el endpoint /api/alerts/check-due-dates rechaza peticiones sin autorizar con 401', async ({
    request,
  }) => {
    const res = await request.post('/api/alerts/check-due-dates');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('No autorizado');
  });
});
