import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Landing from "./pages/Landing";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Catalog from "./pages/Courses/Catalog";
import CourseDetail from "./pages/Courses/CourseDetail";
import MyCourses from "./pages/Courses/MyCourses";
import CoursePlayer from "./pages/Courses/CoursePlayer";
import Grades from "./pages/Courses/Grades";
import Certificates from "./pages/Courses/Certificates";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminCourses from "./pages/Admin/AdminCourses";
import AdminCourseEditor from "./pages/Admin/AdminCourseEditor";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminEnrollments from "./pages/Admin/AdminEnrollments";
import AdminAuditLog from "./pages/Admin/AdminAuditLog";
import AdminStudentDetail from "./pages/Admin/AdminStudentDetail";
import PaymentConfirmation from "./pages/Payments/PaymentConfirmation";
import QuizTaker from "./pages/Courses/QuizTaker";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminLanding from "./pages/Admin/AdminLanding";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";

function AppInit({ children }: { children: React.ReactNode }) {
  const { token, fetchMe } = useAuth();
  useEffect(() => {
    if (token) fetchMe();
  }, []); // eslint-disable-line
  return <>{children}</>;
}

/* Raíz: landing público para visitantes, panel (/inicio) si hay sesión */
function RootRoute() {
  const { token } = useAuth();
  return token ? <Navigate to="/inicio" replace /> : <Landing />;
}

export default function App() {
  return (
    <Router>
      <AppInit>
        <ScrollToTop />
        <Routes>
          {/* Landing pública en la raíz (redirige a /inicio si hay sesión) */}
          <Route path="/" element={<RootRoute />} />

          {/* Layout con sidebar */}
          <Route element={<AppLayout />}>
            <Route path="/inicio" element={<Home />} />

            {/* Estudiante */}
            <Route path="/cursos" element={<Catalog />} />
            <Route path="/curso/:id" element={<CourseDetail />} />
            <Route path="/mis-cursos" element={<MyCourses />} />
            <Route path="/curso/:id/aprender" element={<CoursePlayer />} />
            <Route path="/notas" element={<Grades />} />
            <Route path="/certificados" element={<Certificates />} />
            <Route path="/pago/confirmacion" element={<PaymentConfirmation />} />
            <Route path="/curso/:courseId/quiz/:quizId" element={<QuizTaker />} />

            {/* Admin */}
            <Route path="/admin/cursos" element={<AdminCourses />} />
            <Route path="/admin/cursos/:id" element={<AdminCourseEditor />} />
            <Route path="/usuarios" element={<AdminUsers />} />
            <Route path="/usuarios/:id" element={<AdminStudentDetail />} />
            <Route path="/categorias" element={<AdminCategories />} />
            <Route path="/admin/inscripciones" element={<AdminEnrollments />} />
            <Route path="/admin/auditoria" element={<AdminAuditLog />} />
            <Route path="/admin/configuracion" element={<AdminSettings />} />
            <Route path="/admin/landing" element={<AdminLanding />} />
          </Route>

          {/* Ruta antigua del landing → raíz */}
          <Route path="/bienvenida" element={<Navigate to="/" replace />} />

          {/* Auth (sin sidebar) */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppInit>
    </Router>
  );
}
