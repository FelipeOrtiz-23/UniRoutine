import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { coursesApi, categoriesApi, Course, Category } from "../../services/api";

const LEVEL_LABEL: Record<string, string> = { beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado" };
// Pills de nivel con la paleta corporativa (mismo estilo que los pills del login)
const LEVEL_PILL: Record<string, string> = {
  beginner: "bg-hz-cyan text-white",
  intermediate: "bg-hz-amber text-hz-blue-dark",
  advanced: "bg-hz-salmon text-white",
};

const PAGE_SIZE = 12;

function getYtId(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function ytThumb(ytId: string): string {
  return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
}

// ── Course Card with hover video ────────────────────
function CourseCard({ course, ytId }: { course: Course; ytId: string | null }) {
  const [hovered, setHovered] = useState(false);
  const coverImg = course.coverUrl || (ytId ? ytThumb(ytId) : null);

  return (
    <Link
      to={`/curso/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover / Video */}
      <div className="relative h-[200px] w-full overflow-hidden bg-gray-800">
        {ytId && hovered ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&modestbranding=1&rel=0&showinfo=0`}
            className="h-full w-full"
            allow="autoplay; encrypted-media"
            style={{ pointerEvents: "none" }}
          />
        ) : coverImg ? (
          <>
            <img
              src={coverImg}
              alt={course.title}
              className="h-full w-full object-cover"
              onError={(ev) => { (ev.target as HTMLImageElement).src = "/images/placeholder-course.svg"; }}
            />
            {ytId && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity group-hover:opacity-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <svg className="ml-1 size-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-hz-blue to-hz-blue-dark">
            <img
              src="/images/logo/logo-dark.svg"
              alt="Horizonte Plus"
              className="w-1/2 max-w-[170px] opacity-90"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <span className={`mb-2 inline-flex w-fit items-center rounded-lg px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${LEVEL_PILL[course.level]}`}>
          {LEVEL_LABEL[course.level]}
        </span>
        <h3 className="mb-1.5 line-clamp-2 text-sm font-bold text-gray-900 dark:text-white">
          {course.title}
        </h3>
        <p className="mb-4 line-clamp-3 flex-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {course.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <div className="flex items-center gap-1" title="Valoración">
            <svg className="size-3.5 text-hz-amber" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <span>4.5</span>
          </div>
          <div className="flex items-center gap-1" title="Estudiantes">
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span>128</span>
          </div>
          <div className="flex items-center gap-1" title="Lecciones">
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <span>{course.lessons?.length ?? 0}</span>
          </div>
          <div className="flex items-center gap-1" title="Duración">
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{course.duration ? `${course.duration}h` : "—"}</span>
          </div>
        </div>
      </div>

      {/* Price button */}
      <div className="p-4 pt-0">
        <div className="flex w-full items-center justify-center rounded-lg bg-hz-blue py-3 text-sm font-semibold text-white transition-colors group-hover:bg-hz-blue-dark">
          {course.isFree ? "Inscribirse gratis" : `Comprar $${Number(course.price).toLocaleString("es-CO")}`}
        </div>
      </div>
    </Link>
  );
}

// ── Catalog Page ────────────────────────────────────
export default function Catalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { categoriesApi.getAll().then(setCategories); }, []);

  const fetchCourses = useCallback(async (p: number, s: string, catId: string) => {
    setLoading(true);
    try {
      const result = await coursesApi.getCatalog({
        page: p, limit: PAGE_SIZE,
        search: s || undefined,
        categoryId: catId || undefined,
      });
      setCourses(result.data);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchCourses(page, search, filterCat);
  }, [page, filterCat]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchCourses(1, value, filterCat);
    }, 400);
  };

  const hasFilters = search || filterCat;

  return (
    <>
      <PageMeta title="Catálogo de cursos | Horizonte Plus" description="" />
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Catálogo de cursos</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{total} cursos disponibles</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          className="h-11 w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-hz-blue dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder-gray-500"
          placeholder="Buscar curso..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <select
          className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none focus:border-hz-blue dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          value={filterCat}
          onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilterCat(""); setPage(1); fetchCourses(1, "", ""); }}
            className="text-sm text-gray-500 hover:text-hz-blue dark:text-gray-400"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-hz-blue border-t-transparent" />
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-400 dark:text-gray-500">
          <span className="mb-3 text-4xl">📚</span>
          <p>No se encontraron cursos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => {
            const firstLesson = course.lessons?.sort((a, b) => a.order - b.order)[0];
            const ytId = getYtId(firstLesson?.videoUrl);
            return <CourseCard key={course.id} course={course} ytId={ytId} />;
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button onClick={() => setPage(1)} disabled={page <= 1} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">««</button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">‹</button>
          <span className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            Página {page} de {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">›</button>
          <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">»»</button>
        </div>
      )}
    </>
  );
}
