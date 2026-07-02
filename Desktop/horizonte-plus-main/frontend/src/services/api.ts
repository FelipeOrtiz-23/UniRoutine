import type { LandingContent } from "../types/landing";

const API = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_URL || "https://horizonte-backend-166744464111.us-central1.run.app/api";

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("hp_token");
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (res.status === 401) {
    const body = await res.json().catch(() => ({}));
    if (path === "/auth/login") {
      throw new Error(body.message || "Usuario o contraseña incorrectos");
    }
    localStorage.removeItem("hp_token");
    window.location.href = "/signin";
    throw new Error(body.message || "No autorizado");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Error ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

// ── Auth ───────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    request<{ accessToken: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => request<User>("/auth/me"),
  impersonate: (userId: string) =>
    request<{ accessToken: string; user: User }>(`/auth/impersonate/${userId}`, { method: "POST" }),
};

// ── Courses ────────────────────────────────────────
export const coursesApi = {
  getAll: (all = false) => request<Course[]>(`/courses${all ? "?all=true" : ""}`),
  getOne: (id: string) => request<Course>(`/courses/${id}`),
  getCatalog: (params: { page?: number; limit?: number; search?: string; categoryId?: string }) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.search) qs.set("search", params.search);
    if (params.categoryId) qs.set("categoryId", params.categoryId);
    return request<{ data: Course[]; total: number; page: number; totalPages: number }>(`/courses/catalog?${qs}`);
  },
  getPaginated: (params: { page?: number; limit?: number; search?: string; categoryId?: string; isPublished?: string }) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.search) qs.set("search", params.search);
    if (params.categoryId) qs.set("categoryId", params.categoryId);
    if (params.isPublished) qs.set("isPublished", params.isPublished);
    return request<{ data: Course[]; total: number; page: number; totalPages: number }>(`/courses/paginated?${qs}`);
  },
  create: (data: any) => request<Course>("/courses", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<Course>(`/courses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/courses/${id}`, { method: "DELETE" }),
};

// ── Lessons ────────────────────────────────────────
export const lessonsApi = {
  getByCourse: (courseId: string) => request<Lesson[]>(`/lessons/course/${courseId}`),
  create: (data: any) => request<Lesson>("/lessons", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<Lesson>(`/lessons/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/lessons/${id}`, { method: "DELETE" }),
  markComplete: (id: string) => request<{ completed: boolean; lessonId: string }>(`/lessons/${id}/complete`, { method: "POST" }),
  getProgress: (courseId: string) => request<string[]>(`/lessons/progress/${courseId}`),
};

// ── Enrollments ────────────────────────────────────
export interface PaginatedEnrollments {
  data: Enrollment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const enrollmentsApi = {
  enroll: (courseId: string) =>
    request<Enrollment>(`/enrollments/${courseId}`, { method: "POST" }),
  my: () => request<Enrollment[]>("/enrollments/my"),
  getAll: (params?: { page?: number; limit?: number; courseId?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.courseId) q.set("courseId", params.courseId);
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return request<PaginatedEnrollments>(`/enrollments${qs ? `?${qs}` : ""}`);
  },
  updateProgress: (courseId: string, progress: number) =>
    request<Enrollment>(`/enrollments/${courseId}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ progress }),
    }),
  // Admin: obtener inscripciones de un usuario específico
  byUser: (userId: string) => request<Enrollment[]>(`/enrollments/user/${userId}`),
  // Admin: inscribir manualmente a un usuario
  adminEnroll: (userId: string, courseId: string) =>
    request<Enrollment>("/enrollments/admin", {
      method: "POST",
      body: JSON.stringify({ userId, courseId }),
    }),
};

// ── Categories ─────────────────────────────────────
export const categoriesApi = {
  getAll: () => request<Category[]>("/categories"),
  create: (data: any) => request<Category>("/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<Category>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/categories/${id}`, { method: "DELETE" }),
};

// ── Quizzes ────────────────────────────────────────
export const quizzesApi = {
  getByCourse: (courseId: string) => request<Quiz[]>(`/quizzes/course/${courseId}`),
  getOne: (id: string) => request<Quiz>(`/quizzes/${id}`),
  create: (data: any) => request<Quiz>("/quizzes", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<Quiz>(`/quizzes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/quizzes/${id}`, { method: "DELETE" }),
};

// ── Certificates ───────────────────────────────────
export const certificatesApi = {
  my: () => request<Certificate[]>("/certificates/my"),
  issue: (courseId: string) => request<Certificate>(`/certificates/${courseId}/issue`, { method: "POST" }),
  validate: (code: string) => request<Certificate>(`/certificates/validate/${code}`),
};

// ── Users (admin) ──────────────────────────────────
export const usersApi = {
  getAll: () => request<User[]>("/users"),
  getOne: (id: string) => request<User>(`/users/${id}`),
  create: (data: any) => request<User>("/users", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/users/${id}`, { method: "DELETE" }),
};

// ── Types ──────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "teacher" | "student";
  avatarUrl?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  level: "beginner" | "intermediate" | "advanced";
  duration?: number;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  categoryId?: string;
  category?: Category;
  lessons?: Lesson[];
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  fileUrl?: string;
  type: "video" | "text" | "quiz" | "file";
  order: number;
  moduleTitle?: string | null;
  moduleOrder?: number | null;
  duration?: number;
  isFree: boolean;
  courseId: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: { id: string; text: string; options: string[]; correctIndex: number; points: number }[];
  passingScore: number;
  timeLimit?: number;
  moduleTitle?: string | null;
  moduleOrder?: number | null;
  courseId: string;
  createdAt?: string;
}

export interface Certificate {
  id: string;
  code: string;
  userId: string;
  courseId: string;
  course?: Course;
  issuedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  course?: Course;
  user?: User;
  progress: number;
  status: "active" | "completed" | "cancelled";
  enrolledAt: string;
  completedAt?: string;
}

// ── Audit Logs ─────────────────────────────────────
export interface AuditLog {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  createdAt: string;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const auditLogApi = {
  getAll: (params?: {
    page?: number; limit?: number; action?: string; entity?: string;
    userId?: string; search?: string; dateFrom?: string; dateTo?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.action) q.set("action", params.action);
    if (params?.entity) q.set("entity", params.entity);
    if (params?.userId) q.set("userId", params.userId);
    if (params?.search) q.set("search", params.search);
    if (params?.dateFrom) q.set("dateFrom", params.dateFrom);
    if (params?.dateTo) q.set("dateTo", params.dateTo);
    const qs = q.toString();
    return request<PaginatedAuditLogs>(`/audit-logs${qs ? `?${qs}` : ""}`);
  },
};

// ── Payments ──────────────────────────────────────────
export const paymentsApi = {
  createSession: (courseId: string) =>
    request<{ sessionId: string; paymentId: string }>("/payments/epayco/create-session", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    }),
  confirm: (paymentId: string, refPayco?: string) =>
    request<any>(`/payments/epayco/confirm?paymentId=${paymentId}${refPayco ? `&ref_payco=${refPayco}` : ""}`),
  getStatus: (paymentId: string) =>
    request<any>(`/payments/epayco/status/${paymentId}`),
};

// ── Settings ──────────────────────────────────────────
export const settingsApi = {
  getAll: () => request<{ key: string; value: string; description: string }[]>("/settings"),
  update: (key: string, value: string) =>
    request<any>(`/settings/${key}`, { method: "PATCH", body: JSON.stringify({ value }) }),
};

// ── Landing (CMS) ─────────────────────────────────────
export const landingApi = {
  get: () => request<LandingContent>("/landing"),
  update: (content: LandingContent) =>
    request<LandingContent>("/landing", { method: "PUT", body: JSON.stringify(content) }),
};

// ── Storage (subida de imágenes) ──────────────────────
export const storageApi = {
  upload: async (file: File, folder = "landing"): Promise<{ url: string }> => {
    const token = localStorage.getItem("hp_token");
    const fd = new FormData();
    fd.append("file", file);
    // No fijamos Content-Type: el navegador define el boundary de multipart
    const res = await fetch(`${API}/storage/upload?folder=${encodeURIComponent(folder)}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Error ${res.status}`);
    }
    return res.json();
  },
};

// ── Quiz Attempts ─────────────────────────────────────
export const quizAttemptsApi = {
  start: (quizId: string) =>
    request<any>("/quiz-attempts/start", { method: "POST", body: JSON.stringify({ quizId }) }),
  submit: (attemptId: string, answers: { questionId: string; selectedIndex: number }[]) =>
    request<any>(`/quiz-attempts/${attemptId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  getResult: (attemptId: string) => request<any>(`/quiz-attempts/${attemptId}/result`),
  getMyAttempts: (quizId: string) => request<any>(`/quiz-attempts/quiz/${quizId}`),
  getCourseSummary: (courseId: string) => request<any>(`/quiz-attempts/course/${courseId}`),
};
