import { describe, expect, it, vi } from 'vitest';
import {
  validatePassword,
  requestPasswordReset,
  updateUserPassword,
} from './auth';

describe('Servicio de Autenticación y Recuperación de Contraseña (Spec 011)', () => {
  describe('validatePassword', () => {
    it('debe rechazar contraseña vacía o con solo espacios', () => {
      const res = validatePassword('');
      expect(res.valid).toBe(false);
      expect(res.error).toBe('La contraseña no puede estar vacía.');

      const resSpaces = validatePassword('   ');
      expect(resSpaces.valid).toBe(false);
    });

    it('debe rechazar contraseña con menos de 6 caracteres', () => {
      const res = validatePassword('12345');
      expect(res.valid).toBe(false);
      expect(res.error).toBe('La contraseña debe tener al menos 6 caracteres.');
    });

    it('debe rechazar cuando confirmPassword no coincide', () => {
      const res = validatePassword('abcdef', 'abcdeg');
      expect(res.valid).toBe(false);
      expect(res.error).toBe('Las contraseñas no coinciden.');
    });

    it('debe aceptar contraseña válida con coincidencia exacta', () => {
      const res = validatePassword('miClaveSegura123', 'miClaveSegura123');
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('debe aceptar contraseña válida sin confirmPassword provisto', () => {
      const res = validatePassword('miClaveSegura123');
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });
  });

  describe('requestPasswordReset', () => {
    it('debe fallar si el email está vacío', async () => {
      const mockSupabase = {} as any;
      const res = await requestPasswordReset(mockSupabase, '   ');
      expect(res.success).toBe(false);
      expect(res.error).toBe('El correo electrónico es requerido.');
    });

    it('debe invocar resetPasswordForEmail correctamente y retornar éxito', async () => {
      const resetPasswordForEmailMock = vi.fn().mockResolvedValue({ error: null });
      const mockSupabase = {
        auth: {
          resetPasswordForEmail: resetPasswordForEmailMock,
        },
      } as any;

      const res = await requestPasswordReset(
        mockSupabase,
        'Usuario@test.com ',
        'http://localhost:3000/actualizar-contrasena'
      );

      expect(resetPasswordForEmailMock).toHaveBeenCalledWith('usuario@test.com', {
        redirectTo: 'http://localhost:3000/actualizar-contrasena',
      });
      expect(res.success).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('debe retornar error si Supabase responde con fallo', async () => {
      const resetPasswordForEmailMock = vi.fn().mockResolvedValue({
        error: { message: 'Rate limit exceeded' },
      });
      const mockSupabase = {
        auth: {
          resetPasswordForEmail: resetPasswordForEmailMock,
        },
      } as any;

      const res = await requestPasswordReset(mockSupabase, 'user@test.com');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Rate limit exceeded');
    });
  });

  describe('updateUserPassword', () => {
    it('debe rechazar contraseña corta antes de llamar a Supabase', async () => {
      const updateUserMock = vi.fn();
      const mockSupabase = {
        auth: {
          updateUser: updateUserMock,
        },
      } as any;

      const res = await updateUserPassword(mockSupabase, '12345');
      expect(res.success).toBe(false);
      expect(res.error).toBe('La contraseña debe tener al menos 6 caracteres.');
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('debe invocar updateUser con la nueva contraseña y retornar éxito', async () => {
      const updateUserMock = vi.fn().mockResolvedValue({ error: null });
      const mockSupabase = {
        auth: {
          updateUser: updateUserMock,
        },
      } as any;

      const res = await updateUserPassword(mockSupabase, 'nuevaClaveSegura');
      expect(updateUserMock).toHaveBeenCalledWith({ password: 'nuevaClaveSegura' });
      expect(res.success).toBe(true);
    });

    it('debe capturar errores devueltos por Supabase', async () => {
      const updateUserMock = vi.fn().mockResolvedValue({
        error: { message: 'Token de recuperación expirado' },
      });
      const mockSupabase = {
        auth: {
          updateUser: updateUserMock,
        },
      } as any;

      const res = await updateUserPassword(mockSupabase, 'nuevaClaveSegura');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Token de recuperación expirado');
    });
  });
});
