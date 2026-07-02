import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { categoriesApi, Category } from "../../services/api";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<Category | null>(null);

  const load = () => { setLoading(true); categoriesApi.getAll().then(setCategories).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ name: "", description: "" }); setFormError(""); setModal({ open: true, editing: null }); };
  const openEdit = (c: Category) => { setForm({ name: c.name, description: c.description || "" }); setFormError(""); setModal({ open: true, editing: c }); };

  const handleSave = async () => {
    if (!form.name) { setFormError("El nombre es requerido"); return; }
    setSaving(true); setFormError("");
    try {
      if (modal.editing) await categoriesApi.update(modal.editing.id, form);
      else await categoriesApi.create(form);
      setModal({ open: false, editing: null }); load();
    } catch (e: any) { setFormError(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async () => { if (!deleting) return; try { await categoriesApi.remove(deleting.id); setDeleting(null); load(); } catch {} };

  return (
    <>
      <PageMeta title="Categorías | Horizonte Plus" description="" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Categorías</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{categories.length} categorías</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">+ Nueva categoría</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="font-semibold text-gray-800 dark:text-white/90">{cat.name}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{cat.description || "Sin descripción"}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(cat)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10">Editar</button>
                <button onClick={() => setDeleting(cat)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10">Eliminar</button>
              </div>
            </div>
          ))}
          <button onClick={openCreate} className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-brand-300 hover:text-brand-500 dark:border-gray-700 dark:hover:border-brand-500">
            <span className="text-2xl">+</span>
            <span className="mt-1 text-sm font-medium">Agregar</span>
          </button>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-white/90">{modal.editing ? "Editar categoría" : "Nueva categoría"}</h3>
              <button onClick={() => setModal({ open: false, editing: null })} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Nombre</label>
                <input className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Descripción</label>
                <textarea rows={3} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              {formError && <p className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setModal({ open: false, editing: null })} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">{saving ? "Guardando..." : "Guardar"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="mb-2 font-semibold text-gray-800 dark:text-white/90">Eliminar categoría</h3>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">¿Eliminar <strong>{deleting.name}</strong>?</p>
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
