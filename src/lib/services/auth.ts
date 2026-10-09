import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePassword(
  password: string,
  confirmPassword?: string
): PasswordValidationResult {
  if (!password || password.trim().length === 0) {
    return { valid: false, error: 'La contraseña no puede estar vacía.' };
  }

  if (password.length < 6) {
    return {
      valid: false,
      error: 'La contraseña debe tener al menos 6 caracteres.',
    };
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { valid: false, error: 'Las contraseñas no coinciden.' };
  }

  return { valid: true };
}

export async function requestPasswordReset(
  supabase: SupabaseClient<Database>,
  email: string,
  redirectTo?: string
): Promise<{ success: boolean; error?: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    return { success: false, error: 'El correo electrónico es requerido.' };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al solicitar recuperación.';
    return { success: false, error: message };
  }
}

export async function updateUserPassword(
  supabase: SupabaseClient<Database>,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const validation = validatePassword(password);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al actualizar contraseña.';
    return { success: false, error: message };
  }
}
