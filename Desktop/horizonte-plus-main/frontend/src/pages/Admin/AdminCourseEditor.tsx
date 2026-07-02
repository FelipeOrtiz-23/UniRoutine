import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { coursesApi, lessonsApi, quizzesApi, Course, Lesson, Quiz } from "../../services/api";

// ── Lesson Form ─────────────────────────────────────
function LessonForm({ courseId, lesson, onSaved, onCancel }: { courseId: string; lesson: Lesson | null; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: lesson?.title || "", videoUrl: lesson?.videoUrl || "", content: lesson?.content || "",
    duration: lesson?.duration?.toString() || "", order: lesson?.order?.toString() || "0",
    type: lesson?.type || "video", isFree: lesson?.isFree || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.title) { setError("El título es requerido"); return; }
    setSaving(true); setError("");
    try {
      const data = { ...form, duration: form.duration ? Number(form.duration) : null, order: Number(form.order) || 0, courseId };
      if (lesson) await lessonsApi.update(lesson.id, data);
      else await lessonsApi.create(data);
      onSaved();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/30 p-4 dark:border-brand-500/20 dark:bg-brand-500/5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Título de la lección</label>
          <input className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">URL del video</label>
          <input className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Orden</label>
            <input type="number" className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Min</label>
            <input type="number" className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Tipo</label>
            <select className="h-10 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-800 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="video">Video</option><option value="text">Texto</option><option value="file">Archivo</option>
            </select>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Contenido / descripción</label>
          <textarea rows={2} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </div>
      </div>
      <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-500" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} /><span className="text-xs text-gray-600 dark:text-gray-400">Vista previa gratuita</span></label>
      {error && <p className="text-xs text-error-500">{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-60">{saving ? "Guardando..." : "Guardar lección"}</button>
        <button onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5">Cancelar</button>
      </div>
    </div>
  );
}

// ── Quiz Question Editor ────────────────────────────
interface Question { id: string; text: string; options: string[]; correctIndex: number; points: number; }

function QuizForm({ courseId, quiz, onSaved, onCancel }: { courseId: string; quiz: Quiz | null; onSaved: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState(quiz?.title || "");
  const [passingScore, setPassingScore] = useState(quiz?.passingScore?.toString() || "70");
  const [timeLimit, setTimeLimit] = useState(quiz?.timeLimit?.toString() || "");
  const [questions, setQuestions] = useState<Question[]>(quiz?.questions || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addQuestion = () => {
    setQuestions([...questions, { id: crypto.randomUUID(), text: "", options: ["", "", "", ""], correctIndex: 0, points: 10 }]);
  };

  const updateQuestion = (idx: number, q: Partial<Question>) => {
    const copy = [...questions];
    copy[idx] = { ...copy[idx], ...q };
    setQuestions(copy);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const copy = [...questions];
    copy[qIdx].options[oIdx] = value;
    setQuestions(copy);
  };

  const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!title) { setError("El título es requerido"); return; }
    if (questions.length === 0) { setError("Agrega al menos una pregunta"); return; }
    setSaving(true); setError("");
    try {
      const data = { title, passingScore: Number(passingScore), timeLimit: timeLimit ? Number(timeLimit) : null, questions, courseId };
      if (quiz) await quizzesApi.update(quiz.id, data);
      else await quizzesApi.create(data);
      onSaved();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 rounded-xl border border-brand-200 bg-brand-50/30 p-4 dark:border-brand-500/20 dark:bg-brand-500/5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Título del quiz</label>
          <input className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Puntaje mínimo (%)</label>
          <input type="number" className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Tiempo límite (min)</label>
          <input type="number" className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90" placeholder="Sin límite" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Preguntas ({questions.length})</h4>
          <button onClick={addQuestion} className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600">+ Pregunta</button>
        </div>
        {questions.map((q, qi) => (
          <div key={q.id} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Pregunta {qi + 1}</span>
              <div className="flex items-center gap-2">
                <input type="number" className="h-7 w-16 rounded border border-gray-300 bg-white px-2 text-xs text-gray-800 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white/90" value={q.points} onChange={(e) => updateQuestion(qi, { points: Number(e.target.value) })} />
                <span className="text-xs text-gray-400">pts</span>
                <button onClick={() => removeQuestion(qi)} className="text-error-400 hover:text-error-600 text-xs">✕</button>
              </div>
            </div>
            <input className="mb-2 h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90" placeholder="Escribe la pregunta..." value={q.text} onChange={(e) => updateQuestion(qi, { text: e.target.value })} />
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${q.id}`} checked={q.correctIndex === oi} onChange={() => updateQuestion(qi, { correctIndex: oi })} className="h-4 w-4 text-brand-500" />
                  <input className="h-8 flex-1 rounded border border-gray-200 bg-gray-50 px-2 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90" placeholder={`Opción ${oi + 1}`} value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-error-500">{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-60">{saving ? "Guardando..." : "Guardar quiz"}</button>
        <button onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5">Cancelar</button>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────
export default function AdminCourseEditor() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [editingLesson, setEditingLesson] = useState<Lesson | null | "new">(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null | "new">(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState<Quiz | null>(null);

  const load = () => {
    if (!id) return;
    coursesApi.getOne(id).then(setCourse);
    lessonsApi.getByCourse(id).then((l) => setLessons(l.sort((a, b) => a.order - b.order)));
    quizzesApi.getByCourse(id).then(setQuizzes);
  };

  useEffect(() => { load(); }, [id]);

  const handleDeleteLesson = async () => {
    if (!deletingLesson) return;
    await lessonsApi.remove(deletingLesson.id);
    setDeletingLesson(null);
    load();
  };

  const handleDeleteQuiz = async () => {
    if (!deletingQuiz) return;
    await quizzesApi.remove(deletingQuiz.id);
    setDeletingQuiz(null);
    load();
  };

  if (!course) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  return (
    <>
      <PageMeta title={`Editar: ${course.title} | Horizonte Plus`} description="" />

      <div className="mb-4">
        <Link to="/admin/cursos" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400">← Volver a cursos</Link>
      </div>

      {/* Course header */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">{course.title}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{course.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge size="sm" color="primary">{course.level === "beginner" ? "Principiante" : course.level === "intermediate" ? "Intermedio" : "Avanzado"}</Badge>
              <Badge size="sm" color={course.isPublished ? "success" : "warning"}>{course.isPublished ? "Publicado" : "Borrador"}</Badge>
              {course.isFree && <Badge size="sm" color="success">Gratis</Badge>}
              {course.category && <Badge size="sm" color="primary">{course.category.name}</Badge>}
            </div>
          </div>
          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            <p>{lessons.length} lecciones</p>
            <p>{quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Lessons */}
        <div className="space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Lecciones</h2>
            <button onClick={() => setEditingLesson("new")} className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white hover:bg-brand-600">+ Nueva lección</button>
          </div>

          {editingLesson === "new" && (
            <LessonForm courseId={id!} lesson={null} onSaved={() => { setEditingLesson(null); load(); }} onCancel={() => setEditingLesson(null)} />
          )}

          {lessons.length === 0 && editingLesson !== "new" ? (
            <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-white/[0.03]">
              <span className="mb-2 text-3xl">📝</span>
              <p className="text-sm text-gray-400 dark:text-gray-500">No hay lecciones aún.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, i) => (
                <div key={lesson.id}>
                  {editingLesson && typeof editingLesson === "object" && editingLesson.id === lesson.id ? (
                    <LessonForm courseId={id!} lesson={lesson} onSaved={() => { setEditingLesson(null); load(); }} onCancel={() => setEditingLesson(null)} />
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">{lesson.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{lesson.type}</span>
                          {lesson.duration && <span>· {lesson.duration} min</span>}
                          {lesson.isFree && <Badge size="sm" color="success">Preview</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingLesson(lesson)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-white/5">
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => setDeletingLesson(lesson)} className="rounded-lg p-2 text-gray-400 hover:bg-error-50 hover:text-error-500 dark:hover:bg-error-500/10">
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quizzes */}
        <div className="space-y-4 xl:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Quizzes</h2>
            <button onClick={() => setEditingQuiz("new")} className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600">+ Quiz</button>
          </div>

          {editingQuiz === "new" && (
            <QuizForm courseId={id!} quiz={null} onSaved={() => { setEditingQuiz(null); load(); }} onCancel={() => setEditingQuiz(null)} />
          )}

          {quizzes.length === 0 && editingQuiz !== "new" ? (
            <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-white/[0.03]">
              <span className="mb-2 text-3xl">❓</span>
              <p className="text-sm text-gray-400 dark:text-gray-500">No hay quizzes aún.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {quizzes.map((quiz) => (
                <div key={quiz.id}>
                  {editingQuiz && typeof editingQuiz === "object" && editingQuiz.id === quiz.id ? (
                    <QuizForm courseId={id!} quiz={quiz} onSaved={() => { setEditingQuiz(null); load(); }} onCancel={() => setEditingQuiz(null)} />
                  ) : (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-200">{quiz.title}</p>
                          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            {quiz.questions.length} preguntas · Mín. {quiz.passingScore}%
                            {quiz.timeLimit ? ` · ${quiz.timeLimit} min` : ""}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingQuiz(quiz)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-white/5">
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => setDeletingQuiz(quiz)} className="rounded-lg p-2 text-gray-400 hover:bg-error-50 hover:text-error-500 dark:hover:bg-error-500/10">
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete lesson modal */}
      {deletingLesson && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="mb-2 font-semibold text-gray-800 dark:text-white/90">Eliminar lección</h3>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">¿Eliminar <strong>{deletingLesson.title}</strong>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingLesson(null)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">Cancelar</button>
              <button onClick={handleDeleteLesson} className="rounded-lg bg-error-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-error-600">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete quiz modal */}
      {deletingQuiz && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="mb-2 font-semibold text-gray-800 dark:text-white/90">Eliminar quiz</h3>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">¿Eliminar <strong>{deletingQuiz.title}</strong> y todas sus preguntas?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingQuiz(null)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">Cancelar</button>
              <button onClick={handleDeleteQuiz} className="rounded-lg bg-error-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-error-600">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
