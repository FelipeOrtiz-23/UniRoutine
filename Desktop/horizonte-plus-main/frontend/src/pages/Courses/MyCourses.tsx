import { useEffect, useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { enrollmentsApi, Enrollment } from "../../services/api";

const STATUS_LABEL: Record<string, string> = {
  active: "En progreso",
  completed: "Completado",
  cancelled: "Cancelado",
};
const STATUS_COLOR: Record<string, string> = {
  active: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400",
  completed: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400",
  cancelled: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400",
};

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    enrollmentsApi
      .my()
      .then(setEnrollments)
      .finally(() => setLoading(false));
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? enrollments.filter((e) =>
        (e.course?.title || "").toLowerCase().includes(q),
      )
    : enrollments;

  return (
    <>
      <PageMeta
        title="Mis cursos | Horizonte Plus"
        description="Cursos en los que estás inscrito"
      />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Mis cursos
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {q ? `${filtered.length} de ${enrollments.length}` : `${enrollments.length}`} inscripciones
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="9" r="6" />
                <path d="m14 14 3 3" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en mis cursos..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500 sm:w-72"
            />
          </div>
          <Link
            to="/cursos"
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Explorar catálogo
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white py-20 dark:border-gray-800 dark:bg-white/[0.03]">
          <span className="mb-3 text-5xl">📖</span>
          <p className="text-gray-500 dark:text-gray-400">
            Aún no estás inscrito en ningún curso.
          </p>
          <Link
            to="/cursos"
            className="mt-4 text-sm font-medium text-brand-500 hover:underline"
          >
            Explorar catálogo →
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white py-20 dark:border-gray-800 dark:bg-white/[0.03]">
          <span className="mb-3 text-5xl">🔍</span>
          <p className="text-gray-500 dark:text-gray-400">
            No hay cursos que coincidan con "{search}".
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-4 text-sm font-medium text-brand-500 hover:underline"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => (
            <Link
              key={e.id}
              to={`/curso/${e.courseId}/aprender`}
              className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]"
            >
              {(() => {
                const cover = e.course?.coverUrl;
                const firstVid = e.course?.lessons?.sort((a, b) => a.order - b.order).find((l) => l.videoUrl);
                const ytM = firstVid?.videoUrl?.match(/(?:youtu\.be\/|v=|\/embed\/)([\w-]{11})/);
                const thumb = cover || (ytM ? `https://img.youtube.com/vi/${ytM[1]}/hqdefault.jpg` : null);
                return (
                  <img
                    src={thumb || "/images/placeholder-course.svg"}
                    alt={e.course?.title}
                    className="mb-4 h-28 w-full rounded-xl object-cover bg-gray-200 dark:bg-gray-700"
                    onError={(ev) => { (ev.target as HTMLImageElement).src = "/images/placeholder-course.svg"; }}
                  />
                );
              })()}

              <span
                className={`mb-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  STATUS_COLOR[e.status]
                }`}
              >
                {STATUS_LABEL[e.status]}
              </span>

              <h3 className="mb-2 font-semibold text-gray-800 group-hover:text-brand-500 dark:text-white/90">
                {e.course?.title || "Curso"}
              </h3>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Progreso</span>
                  <span>{Math.round(e.progress)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    className="h-2 rounded-full bg-brand-500 transition-all"
                    style={{ width: `${e.progress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
