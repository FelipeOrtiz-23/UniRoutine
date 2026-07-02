import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { usersApi, enrollmentsApi, User, Enrollment } from "../../services/api";
import Badge from "../../components/ui/badge/Badge";
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "../../components/ui/table";

export default function AdminStudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"avances" | "notas" | "certificados">("avances");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      usersApi.getOne(id),
      enrollmentsApi.byUser(id),
    ]).then(([u, e]) => {
      setStudent(u);
      setEnrollments(e);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;
  if (!student) return <p className="py-20 text-center text-gray-400">Usuario no encontrado</p>;

  const completed = enrollments.filter((e) => e.status === "completed").length;
  const active = enrollments.filter((e) => e.status === "active").length;
  const avg = enrollments.length ? Math.round(enrollments.reduce((s, e) => s + Number(e.progress), 0) / enrollments.length) : 0;

  return (
    <>
      <PageMeta title={`${student.firstName} ${student.lastName} | Horizonte Plus`} description="" />

      <div className="mb-4">
        <Link to="/usuarios" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400">← Volver a usuarios</Link>
      </div>

      {/* Header del estudiante */}
      <div className="mb-6 flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-xl font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          {student.firstName[0]}{student.lastName[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">{student.firstName} {student.lastName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
          <div className="mt-2 flex gap-2">
            <Badge size="sm" color={student.role === "student" ? "success" : "warning"}>{student.role === "student" ? "Estudiante" : student.role === "teacher" ? "Docente" : "Admin"}</Badge>
            <Badge size="sm" color={student.isActive ? "success" : "error"}>{student.isActive ? "Activo" : "Inactivo"}</Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400">Inscritos</p>
          <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{enrollments.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400">En progreso</p>
          <p className="mt-1 text-2xl font-bold text-warning-500">{active}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400">Completados</p>
          <p className="mt-1 text-2xl font-bold text-success-500">{completed}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs text-gray-500 dark:text-gray-400">Promedio</p>
          <p className="mt-1 text-2xl font-bold text-brand-500">{avg}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {(["avances", "notas", "certificados"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-white text-gray-800 shadow-sm dark:bg-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t === "avances" ? "Avances" : t === "notas" ? "Notas" : "Certificados"}
          </button>
        ))}
      </div>

      {/* Content */}
      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-white/[0.03]">
          <span className="mb-3 text-4xl">📖</span>
          <p className="text-gray-400 dark:text-gray-500">Este estudiante no tiene inscripciones.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-12">#</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Curso</TableCell>
                  {(tab === "avances" || tab === "notas") && (
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Progreso</TableCell>
                  )}
                  {tab === "notas" && (
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nota</TableCell>
                  )}
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estado</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Inscripción</TableCell>
                  {tab === "certificados" && (
                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Certificado</TableCell>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {enrollments.map((e, idx) => {
                  const p = Math.round(Number(e.progress));
                  const nota = p >= 80 ? "A" : p >= 60 ? "B" : p >= 40 ? "C" : p > 0 ? "D" : "—";
                  const notaColor = p >= 80 ? "success" : p >= 60 ? "warning" : p > 0 ? "error" : "primary";
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="py-3 text-center text-gray-400 text-theme-sm">{idx + 1}</TableCell>
                      <TableCell className="py-3">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{e.course?.title || "Curso"}</p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">{e.course?.category?.name || ""}</span>
                      </TableCell>
                      {(tab === "avances" || tab === "notas") && (
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3 w-36">
                            <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                              <div className="h-2 rounded-full bg-brand-500 transition-all" style={{ width: `${p}%` }} />
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{p}%</span>
                          </div>
                        </TableCell>
                      )}
                      {tab === "notas" && (
                        <TableCell className="py-3"><Badge size="sm" color={notaColor as any}>{nota}</Badge></TableCell>
                      )}
                      <TableCell className="py-3">
                        <Badge size="sm" color={e.status === "completed" ? "success" : e.status === "active" ? "warning" : "error"}>
                          {e.status === "completed" ? "Completado" : e.status === "active" ? "En curso" : "Cancelado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(e.enrolledAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                      </TableCell>
                      {tab === "certificados" && (
                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                          {e.status === "completed" ? (
                            <Badge size="sm" color="success">Emitido</Badge>
                          ) : (
                            <span className="text-xs text-gray-400">Pendiente</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
}
