import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '../client';

describe('Supabase Browser Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('lanza un error si falta NEXT_PUBLIC_SUPABASE_URL', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_test';

    expect(() => createClient()).toThrowError(
      /Faltan las variables de entorno de Supabase/
    );
  });

  it('lanza un error si falta NEXT_PUBLIC_SUPABASE_ANON_KEY', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createClient()).toThrowError(
      /Faltan las variables de entorno de Supabase/
    );
  });

  it('inicializa el cliente correctamente cuando las variables están presentes', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://psfkmimeszjolzfwcmyb.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_7tfZqTE26dnyCL9mCkl4Qg_ZZpEKEKU';

    const client = createClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });
});
