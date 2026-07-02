import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface Enrollment {
  id: number;
  studentName: string;
  studentEmail: string;
  courseName: string;
  category: string;
  enrolledAt: string;
  status: "Activa" | "Completada" | "Cancelada";
  avatar: string;
}

const tableData: Enrollment[] = [
  {
    id: 1,
    studentName: "Carlos Martínez",
    studentEmail: "carlos@correo.com",
    courseName: "Fundamentos de React",
    category: "Desarrollo Web",
    enrolledAt: "12 Abr 2026",
    status: "Activa",
    avatar: "/images/user/user-01.jpg",
  },
  {
    id: 2,
    studentName: "María López",
    studentEmail: "maria@correo.com",
    courseName: "Diseño UX/UI Avanzado",
    category: "Diseño",
    enrolledAt: "11 Abr 2026",
    status: "Completada",
    avatar: "/images/user/user-02.jpg",
  },
  {
    id: 3,
    studentName: "Andrés Gómez",
    studentEmail: "andres@correo.com",
    courseName: "Base de datos con PostgreSQL",
    category: "Backend",
    enrolledAt: "10 Abr 2026",
    status: "Activa",
    avatar: "/images/user/user-03.jpg",
  },
  {
    id: 4,
    studentName: "Laura Sánchez",
    studentEmail: "laura@correo.com",
    courseName: "Marketing Digital",
    category: "Marketing",
    enrolledAt: "9 Abr 2026",
    status: "Cancelada",
    avatar: "/images/user/user-04.jpg",
  },
  {
    id: 5,
    studentName: "Diego Ramírez",
    studentEmail: "diego@correo.com",
    courseName: "Introducción a Python",
    category: "Programación",
    enrolledAt: "8 Abr 2026",
    status: "Activa",
    avatar: "/images/user/user-05.jpg",
  },
];

export default function RecentOrders() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Últimas inscripciones
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Ver todas
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Estudiante
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Curso
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Fecha
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Estado
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[40px] w-[40px] overflow-hidden rounded-full">
                      <img
                        src={enrollment.avatar}
                        className="h-[40px] w-[40px] object-cover"
                        alt={enrollment.studentName}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {enrollment.studentName}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {enrollment.studentEmail}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div>
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {enrollment.courseName}
                    </p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {enrollment.category}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {enrollment.enrolledAt}
                </TableCell>
                <TableCell className="py-3">
                  <Badge
                    size="sm"
                    color={
                      enrollment.status === "Completada"
                        ? "success"
                        : enrollment.status === "Activa"
                        ? "warning"
                        : "error"
                    }
                  >
                    {enrollment.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
