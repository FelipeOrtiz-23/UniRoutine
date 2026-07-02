import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { enrollmentsApi, Enrollment } from "../../services/api";
import Badge from "../../components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";

export default function Grades() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { enrollmentsApi.my().then(setEnrollments).finally(() => setLoading(false)); }, []);

  const avg = enrollments.length ? Math.round(enrollments.reduce((s, e) => s + Number(e.progress), 0) / enrollments.length) : 0;

  return (
    <>
      <PageMeta title="Notas y progreso | Horizonte Plus" description="" />
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Notas y progreso</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Seguimiento de tu avance en cada curso</p>
      </div>

      {/* Resumen */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Cursos inscritos</p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{enrollments.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completados</p>
          <p className="mt-2 text-2xl font-bold text-success-500">{enrollments.filter((e) => e.status === "completed").length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Promedio general</p>
          <p className="mt-2 text-2xl font-bold text-brand-500">{avg}%</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>
        ) : enrollments.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400 dark:text-gray-500">
            <span className="mb-3 text-4xl">📊</span>
            <p>No hay calificaciones aún.</p>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Curso</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Progreso</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nota</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estado</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Inscripción</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {enrollments.map((e) => {
                  const p = Math.round(Number(e.progress));
                  const nota = p >= 80 ? "A" : p >= 60 ? "B" : p >= 40 ? "C" : p > 0 ? "D" : "—";
                  const notaColor = p >= 80 ? "success" : p >= 60 ? "warning" : p > 0 ? "error" : "primary";
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="py-3">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{e.course?.title || "Curso"}</p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">{e.course?.category?.name || ""}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3 w-36">
                          <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-800">
                            <div className="h-2 rounded-full bg-brand-500" style={{ width: `${p}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{p}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3"><Badge size="sm" color={notaColor as any}>{nota}</Badge></TableCell>
                      <TableCell className="py-3">
                        <Badge size="sm" color={e.status === "completed" ? "success" : e.status === "active" ? "warning" : "error"}>
                          {e.status === "completed" ? "Completado" : e.status === "active" ? "En curso" : "Cancelado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(e.enrolledAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
