import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { coursesApi, categoriesApi, Course, Category } from "../../services/api";
import Badge from "../../components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";

const LEVEL_LABEL: Record<string, string> = { beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado" };
const PAGE_SIZE = 20;

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPublished, setFilterPublished] = useState("");

  // Modal / form
  const [modal, setModal] = useState<{ open: boolean; editing: Course | null }>({ open: false, editing: null });
  const [form, setForm] = useState({ title: "", description: "", level: "beginner", duration: "", price: "", isFree: false, categoryId: "", isPublished: true });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<Course | null>(null);
  const [actionsOpen, setActionsOpen] = useState<string | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setActionsOpen(null); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load categories once
  useEffect(() => { categoriesApi.getAll().then(setCategories); }, []);

  const fetchCourses = useCallback(async (p: number, s: string, catId: string, pub: string) => {
    setLoading(true);
    try {
      const result = await coursesApi.getPaginated({
        page: p, limit: PAGE_SIZE,
        search: s || undefined,
        categoryId: catId || undefined,
        isPublished: pub || undefined,
      });
      setCourses(result.data);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchCourses(page, search, filterCategory, filterPublished);
  }, [page, filterCategory, filterPublished]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchCourses(1, value, filterCategory, filterPublished);
    }, 400);
  };

  const clearFilters = () => {
    setSearch(""); setFilterCategory(""); setFilterPublished("");
    setPage(1);
    fetchCourses(1, "", "", "");
  };

  const hasFilters = search || filterCategory || filterPublished;
  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  const openCreate = () => {
    setForm({ title: "", description: "", level: "beginner", duration: "", price: "", isFree: false, categoryId: "", isPublished: true });
    setFormError("");
    setModal({ open: true, editing: null });
  };

  const openEdit = (c: Course) => {
    setForm({ title: c.title, description: c.description || "", level: c.level, duration: c.duration?.toString() || "", price: c.price?.toString() || "0", isFree: c.isFree, categoryId: c.categoryId || "", isPublished: c.isPublished });
    setFormError("");
    setModal({ open: true, editing: c });
  };

  const handleSave = async () => {
    if (!form.title) { setFormError("El título es requerido"); return; }
    setSaving(true);
    setFormError("");
    try {
      const data = { ...form, duration: form.duration ? Number(form.duration) : null, price: Number(form.price) || 0, categoryId: form.categoryId || null };
      if (modal.editing) await coursesApi.update(modal.editing.id, data);
      else await coursesApi.create(data);
      setModal({ open: false, editing: null });
      fetchCourses(page, search, filterCategory, filterPublished);
    } catch (e: any) { setFormError(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try { await coursesApi.remove(deleting.id); setDeleting(null); fetchCourses(page, search, filterCategory, filterPublished); } catch {}
  };

  return (
    <>
      <PageMeta title="Gestión de cursos | Horizonte Plus" description="" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Cursos</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{total} cursos registrados</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">+ Nuevo curso</button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <input
          className="h-11 w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder-gray-500"
          placeholder="Buscar curso..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <select
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <select
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          value={filterPublished}
          onChange={(e) => { setFilterPublished(e.target.value); setPage(1); }}
        >
          <option value="">Todos los estados</option>
          <option value="true">Publicados</option>
          <option value="false">Borradores</option>
        </select>
        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400">Limpiar filtros</button>
        )}
      </div>

      {/* Results count */}
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Mostrando {total > 0 ? `${startItem}–${endItem}` : "0"} de {total} cursos
      </p>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <span className="mb-3 text-4xl">📚</span>
            <p className="text-gray-400 dark:text-gray-500">
              {hasFilters ? "No se encontraron cursos con esos filtros." : "No hay cursos registrados."}
            </p>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 w-12">#</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Curso</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Categoría</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nivel</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Precio</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estado</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 w-20">Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {courses.map((c, idx) => (
                  <TableRow key={c.id}>
                    <TableCell className="py-3 text-center text-gray-400 text-theme-sm">{startItem + idx}</TableCell>
                    <TableCell className="py-3">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{c.title}</p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">{c.duration ? `${c.duration}h` : "—"} · {c.lessons?.length ?? 0} lecciones</span>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{c.category?.name || "—"}</TableCell>
                    <TableCell className="py-3"><Badge size="sm" color="primary">{LEVEL_LABEL[c.level]}</Badge></TableCell>
                    <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">{c.isFree ? "Gratis" : `$${Number(c.price).toLocaleString("es-CO")}`}</TableCell>
                    <TableCell className="py-3"><Badge size="sm" color={c.isPublished ? "success" : "warning"}>{c.isPublished ? "Publicado" : "Borrador"}</Badge></TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="relative inline-block" ref={actionsOpen === c.id ? actionsRef : undefined}>
                        <button
                          onClick={() => setActionsOpen(actionsOpen === c.id ? null : c.id)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                          <svg className="size-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" /></svg>
                        </button>
                        {actionsOpen === c.id && (
                          <div className="absolute right-0 top-full z-[99999] mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
                            <button onClick={() => { setActionsOpen(null); navigate(`/admin/cursos/${c.id}`); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5">
                              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                              Contenido
                            </button>
                            <button onClick={() => { setActionsOpen(null); openEdit(c); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5">
                              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              Editar info
                            </button>
                            <button onClick={() => { setActionsOpen(null); navigate(`/curso/${c.id}`); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5">
                              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              Vista previa
                            </button>
                            <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                            <button onClick={() => { setActionsOpen(null); setDeleting(c); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(1)} disabled={page <= 1} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">««</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">‹ Anterior</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">Siguiente ›</button>
            <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">»»</button>
          </div>
        </div>
      )}

      {/* Modal curso */}
      {modal.open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-white/90">{modal.editing ? "Editar curso" : "Nuevo curso"}</h3>
              <button onClick={() => setModal({ open: false, editing: null })} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Título</label>
                <input className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Descripción</label>
                <textarea rows={3} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Categoría</label>
                  <select className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">Sin categoría</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Nivel</label>
                  <select className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Duración (horas)</label>
                  <input type="number" className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Precio (COP)</label>
                  <input type="number" className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} disabled={form.isFree} />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-500" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked, price: e.target.checked ? "0" : form.price })} /><span className="text-sm text-gray-600 dark:text-gray-400">Gratuito</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-500" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /><span className="text-sm text-gray-600 dark:text-gray-400">Publicado</span></label>
              </div>
              {formError && <p className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setModal({ open: false, editing: null })} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">{saving ? "Guardando..." : modal.editing ? "Guardar" : "Crear"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="mb-2 font-semibold text-gray-800 dark:text-white/90">Eliminar curso</h3>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">¿Eliminar <strong>{deleting.title}</strong>? Se eliminarán también sus lecciones.</p>
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
