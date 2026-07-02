import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import {
  coursesApi,
  lessonsApi,
  quizzesApi,
  enrollmentsApi,
  Course,
  Lesson,
  Quiz,
} from "../../services/api";

type PlayerItem =
  | { kind: "lesson"; id: string; lesson: Lesson; moduleTitle: string; moduleOrder: number; itemOrder: number }
  | { kind: "quiz"; id: string; quiz: Quiz; moduleTitle: string; moduleOrder: number; itemOrder: number };

const SIN_MODULO = "Contenido del curso";

// ── Carga única de la API de YouTube IFrame ──────────────
let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const w = window as any;
    if (w.YT && w.YT.Player) return resolve();
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

// Umbral de visualización para habilitar "Marcar como vista"
const WATCH_THRESHOLD = 0.9;

// ── Reproductor de YouTube con control de progreso ───────
function LessonVideo({
  videoId,
  onReachedEnd,
  onContinue,
  continueLabel,
}: {
  videoId: string;
  onReachedEnd: () => void;
  onContinue: () => void;
  continueLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const reachedRef = useRef(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    let destroyed = false;
    let interval: ReturnType<typeof setInterval> | undefined;
    reachedRef.current = false;
    setEnded(false);

    const reach = () => {
      if (reachedRef.current) return;
      reachedRef.current = true;
      onReachedEnd();
    };

    loadYouTubeApi().then(() => {
      if (destroyed || !containerRef.current) return;
      const YT = (window as any).YT;
      // Div interno creado imperativamente: YT lo reemplaza sin que React lo rastree
      const inner = document.createElement("div");
      inner.className = "h-full w-full";
      containerRef.current.appendChild(inner);
      playerRef.current = new YT.Player(inner, {
        videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onStateChange: (e: any) => {
            if (e.data === YT.PlayerState.ENDED) {
              setEnded(true);
              reach();
            }
          },
          // Si el video no se puede reproducir, no bloquear al usuario
          onError: () => reach(),
        },
      });

      // Poll del progreso para habilitar al llegar al umbral
      interval = setInterval(() => {
        const p = playerRef.current;
        if (p && typeof p.getDuration === "function" && typeof p.getCurrentTime === "function") {
          const dur = p.getDuration();
          const cur = p.getCurrentTime();
          if (dur > 0 && cur / dur >= WATCH_THRESHOLD) reach();
        }
      }, 1000);
    }).catch(() => reach());

    return () => {
      destroyed = true;
      if (interval) clearInterval(interval);
      const p = playerRef.current;
      if (p && typeof p.destroy === "function") {
        try { p.destroy(); } catch { /* noop */ }
      }
      playerRef.current = null;
      // Limpiar lo que YT haya dejado dentro del contenedor estable
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [videoId, onReachedEnd]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-gray-200 bg-black dark:border-gray-800">
      <div ref={containerRef} className="h-full w-full" />
      {ended && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/85 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-500 text-2xl text-white">
            ✓
          </div>
          <p className="text-base font-semibold text-white">Lección completada</p>
          <button
            onClick={onContinue}
            className="rounded-lg bg-hz-blue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-hz-blue-dark"
          >
            {continueLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export default function CoursePlayer() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [current, setCurrent] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());

  // Quiz attempt state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // ¿El video de la lección actual se vio lo suficiente para habilitar "Marcar como vista"?
  const [videoWatched, setVideoWatched] = useState(false);

  useEffect(() => {
    if (!id) return;
    coursesApi.getOne(id).then(setCourse);
    Promise.all([
      lessonsApi.getByCourse(id),
      quizzesApi.getByCourse(id).catch(() => [] as Quiz[]),
      lessonsApi.getProgress(id).catch(() => [] as string[]),
    ]).then(([l, q, savedProgress]) => {
      setLessons(l);
      setQuizzes(q);
      // Pre-populate completed lessons from DB
      if (savedProgress.length > 0) {
        const saved = new Set(savedProgress.map((lid) => `lesson-${lid}`));
        setCompletedIds(saved);
      }
    });
  }, [id]);

  // Items combinados, ordenados por (moduleOrder, itemOrder)
  const items: PlayerItem[] = useMemo(() => {
    const combined: PlayerItem[] = [];
    for (const l of lessons) {
      combined.push({
        kind: "lesson",
        id: `lesson-${l.id}`,
        lesson: l,
        moduleTitle: l.moduleTitle || SIN_MODULO,
        moduleOrder: l.moduleOrder ?? 9999,
        itemOrder: l.order ?? 0,
      });
    }
    for (const q of quizzes) {
      combined.push({
        kind: "quiz",
        id: `quiz-${q.id}`,
        quiz: q,
        moduleTitle: q.moduleTitle || SIN_MODULO,
        moduleOrder: q.moduleOrder ?? 9999,
        itemOrder: 9999, // quizzes al final del módulo
      });
    }
    combined.sort((a, b) => {
      if (a.moduleOrder !== b.moduleOrder) return a.moduleOrder - b.moduleOrder;
      // dentro del módulo: lecciones primero por order, luego quizzes
      if (a.kind !== b.kind) return a.kind === "lesson" ? -1 : 1;
      return a.itemOrder - b.itemOrder;
    });
    return combined;
  }, [lessons, quizzes]);

  // Agrupar para sidebar
  const groups = useMemo(() => {
    const map = new Map<string, { title: string; order: number; items: PlayerItem[] }>();
    for (const it of items) {
      const key = `${it.moduleOrder}::${it.moduleTitle}`;
      if (!map.has(key)) {
        map.set(key, { title: it.moduleTitle, order: it.moduleOrder, items: [] });
      }
      map.get(key)!.items.push(it);
    }
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [items]);

  const toggleModule = (title: string) => {
    const next = new Set(collapsedModules);
    if (next.has(title)) next.delete(title);
    else next.add(title);
    setCollapsedModules(next);
  };

  // Reset quiz state y progreso de video al cambiar de item
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setVideoWatched(false);
  }, [current]);

  const handleVideoReachedEnd = useCallback(() => setVideoWatched(true), []);

  const markComplete = useCallback(async () => {
    const it = items[current];
    if (!it || !id) return;

    const next = new Set(completedIds);
    const wasAlreadyComplete = next.has(it.id);
    next.add(it.id);
    setCompletedIds(next);

    // 1. Persistir la lección completada en BD (siempre primero)
    if (!wasAlreadyComplete && it.kind === "lesson") {
      try {
        await lessonsApi.markComplete(it.lesson.id);
      } catch (e) {
        console.error("Error al marcar lección como completada:", e);
      }
    }

    // 2. Actualizar el progreso del enrollment
    const progress = Math.round((next.size / items.length) * 100);
    try {
      await enrollmentsApi.updateProgress(id, progress);
    } catch {
      // silently fail
    }

    if (current < items.length - 1) {
      setCurrent(current + 1);
    }
  }, [current, items, completedIds, id]);

  if (!course || items.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const it = items[current];
  const progress = items.length ? Math.round((completedIds.size / items.length) * 100) : 0;

  // Quiz scoring
  let quizScore = 0;
  let quizTotal = 0;
  let quizPassed = false;
  if (it.kind === "quiz" && quizSubmitted) {
    for (const q of it.quiz.questions) {
      quizTotal++;
      if (quizAnswers[q.id] === q.correctIndex) quizScore++;
    }
    const pct = quizTotal ? (quizScore / quizTotal) * 100 : 0;
    quizPassed = pct >= (it.quiz.passingScore || 70);
  }

  // YouTube video id de la lección actual
  let ytId: string | null = null;
  if (it.kind === "lesson") {
    const m = it.lesson.videoUrl?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|\/embed\/)([\w-]{11})/);
    ytId = m ? m[1] : null;
  }
  // El botón "Marcar como vista" se bloquea hasta ver el video (salvo que ya esté completa)
  const isVideoLesson = it.kind === "lesson" && !!ytId;
  const alreadyComplete = completedIds.has(it.id);
  const lockComplete = isVideoLesson && !alreadyComplete && !videoWatched;

  return (
    <>
      <PageMeta
        title={`${it.kind === "lesson" ? it.lesson.title : it.quiz.title} | ${course.title}`}
        description=""
      />

      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/mis-cursos"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400"
        >
          ← Mis cursos
        </Link>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          {progress}% completado
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Contenido principal */}
        <div className="space-y-4 xl:col-span-3">
          {it.kind === "lesson" ? (
            <>
              {(() => {
                // Detect if this lesson has a downloadable file (explicit file type, or non-YouTube URL)
                const hasFileUrl = it.lesson.fileUrl || (it.lesson.videoUrl && !ytId);
                const downloadUrl = it.lesson.fileUrl || it.lesson.videoUrl || (it.lesson.content?.startsWith("http") ? it.lesson.content : null);

                if (it.lesson.type === "file" || (hasFileUrl && !ytId)) {
                  // ── FILE / DOWNLOADABLE RESOURCE ──
                  const fileName = downloadUrl?.split("/").pop()?.split("?")[0] || "archivo";
                  return (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                      <div className="flex flex-col items-center py-8">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/10">
                          <svg className="h-10 w-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                          </svg>
                        </div>
                        <span className="mb-1 text-xs text-gray-400 dark:text-gray-500">
                          {it.moduleTitle} · Recurso {current + 1} de {items.length}
                        </span>
                        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90 text-center">
                          {it.lesson.title}
                        </h2>
                        {it.lesson.content && !it.lesson.content.startsWith("http") && (
                          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
                            {it.lesson.content}
                          </p>
                        )}
                        {downloadUrl ? (
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-brand-600 transition-colors"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Descargar {fileName}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-400">Archivo no disponible</p>
                        )}
                      </div>
                    </div>
                  );
                }

                if (ytId) {
                  return (
                    <LessonVideo
                      key={ytId}
                      videoId={ytId}
                      onReachedEnd={handleVideoReachedEnd}
                      onContinue={markComplete}
                      continueLabel={current < items.length - 1 ? "Continuar" : "Finalizar curso"}
                    />
                  );
                }

                return (
                  <div className="flex aspect-video items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
                    <span className="text-4xl">{it.lesson.type === "text" ? "📄" : "▶️"}</span>
                  </div>
                );
              })()}

              {it.lesson.type !== "file" && !(it.lesson.videoUrl && !ytId) && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <span className="mb-2 block text-xs text-gray-400 dark:text-gray-500">
                  {it.moduleTitle} · Lección {current + 1} de {items.length}
                </span>
                <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                  {it.lesson.title}
                </h2>
                {it.lesson.content && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{it.lesson.content}</p>
                )}
              </div>
              )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setCurrent(Math.max(0, current - 1))}
                    disabled={current === 0}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={markComplete}
                    disabled={lockComplete}
                    className="rounded-lg bg-hz-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-hz-blue-dark disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {alreadyComplete
                      ? current < items.length - 1
                        ? "Siguiente"
                        : "Completado ✓"
                      : "Marcar como vista y continuar"}
                  </button>
                  {lockComplete && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Mira el video para habilitar este botón
                    </span>
                  )}
                </div>
            </>
          ) : (
            // QUIZ VIEW — Redirect to proper QuizTaker
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 0 0-1 1v1.07A7.001 7.001 0 0 0 3 11a7 7 0 1 0 14 0 7.001 7.001 0 0 0-5-6.93V3a1 1 0 0 0-1-1H9Zm1 4a5 5 0 1 1 0 10A5 5 0 0 1 10 6Z" />
                </svg>
                Cuestionario
              </span>
              <span className="mb-2 block text-xs text-gray-400 dark:text-gray-500">
                {it.moduleTitle} · Item {current + 1} de {items.length}
              </span>
              <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                {it.quiz.title}
              </h2>
              <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                {it.quiz.questions.length} {it.quiz.questions.length === 1 ? "pregunta" : "preguntas"}
                {it.quiz.timeLimit ? ` · ${it.quiz.timeLimit} min` : ""}
                {" · "}Aprobar con {it.quiz.passingScore}%
              </p>

              <div className="flex flex-col gap-3 mt-6">
                <Link
                  to={`/curso/${id}/quiz/${it.quiz.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-white font-semibold hover:bg-brand-600 transition-colors"
                >
                  📝 Ir al Quiz
                </Link>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={() => setCurrent(Math.max(0, current - 1))}
                  disabled={current === 0}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  Anterior
                </button>
                <button
                  onClick={markComplete}
                  className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
                >
                  {current < items.length - 1 ? "Siguiente" : "Finalizar ✓"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1">
          <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {course.title}
              </h3>
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-1.5 rounded-full bg-brand-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {completedIds.size} de {items.length} completados
              </p>
            </div>
            <div className="max-h-[65vh] overflow-y-auto">
              {groups.map((g) => {
                const collapsed = collapsedModules.has(g.title);
                const groupDone = g.items.filter((i) => completedIds.has(i.id)).length;
                return (
                  <div key={g.title} className="border-b border-gray-100 last:border-b-0 dark:border-gray-800">
                    <button
                      onClick={() => toggleModule(g.title)}
                      className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
                    >
                      <span className="flex-1 truncate normal-case">{g.title}</span>
                      <span className="flex-shrink-0 text-[10px] font-medium text-gray-400">
                        {groupDone}/{g.items.length}
                      </span>
                      <svg
                        className={`h-3 w-3 flex-shrink-0 transition-transform ${collapsed ? "" : "rotate-180"}`}
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="m3 4 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {!collapsed &&
                      g.items.map((gi) => {
                        const globalIdx = items.indexOf(gi);
                        const isComplete = completedIds.has(gi.id);
                        const isCurrent = globalIdx === current;
                        return (
                          <button
                            key={gi.id}
                            onClick={() => setCurrent(globalIdx)}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                              isCurrent
                                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                                : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs ${
                                isComplete
                                  ? "bg-success-500 text-white"
                                  : isCurrent
                                  ? "bg-brand-500 text-white"
                                  : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                              }`}
                            >
                              {isComplete ? "✓" : gi.kind === "quiz" ? "?" : gi.kind === "lesson" && gi.lesson.type === "file" ? "⬇" : "▶"}
                            </span>
                            <span className="flex-1 truncate text-xs">
                              {gi.kind === "lesson" ? gi.lesson.title : gi.quiz.title}
                            </span>
                            {gi.kind === "lesson" && gi.lesson.duration && (
                              <span className="ml-auto flex-shrink-0 text-[10px] text-gray-400">
                                {gi.lesson.duration}m
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
