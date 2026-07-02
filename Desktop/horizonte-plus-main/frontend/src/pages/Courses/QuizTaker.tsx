import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { quizAttemptsApi, quizzesApi } from "../../services/api";
import PageMeta from "../../components/common/PageMeta";

type Question = {
  id: string;
  text: string;
  options: string[];
  points: number;
  correctIndex?: number;
  imageUrl?: string | null;
};

type Phase = "intro" | "quiz" | "result";

export default function QuizTaker() {
  const { quizId, courseId } = useParams<{ quizId: string; courseId: string }>();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("intro");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Quiz info
  const [quizTitle, setQuizTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [attemptsUsed, setAttemptsUsed] = useState(0);

  // Active attempt
  const [attemptId, setAttemptId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Result
  const [result, setResult] = useState<any>(null);

  // Past attempts
  const [pastAttempts, setPastAttempts] = useState<any[]>([]);

  // Load quiz info & attempts
  useEffect(() => {
    if (!quizId) return;
    Promise.all([
      quizzesApi.getOne(quizId),
      quizAttemptsApi.getMyAttempts(quizId),
    ])
      .then(([quiz, attData]) => {
        setQuizTitle(quiz.title);
        setTimeLimit(quiz.timeLimit);
        setPassingScore(quiz.passingScore);
        setMaxAttempts(attData.maxAttempts);
        setAttemptsUsed(attData.attemptsUsed);
        setPastAttempts(attData.attempts || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [quizId]);

  // View a past attempt result
  const viewPastResult = async (attemptId: string) => {
    setLoading(true);
    try {
      const res = await quizAttemptsApi.getResult(attemptId);
      setResult(res);
      setPhase("result");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Start attempt
  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await quizAttemptsApi.start(quizId!);
      setAttemptId(data.id);
      setQuestions(data.questions);
      setPassingScore(data.passingScore);

      // Start timer if there's a time limit
      if (data.expiresAt) {
        const expiresMs = new Date(data.expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
        setSecondsLeft(remaining);
      }

      setPhase("quiz");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (phase !== "quiz" || secondsLeft === null) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto-submit
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, secondsLeft !== null]); // eslint-disable-line

  // Submit answers
  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const answerList = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id] ?? -1,
      }));
      const res = await quizAttemptsApi.submit(attemptId, answerList);
      setResult(res);
      setPhase("result");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, answers, questions, submitting]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`Quiz: ${quizTitle} | Horizonte Plus`} description="" />
      <div className="mx-auto max-w-3xl px-4 py-8">

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{quizTitle}</h1>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                <p className="text-gray-500 dark:text-gray-400">Preguntas</p>
                <p className="text-xl font-bold mt-1">—</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                <p className="text-gray-500 dark:text-gray-400">Duración</p>
                <p className="text-xl font-bold mt-1">{timeLimit ? `${timeLimit} min` : "Sin límite"}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                <p className="text-gray-500 dark:text-gray-400">Puntaje mínimo</p>
                <p className="text-xl font-bold mt-1">{passingScore}%</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                <p className="text-gray-500 dark:text-gray-400">Intentos</p>
                <p className="text-xl font-bold mt-1">{attemptsUsed} / {maxAttempts}</p>
              </div>
            </div>

            {attemptsUsed >= maxAttempts ? (
              <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                Ya usaste todos tus intentos para este quiz.
              </div>
            ) : (
              <button
                onClick={handleStart}
                className="mt-6 w-full rounded-xl bg-brand-500 px-6 py-3 text-white font-semibold hover:bg-brand-600 transition-colors"
              >
                {attemptsUsed > 0 ? "Reintentar Quiz" : "Iniciar Quiz"}
              </button>
            )}

            <button
              onClick={() => navigate(`/curso/${courseId}/aprender`)}
              className="mt-3 w-full rounded-xl border border-gray-200 px-6 py-3 text-gray-600 font-medium hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
            >
              Volver al curso
            </button>

            {/* Past attempts */}
            {pastAttempts.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Historial de intentos
                </h3>
                <div className="space-y-2">
                  {pastAttempts.map((att: any) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          att.passed
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : att.status === "expired"
                              ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {att.passed ? "✓" : att.status === "expired" ? "⏱" : "✗"}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            Intento {att.attemptNumber}
                            {att.score !== null && ` — ${att.score}%`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {att.status === "expired" ? "Expirado" : att.passed ? "Aprobado" : "No aprobado"}
                            {att.finishedAt && ` · ${new Date(att.finishedAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`}
                          </p>
                        </div>
                      </div>
                      {att.status === "completed" && (
                        <button
                          onClick={() => viewPastResult(att.id)}
                          className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-200 dark:bg-brand-500/15 dark:text-brand-400 dark:hover:bg-brand-500/25"
                        >
                          Ver resultado
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── QUIZ ── */}
        {phase === "quiz" && (
          <div>
            {/* Timer bar */}
            {secondsLeft !== null && (
              <div className={`sticky top-0 z-10 mb-6 flex items-center justify-between rounded-xl px-5 py-3 font-mono text-lg font-bold ${
                secondsLeft <= 60
                  ? "bg-red-500 text-white animate-pulse"
                  : secondsLeft <= 300
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white"
              }`}>
                <span>⏱ {formatTime(secondsLeft)}</span>
                <span className="text-sm font-normal opacity-80">
                  {answeredCount}/{questions.length} respondidas
                </span>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
              {questions.map((q, qi) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white text-sm font-bold">
                      {qi + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white">{q.text}</p>
                      {q.imageUrl && (
                        <img
                          src={q.imageUrl}
                          alt="Imagen de la pregunta"
                          className="mt-3 max-h-72 w-auto rounded-xl border border-gray-200 dark:border-gray-700"
                        />
                      )}
                      <p className="text-xs text-gray-400 mt-1">{q.points} punto{q.points !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="space-y-2 ml-11">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                          answers[q.id] === oi
                            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id] === oi}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                          className="accent-brand-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-8 w-full rounded-xl bg-brand-500 px-6 py-4 text-white font-bold text-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {submitting ? "Enviando..." : "Enviar respuestas"}
            </button>
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && result && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center h-20 w-20 rounded-full text-3xl font-bold ${
                result.passed
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {result.passed ? "✓" : "✗"}
              </div>
              <h2 className="text-2xl font-bold mt-4 text-gray-800 dark:text-white">
                {result.passed ? "¡Aprobaste!" : "No aprobaste"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{result.quizTitle}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{result.score}%</p>
                <p className="text-xs text-gray-500 mt-1">Puntaje</p>
              </div>
              <div className="text-center rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {result.correctCount}/{result.totalQuestions}
                </p>
                <p className="text-xs text-gray-500 mt-1">Correctas</p>
              </div>
              <div className="text-center rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{result.passingScore}%</p>
                <p className="text-xs text-gray-500 mt-1">Mínimo</p>
              </div>
            </div>

            {/* Detailed answers (if show_answers is enabled) */}
            {result.questions && (
              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Detalle de respuestas</h3>
                {result.questions.map((q: any, i: number) => (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-4 ${
                      q.isCorrect
                        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10"
                        : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`text-sm font-bold ${q.isCorrect ? "text-green-600" : "text-red-600"}`}>
                        {q.isCorrect ? "✓" : "✗"}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-white text-sm">
                          {i + 1}. {q.text}
                        </p>
                        {q.imageUrl && (
                          <img
                            src={q.imageUrl}
                            alt="Imagen de la pregunta"
                            className="mt-2 max-h-60 w-auto rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                        )}
                        <div className="mt-2 space-y-1 text-sm">
                          {q.options.map((opt: string, oi: number) => {
                            const isCorrect = oi === q.correctIndex;
                            const isSelected = oi === q.selectedIndex;
                            return (
                              <div
                                key={oi}
                                className={`rounded-lg px-3 py-1.5 ${
                                  isCorrect
                                    ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300 font-medium"
                                    : isSelected && !isCorrect
                                      ? "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300 line-through"
                                      : "text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {isCorrect && "✓ "}{isSelected && !isCorrect && "✗ "}{opt}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate(`/curso/${courseId}/aprender`)}
              className="w-full rounded-xl bg-brand-500 px-6 py-3 text-white font-semibold hover:bg-brand-600 transition-colors"
            >
              Volver al curso
            </button>
          </div>
        )}
      </div>
    </>
  );
}
