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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Header y Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            👥 Personas y Terceros
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Administra los contactos a quienes prestas tarjetas o realizas préstamos de dinero.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <span className="text-base leading-none">+</span>
          <span>Nueva Persona</span>
        </button>
      </div>

      {/* Alertas informativas */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-zinc-500 hover:text-zinc-300 ml-4">
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-between">
          <span>✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-zinc-500 hover:text-zinc-300 ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Contador o Resumen */}
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Listado de Personas ({people.length})
        </span>
      </div>

      {/* Lista de Personas o Estado Vacío */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-900/80 border border-zinc-800" />
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-2xl flex items-center justify-center mx-auto mb-4">
            👥
          </div>
          <h3 className="text-lg font-semibold text-white">
            No tienes personas registradas
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mt-1 mb-6">
            Agrega contactos para asignarles compras compartidas con tarjeta o préstamos personales.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all"
          >
            + Registrar primera persona
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-sm">
          <div className="divide-y divide-zinc-800">
            {people.map((person) => (
              <div
                key={person.id}
                className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {person.name}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate">
                      {person.email ? `✉️ ${person.email}` : 'Sin correo registrado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(person)}
                    title="Editar datos"
                    className="p-2 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(person)}
                    disabled={deletingId === person.id}
                    title="Eliminar persona"
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                  >
                    {deletingId === person.id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Alta de Persona */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h2 className="text-base font-bold text-white">Registrar Nueva Persona</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="p-name">
                  Nombre Completo *
                </label>
                <input
                  id="p-name"
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="p-email">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  id="p-email"
                  type="email"
                  placeholder="juan@ejemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Permite compartir estados de cuenta o recordatorios.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h2 className="text-base font-bold text-white">Editar Persona</h2>
              <button
                onClick={() => setEditingPerson(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="edit-p-name">
                  Nombre Completo *
                </label>
                <input
                  id="edit-p-name"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1" htmlFor="edit-p-email">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  id="edit-p-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingPerson(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {updating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
