'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  type Person,
  getPeople,
  createPerson,
  updatePerson,
  deletePerson,
} from '@/lib/services/transactions';

export default function PersonasPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados modal de creación
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [creating, setCreating] = useState(false);

  // Estados modal de edición
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updating, setUpdating] = useState(false);

  // Estado de eliminación
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getPeople(supabase);
      setPeople(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar personas.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado.');

      await createPerson(supabase, newName.trim(), newEmail.trim() || null, user.id);
      setIsCreateOpen(false);
      setNewName('');
      setNewEmail('');
      setSuccessMsg('Persona registrada exitosamente.');
      await loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al registrar persona.');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (person: Person) => {
    setEditingPerson(person);
    setEditName(person.name);
    setEditEmail(person.email || '');
    setErrorMsg(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerson || !editName.trim()) return;

    setUpdating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await updatePerson(supabase, editingPerson.id, {
        name: editName.trim(),
        email: editEmail.trim() || null,
      });
      setEditingPerson(null);
      setSuccessMsg('Datos actualizados exitosamente.');
      await loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al actualizar persona.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (person: Person) => {
    if (!confirm(`¿Eliminar a "${person.name}"? Esta acción solo se completará si no tiene registros de deudas o compras asociadas.`)) {
      return;
    }

    setDeletingId(person.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await deletePerson(supabase, person.id);
      setSuccessMsg(`"${person.name}" fue eliminado correctamente.`);
      setPeople((prev) => prev.filter((p) => p.id !== person.id));
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al eliminar persona.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header y Acción */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-mono text-sm">/</span>
              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Personas y Terceros
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Directorio de personas y contactos vinculados a compras compartidas y préstamos.
            </p>
          </div>

          <button
            onClick={() => {
              setErrorMsg(null);
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition-colors shadow-sm"
          >
            <span>+</span>
            <span>Nueva Persona</span>
          </button>
        </div>

        {/* Alertas informativas */}
        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-zinc-400 hover:text-white ml-4">
              ✕
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-zinc-400 hover:text-white ml-4">
              ✕
            </button>
          </div>
        )}

        {/* Contador o Resumen */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            Listado de Personas ({people.length})
          </span>
        </div>

        {/* Lista de Personas o Estado Vacío */}
        {loading ? (
          <div className="space-y-2.5 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-zinc-950 border border-zinc-800/80" />
            ))}
          </div>
        ) : people.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-xl border border-zinc-800/80 bg-zinc-950">
            <h3 className="text-sm font-medium text-white mb-1">
              No tienes personas registradas
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mb-5 font-mono">
              Agrega contactos para asignarles compras compartidas con tarjeta o préstamos personales.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition-colors shadow-sm"
            >
              + Registrar primera persona
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 overflow-hidden">
            <div className="divide-y divide-zinc-800/80">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="p-3.5 sm:px-5 flex items-center justify-between gap-4 hover:bg-zinc-900/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-300 shrink-0">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-medium text-white truncate">
                        {person.name}
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">
                        {person.email ? person.email : 'Sin correo registrado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(person)}
                      title="Editar datos"
                      className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors text-xs font-mono"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(person)}
                      disabled={deletingId === person.id}
                      title="Eliminar persona"
                      className="p-1.5 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition-colors text-xs font-mono"
                    >
                      {deletingId === person.id ? '...' : '✕'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Alta de Persona */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-xl bg-zinc-950 border border-zinc-800/80 p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 mb-4">
                <h2 className="text-sm font-semibold text-white">Registrar Nueva Persona</h2>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors text-xs p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="p-name">
                    Nombre Completo *
                  </label>
                  <input
                    id="p-name"
                    type="text"
                    required
                    placeholder="Ej: Juan Pérez"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="p-email">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    id="p-email"
                    type="email"
                    placeholder="juan@ejemplo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">
                    Permite compartir estados de cuenta o recordatorios.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-zinc-800/80 mt-5">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {creating ? 'Guardando...' : 'Crear Persona'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Edición de Persona */}
        {editingPerson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-xl bg-zinc-950 border border-zinc-800/80 p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 mb-4">
                <h2 className="text-sm font-semibold text-white">Editar Persona</h2>
                <button
                  onClick={() => setEditingPerson(null)}
                  className="text-zinc-400 hover:text-white transition-colors text-xs p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="edit-p-name">
                    Nombre Completo *
                  </label>
                  <input
                    id="edit-p-name"
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1" htmlFor="edit-p-email">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    id="edit-p-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-zinc-800/80 mt-5">
                  <button
                    type="button"
                    onClick={() => setEditingPerson(null)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {updating ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
