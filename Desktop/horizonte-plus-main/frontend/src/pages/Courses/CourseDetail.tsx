import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import {
  coursesApi,
  lessonsApi,
  enrollmentsApi,
  paymentsApi,
  Course,
  Lesson,
} from "../../services/api";

function VideoPreview({ ytId, coverUrl, title }: { ytId: string | null; coverUrl?: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : coverUrl;

  if (!thumb && !ytId) return null;

  if (playing && ytId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-gray-200 bg-black dark:border-gray-800">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&modestbranding=1&rel=0`}
          className="h-full w-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 dark:border-gray-800"
      onClick={() => ytId && setPlaying(true)}
    >
      <img
        src={thumb || ""}
        alt={title}
        className="h-full w-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).src = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : ""; }}
      />
      {ytId && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform hover:scale-110">
            <svg className="ml-1 size-7 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    coursesApi.getOne(id).then(setCourse);
    lessonsApi.getByCourse(id).then((l) =>
      setLessons(l.sort((a, b) => a.order - b.order))
    );
  }, [id]);

  const handleEnroll = async () => {
    if (!id) return;
    const token = localStorage.getItem("hp_token");
    if (!token) {
      navigate("/signin");
      return;
    }
    setEnrolling(true);
    setError("");
    try {
      if (course && !course.isFree) {
        // Paid course → ePayco checkout
        const { sessionId, paymentId } = await paymentsApi.createSession(id);

        // Wait for ePayco script to load
        let attempts = 0;
        while (!(window as any).ePayco && attempts < 10) {
          await new Promise((r) => setTimeout(r, 200));
          attempts++;
        }
        if (!(window as any).ePayco) {
          throw new Error("ePayco no está cargado. Recarga la página.");
        }

        // Configure checkout with sessionId (same pattern as Avanzu)
        const checkout = (window as any).ePayco.checkout.configure({
          sessionId: sessionId,
          type: "onpage",
          test: true,
        });

        checkout.onClosed(() => {
          // When checkout closes, navigate to confirmation
          navigate(`/pago/confirmacion?paymentId=${paymentId}`);
        });

        checkout.open();
      } else {
        // Free course → direct enrollment
        await enrollmentsApi.enroll(id);
        navigate(`/curso/${id}/aprender`);
      }
    } catch (e: any) {
      setError(e.message || "Error al procesar");
    } finally {
      setEnrolling(false);
    }
  };

  if (!course) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const totalDuration = lessons.reduce((acc, l) => acc + (l.duration || 0), 0);
  // Las lecciones de Avanzu no traen duración individual; usar la del curso como total
  const durationLabel =
    totalDuration > 0
      ? `${totalDuration} min total`
      : course.duration
      ? `${course.duration} ${course.duration === 1 ? "hora" : "horas"} en total`
      : null;

  // YouTube embed from first video lesson
  const firstVideo = lessons.find((l) => l.videoUrl);
  const ytMatch = firstVideo?.videoUrl?.match(/(?:youtu\.be\/|v=|\/embed\/)([\w-]{11})/);
  const ytEmbed = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;

  return (
    <>
      <PageMeta
        title={`${course.title} | Horizonte Plus`}
        description={course.description || ""}
      />

      <div className="mb-4">
        <Link
          to="/cursos"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400"
        >
          ← Volver al catálogo
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 xl:col-span-2">
          {/* Video / Cover preview */}
          <VideoPreview ytId={ytMatch ? ytMatch[1] : null} coverUrl={course.coverUrl} title={course.title} />

          {/* Header */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                {LEVEL_LABEL[course.level]}
              </span>
              {course.category && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {course.category.name}
                </span>
              )}
            </div>
            <h1 className="mb-3 text-2xl font-bold text-gray-800 dark:text-white/90">
              {course.title}
            </h1>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {course.description}
            </p>
          </div>

          {/* Lecciones */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Contenido del curso
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {lessons.length} lecciones{durationLabel ? ` · ${durationLabel}` : ""}
            </p>
            <div className="space-y-1">
              {lessons.map((lesson, i) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                      {lesson.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {lesson.isFree && (
                      <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-400">
                        Vista previa
                      </span>
                    )}
                    {lesson.duration ? (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {lesson.duration} min
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1">
          <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Cover */}
            {course.coverUrl ? (
              <img
                src={course.coverUrl}
                alt={course.title}
                className="mb-5 h-40 w-full rounded-xl object-cover"
              />
            ) : ytEmbed ? (
              <div className="mb-5 h-40 w-full overflow-hidden rounded-xl bg-black">
                <iframe
                  src={`${ytEmbed}?modestbranding=1&rel=0`}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="mb-5 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-hz-blue to-hz-blue-dark">
                <img
                  src="/images/logo/logo-dark.svg"
                  alt="Horizonte Plus"
                  className="w-1/2 max-w-[160px] opacity-90"
                />
              </div>
            )}

            {/* Price */}
            <div className="mb-5 text-center">
              <span className="text-3xl font-bold text-gray-800 dark:text-white/90">
                {course.isFree
                  ? "Gratis"
                  : `$${Number(course.price).toLocaleString("es-CO")}`}
              </span>
            </div>

            {/* Enroll button */}
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {enrolling
                ? "Procesando..."
                : course.isFree
                ? "Inscribirme gratis"
                : `Comprar por $${Number(course.price).toLocaleString("es-CO")}`}
            </button>

            {error && (
              <p className="mt-3 text-center text-xs text-error-500">{error}</p>
            )}

            {/* Info */}
            <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Nivel</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {LEVEL_LABEL[course.level]}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Duración
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {course.duration ? `${course.duration} horas` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Lecciones
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {lessons.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
