import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { enrollmentsApi, coursesApi, usersApi, Enrollment, Course, User, PaginatedEnrollments } from "../../services/api";
import Badge from "../../components/ui/badge/Badge";
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "../../components/ui/table";

const STATUS_LABEL: Record<string, string> = {
  active: "En curso",
  completed: "Completado",
  cancelled: "Cancelado",
};
const STATUS_COLOR: Record<string, string> = {
  active: "warning",
  completed: "success",
  cancelled: "error",
};

const PAGE_SIZE = 20;

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Course combobox
  const [courseQuery, setCourseQuery] = useState("");
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);

  // Debounce timer for search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEnrollments = useCallback(
    async (p: number, s: string, courseId: string, status: string) => {
      setLoading(true);
      try {
        const result: PaginatedEnrollments = await enrollmentsApi.getAll({
          page: p,
          limit: PAGE_SIZE,
          courseId: courseId || undefined,
          status: status || undefined,
          search: s || undefined,
        });
        setEnrollments(result.data);
        setTotal(result.total);
        setPage(result.page);
        setTotalPages(result.totalPages);
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Load courses for the filter dropdown (once)
  useEffect(() => {
    coursesApi.getAll(true).then(setCourses).catch(() => {});
  }, []);

  // Close course dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setCourseDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredCourses = courses.filter(
    (c) => !courseQuery || c.title.toLowerCase().includes(courseQuery.toLowerCase()),
  );

  const selectedCourseName = courses.find((c) => c.id === filterCourse)?.title || "";

  // Fetch enrollments on filter/page change
  useEffect(() => {
    fetchEnrollments(page, search, filterCourse, filterStatus);
  }, [page, filterCourse, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search — waits 400ms after the user stops typing
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchEnrollments(1, value, filterCourse, filterStatus);
    }, 400);
  };

  const handleFilterCourse = (value: string) => {
    setFilterCourse(value);
    setPage(1);
  };

  const handleFilterStatus = (value: string) => {
    setFilterStatus(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterCourse("");
    setFilterStatus("");
    setPage(1);
    fetchEnrollments(1, "", "", "");
  };

  const hasFilters = search || filterCourse || filterStatus;

  // ── Manual enrollment modal ──
  const [enrollModal, setEnrollModal] = useState(false);
  const [enrollSaving, setEnrollSaving] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  // User picker
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const userComboRef = useRef<HTMLDivElement>(null);
  // Course picker
  const [enrollCourseQuery, setEnrollCourseQuery] = useState("");
  const [enrollCourseDropdownOpen, setEnrollCourseDropdownOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const enrollCourseComboRef = useRef<HTMLDivElement>(null);

  // Load users once when modal opens
  useEffect(() => {
    if (enrollModal && allUsers.length === 0) {
      usersApi.getAll().then(setAllUsers).catch(() => {});
    }
  }, [enrollModal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Click outside for modal comboboxes
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userComboRef.current && !userComboRef.current.contains(e.target as Node)) setUserDropdownOpen(false);
      if (enrollCourseComboRef.current && !enrollCourseComboRef.current.contains(e.target as Node)) setEnrollCourseDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredUsers = allUsers.filter((u) => {
    if (!userQuery) return true;
    const q = userQuery.toLowerCase();
    return u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  }).slice(0, 30);

  const filteredEnrollCourses = courses.filter((c) => {
    if (!enrollCourseQuery) return true;
    return c.title.toLowerCase().includes(enrollCourseQuery.toLowerCase());
  }).slice(0, 30);

  const openEnrollModal = () => {
    setSelectedUser(null);
    setSelectedCourse(null);
    setUserQuery("");
    setEnrollCourseQuery("");
    setEnrollError("");
    setEnrollModal(true);
  };

  const handleAdminEnroll = async () => {
    if (!selectedUser || !selectedCourse) {
      setEnrollError("Selecciona un usuario y un curso");
      return;
    }
    setEnrollSaving(true);
    setEnrollError("");
    try {
      await enrollmentsApi.adminEnroll(selectedUser.id, selectedCourse.id);
      setEnrollModal(false);
      fetchEnrollments(1, search, filterCourse, filterStatus);
      setPage(1);
    } catch (e: any) {
      setEnrollError(e.message || "Error al inscribir");
    } finally {
      setEnrollSaving(false);
    }
  };

  // Pagination helpers
  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <PageMeta title="Inscripciones | Horizonte Plus" description="Gestión de inscripciones de estudiantes" />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Inscripciones</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Vista global de inscripciones y progreso de estudiantes
          </p>
        </div>
        <button
          onClick={openEnrollModal}
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          + Inscribir usuario
        </button>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total inscripciones</p>
          <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{total}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400">Página</p>
          <p className="mt-1 text-2xl font-bold text-brand-500">{page} / {totalPages || 1}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400">Resultados por página</p>
          <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{PAGE_SIZE}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="h-11 w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder-gray-500"
          placeholder="Buscar estudiante..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {/* Course combobox */}
        <div className="relative" ref={comboRef}>
          <div className="relative">
            <input
              className="h-11 w-64 rounded-lg border border-gray-300 bg-white px-4 pr-9 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder-gray-500"
              placeholder="Filtrar por curso..."
              value={courseDropdownOpen ? courseQuery : selectedCourseName || courseQuery}
              onChange={(e) => {
                setCourseQuery(e.target.value);
                setCourseDropdownOpen(true);
                if (!e.target.value && filterCourse) {
                  handleFilterCourse("");
                }
              }}
              onFocus={() => {
                setCourseDropdownOpen(true);
                setCourseQuery("");
              }}
            />
            {filterCourse && (
              <button
                onClick={() => {
                  handleFilterCourse("");
                  setCourseQuery("");
                  setCourseDropdownOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {courseDropdownOpen && (
            <div className="absolute left-0 top-full z-[9999] mt-1 max-h-60 w-72 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <button
                onClick={() => {
                  handleFilterCourse("");
                  setCourseQuery("");
                  setCourseDropdownOpen(false);
                }}
                className={`flex w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5 ${
                  !filterCourse ? "text-brand-500 font-medium" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                Todos los cursos
              </button>
              {filteredCourses.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">No se encontraron cursos</p>
              ) : (
                filteredCourses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      handleFilterCourse(c.id);
                      setCourseQuery("");
                      setCourseDropdownOpen(false);
                    }}
                    className={`flex w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5 ${
                      filterCourse === c.id ? "text-brand-500 font-medium" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {c.title}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <select
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          value={filterStatus}
          onChange={(e) => handleFilterStatus(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="active">En curso</option>
          <option value="completed">Completado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Mostrando {total > 0 ? `${startItem}–${endItem}` : "0"} de {total} inscripciones
      </p>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <span className="mb-3 text-4xl">📋</span>
            <p className="text-gray-400 dark:text-gray-500">
              {hasFilters ? "No se encontraron resultados con los filtros aplicados." : "No hay inscripciones registradas."}
            </p>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 w-12">#</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estudiante</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Curso</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Progreso</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estado</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Inscripción</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {enrollments.map((e, idx) => {
                  const p = Math.round(Number(e.progress));
                  const barColor =
                    p >= 100 ? "bg-success-500" :
                    p >= 60 ? "bg-brand-500" :
                    p >= 30 ? "bg-warning-500" :
                    "bg-gray-400";
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="py-3 text-center text-gray-400 text-theme-sm">{startItem + idx}</TableCell>
                      <TableCell className="py-3">
                        <Link
                          to={`/usuarios/${e.userId}`}
                          className="group flex items-center gap-3"
                        >
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                            {(e.user?.firstName?.[0] ?? "")}{(e.user?.lastName?.[0] ?? "")}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 group-hover:text-brand-500 transition-colors">
                              {e.user?.firstName} {e.user?.lastName}
                            </p>
                            <span className="text-gray-500 text-theme-xs dark:text-gray-400">{e.user?.email}</span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="py-3">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{e.course?.title || "Curso"}</p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">{e.course?.category?.name || ""}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3 w-40">
                          <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className={`h-2 rounded-full ${barColor} transition-all`}
                              style={{ width: `${Math.min(p, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-10 text-right">{p}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge size="sm" color={STATUS_COLOR[e.status] as any}>
                          {STATUS_LABEL[e.status] || e.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(e.enrolledAt).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              ««
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              ‹ Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Siguiente ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              »»
            </button>
          </div>
        </div>
      )}

      {/* ── Modal inscripción manual ── */}
      {enrollModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-white/90">Inscribir usuario manualmente</h3>
              <button onClick={() => setEnrollModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>
            <div className="space-y-5 p-6">
              {/* User picker */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Usuario</label>
                <div className="relative" ref={userComboRef}>
                  <input
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 pr-9 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder-gray-500"
                    placeholder="Buscar usuario por nombre o email..."
                    value={userDropdownOpen ? userQuery : selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : userQuery}
                    onChange={(e) => { setUserQuery(e.target.value); setUserDropdownOpen(true); }}
                    onFocus={() => { setUserDropdownOpen(true); setUserQuery(""); }}
                  />
                  {selectedUser && (
                    <button
                      onClick={() => { setSelectedUser(null); setUserQuery(""); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                  {userDropdownOpen && (
                    <div className="absolute left-0 top-full z-[99999] mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                      {filteredUsers.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">No se encontraron usuarios</p>
                      ) : (
                        filteredUsers.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => { setSelectedUser(u); setUserQuery(""); setUserDropdownOpen(false); }}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5 ${
                              selectedUser?.id === u.id ? "bg-brand-50 dark:bg-brand-500/10" : ""
                            }`}
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                              {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white/90">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Course picker */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">Curso</label>
                <div className="relative" ref={enrollCourseComboRef}>
                  <input
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 pr-9 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder-gray-500"
                    placeholder="Buscar curso..."
                    value={enrollCourseDropdownOpen ? enrollCourseQuery : selectedCourse?.title || enrollCourseQuery}
                    onChange={(e) => { setEnrollCourseQuery(e.target.value); setEnrollCourseDropdownOpen(true); }}
                    onFocus={() => { setEnrollCourseDropdownOpen(true); setEnrollCourseQuery(""); }}
                  />
                  {selectedCourse && (
                    <button
                      onClick={() => { setSelectedCourse(null); setEnrollCourseQuery(""); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                  {enrollCourseDropdownOpen && (
                    <div className="absolute left-0 top-full z-[99999] mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                      {filteredEnrollCourses.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">No se encontraron cursos</p>
                      ) : (
                        filteredEnrollCourses.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => { setSelectedCourse(c); setEnrollCourseQuery(""); setEnrollCourseDropdownOpen(false); }}
                            className={`flex w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5 ${
                              selectedCourse?.id === c.id ? "bg-brand-50 dark:bg-brand-500/10" : ""
                            }`}
                          >
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white/90">{c.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{c.category?.name || "Sin categoría"}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected summary */}
              {selectedUser && selectedCourse && (
                <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Inscribir a <strong className="text-gray-900 dark:text-white">{selectedUser.firstName} {selectedUser.lastName}</strong> en <strong className="text-gray-900 dark:text-white">{selectedCourse.title}</strong>
                  </p>
                </div>
              )}

              {enrollError && (
                <p className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">{enrollError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEnrollModal(false)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">Cancelar</button>
                <button
                  onClick={handleAdminEnroll}
                  disabled={enrollSaving || !selectedUser || !selectedCourse}
                  className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
                >
                  {enrollSaving ? "Inscribiendo..." : "Inscribir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
