import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { usersApi, User } from "../../services/api";
import { useViewMode } from "../../context/ViewModeContext";

import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  teacher: "Docente",
  student: "Estudiante",
};
const ROLE_COLOR: Record<string, "primary" | "success" | "warning" | "error"> = {
  admin: "primary",
  teacher: "warning",
  student: "success",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [error, setError] = useState("");

  // Modal state
  const [modal, setModal] = useState<{ open: boolean; editing: User | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", role: "student" as string, isActive: true });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete state
  const [deleting, setDeleting] = useState<User | null>(null);

  // Actions menu
  const [actionsOpen, setActionsOpen] = useState<string | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const { impersonate } = useViewMode();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setActionsOpen(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const load = () => {
    setLoading(true);
    usersApi.getAll().then(setUsers).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q);
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const openCreate = () => {
    setForm({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", role: "student", isActive: true });
    setFormError("");
    setModal({ open: true, editing: null });
  };

  const openEdit = (u: User) => {
    setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, password: "", confirmPassword: "", role: u.role, isActive: u.isActive });
    setFormError("");
    setModal({ open: true, editing: u });
  };

  const handleSave = async () => {
    setFormError("");
    if (!form.firstName || !form.lastName) { setFormError("Nombre y apellido son requeridos"); return; }
    if (!modal.editing && (!form.email || !form.password)) { setFormError("Correo y contraseña son requeridos"); return; }
    if (!modal.editing && form.password !== form.confirmPassword) { setFormError("Las contraseñas no coinciden"); return; }
    if (!modal.editing && form.password.length < 8) { setFormError("La contraseña debe tener al menos 8 caracteres"); return; }

    setSaving(true);
    try {
      if (modal.editing) {
        await usersApi.update(modal.editing.id, { firstName: form.firstName, lastName: form.lastName, role: form.role, isActive: form.isActive });
      } else {
        await usersApi.create({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, role: form.role });
      }
      setModal({ open: false, editing: null });
      load();
    } catch (e: any) {
      setFormError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await usersApi.remove(deleting.id);
      setDeleting(null);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <>
      <PageMeta title="Usuarios | Horizonte Plus" description="Gestión de usuarios" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Usuarios</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{users.length} usuarios registrados</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
          + Nuevo usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          className="h-11 w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder-gray-500"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="teacher">Docente</option>
          <option value="student">Estudiante</option>
        </select>
        <span className="ml-auto text-sm text-gray-400 dark:text-gray-500">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {error && <p className="mb-4 rounded-lg bg-error-50 px-4 py-2 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">{error}</p>}

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400 dark:text-gray-500">
            <span className="mb-3 text-4xl">👥</span>
            <p>No se encontraron usuarios.</p>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Usuario</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Rol</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estado</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Registro</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{u.firstName} {u.lastName}</p>
                          <span className="text-gray-500 text-theme-xs dark:text-gray-400">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge size="sm" color={ROLE_COLOR[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge size="sm" color={u.isActive ? "success" : "error"}>
                        {u.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell className="py-3 text-end">
                      <div className="relative inline-block" ref={actionsOpen === u.id ? actionsRef : undefined}>
                        <button
                          onClick={() => setActionsOpen(actionsOpen === u.id ? null : u.id)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                          <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {actionsOpen === u.id && (
                          <div className="absolute right-0 top-full z-[99999] mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
                            <button
                              onClick={() => { setActionsOpen(null); openEdit(u); }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                            >
                              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              Editar
                            </button>
                            {u.role === "student" && (
                              <>
                                <button
                                  onClick={() => { setActionsOpen(null); navigate(`/usuarios/${u.id}`); }}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                                >
                                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                  Ver avances y notas
                                </button>
                                <button
                                  onClick={async () => { setActionsOpen(null); await impersonate(u.id); navigate("/mis-cursos"); }}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                                >
                                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                  Ver como este usuario
                                </button>
                              </>
                            )}
                            <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                            <button
                              onClick={() => { setActionsOpen(null); setDeleting(u); }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
                            >
                              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {modal.open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-white/90">
                {modal.editing ? "Editar usuario" : "Nuevo usuario"}
              </h3>
              <button onClick={() => setModal({ open: false, editing: null })} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Nombre</label>
                  <input className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Apellido</label>
                  <input className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              {!modal.editing && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Correo electrónico</label>
                    <input type="email" className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Contraseña</label>
                    <input type="password" className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Repetir contraseña</label>
                    <input type="password" className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                  </div>
                </>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Rol</label>
                <select className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="student">Estudiante</option>
                  <option value="teacher">Docente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {modal.editing && (
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-500" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Usuario activo</span>
                </label>
              )}
              {formError && <p className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setModal({ open: false, editing: null })} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">
                  {saving ? "Guardando..." : modal.editing ? "Guardar" : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {deleting && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="mb-2 font-semibold text-gray-800 dark:text-white/90">Eliminar usuario</h3>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              ¿Eliminar a <strong>{deleting.firstName} {deleting.lastName}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleting(null)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">Cancelar</button>
              <button onClick={handleDelete} className="rounded-lg bg-error-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-error-600">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
