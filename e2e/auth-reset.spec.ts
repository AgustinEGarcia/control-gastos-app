import { test, expect } from '@playwright/test';

test.describe('Flujo de Recuperación y Restablecimiento de Contraseña (Spec 011)', () => {
  test('debe mostrar el botón de recuperación en login y permitir alternar al formulario', async ({ page }) => {
    await page.goto('/login');

    // Comprobar presencia del botón
    const forgotBtn = page.getByRole('button', { name: /¿Olvidaste tu contraseña\?/i });
    await expect(forgotBtn).toBeVisible();

    // Alternar a modo recuperación
    await forgotBtn.click();
    await expect(page.getByText('Recupera el acceso a tu cuenta')).toBeVisible();
    await expect(page.getByRole('button', { name: /Enviar enlace de recuperación/i })).toBeVisible();

    // No debe mostrarse el campo de contraseña en este modo
    await expect(page.getByLabel('Contraseña')).not.toBeVisible();

    // Volver a modo login
    const backBtn = page.getByRole('button', { name: /¿Recordaste tu contraseña\? Iniciar sesión aquí/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page.getByText('Inicia sesión para acceder a tu panel de control')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
  });

  test('debe cargar la página de actualización de contraseña y validar coincidencia de claves', async ({ page }) => {
    await page.goto('/actualizar-contrasena');

    await expect(page.getByRole('heading', { name: /Restablecer Contraseña/i })).toBeVisible();
    await expect(page.getByLabel('Nueva Contraseña')).toBeVisible();
    await expect(page.getByLabel('Confirmar Contraseña')).toBeVisible();

    // Completar con claves no coincidentes
    await page.getByLabel('Nueva Contraseña').fill('claveValida123');
    await page.getByLabel('Confirmar Contraseña').fill('claveDiferente456');
    await page.getByRole('button', { name: /Guardar nueva contraseña/i }).click();

    // Debe mostrar mensaje de error
    await expect(page.getByText('Las contraseñas no coinciden.')).toBeVisible();
  });
});
