import { useEffect, useState, useCallback, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import { auditLogApi, AuditLog, PaginatedAuditLogs } from "../../services/api";
import Badge from "../../components/ui/badge/Badge";
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "../../components/ui/table";

const ACTION_LABEL: Record<string, string> = {
  LOGIN: "Inicio sesión",
  REGISTER: "Registro",
  CREATE: "Crear",
  UPDATE: "Actualizar",
  DELETE: "Eliminar",
  ENROLL: "Inscripción",
  IMPERSONATE: "Impersonar",
  ISSUE_CERT: "Certificado",
};
const ACTION_COLOR: Record<string, string> = {
  LOGIN: "primary",
  REGISTER: "info",
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "error",
  ENROLL: "primary",
  IMPERSONATE: "warning",
  ISSUE_CERT: "success",
};
const ENTITY_LIST = ["User", "Course", "Lesson", "Category", "Enrollment", "Quiz", "Certificate"];
const ENTITY_LABEL: Record<string, string> = {
  User: "Usuario",
  Course: "Curso",
  Lesson: "Lección",
  Category: "Categoría",
  Enrollment: "Inscripción",
  Quiz: "Cuestionario",
  Certificate: "Certificado",
};
const ACTION_LIST = ["LOGIN", "REGISTER", "CREATE", "UPDATE", "DELETE", "ENROLL", "IMPERSONATE", "ISSUE_CERT"];

const PAGE_SIZE = 30;

function statusColor(code?: number | null) {
  if (!code) return "text-gray-400";
  if (code >= 200 && code < 300) return "text-success-600 dark:text-success-400";
  if (code >= 400 && code < 500) return "text-warning-500 dark:text-warning-400";
  return "text-error-600 dark:text-error-400";
}

function formatPath(path?: string | null) {
  if (!path) return "—";
  const uuidRe = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  return path.split("?")[0].replace("/api/", "/").replace(uuidRe, (m) => `…${m.slice(-6)}`);
}

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLogs = useCallback(async (p: number, s: string, action: string, entity: string, df: string, dt: string) => {
    setLoading(true);
    try {
      const result: PaginatedAuditLogs = await auditLogApi.getAll({
        page: p, limit: PAGE_SIZE,
        action: action || undefined,
        entity: entity || undefined,
        search: s || undefined,
        dateFrom: df || undefined,
        dateTo: dt || undefined,
      });
      setLogs(result.data);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchLogs(page, search, filterAction, filterEntity, dateFrom, dateTo);
  }, [page, filterAction, filterEntity, dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchLogs(1, value, filterAction, filterEntity, dateFrom, dateTo);
    }, 400);
  };

  const clearFilters = () => {
    setSearch(""); setFilterAction(""); setFilterEntity(""); setDateFrom(""); setDateTo("");
    setPage(1);
    fetchLogs(1, "", "", "", "", "");
  };

  const hasFilters = search || filterAction || filterEntity || dateFrom || dateTo;
  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const renderJson = (obj: Record<string, any> | undefined | null, label: string) => {
    if (!obj || Object.keys(obj).length === 0) return null;
    return (
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          {Object.entries(obj).map(([k, v]) => (
            <div key={k} className="flex gap-2 text-sm py-0.5">
              <span className="font-medium text-gray-600 dark:text-gray-300 min-w-[120px]">{k}:</span>
              <span className="text-gray-800 dark:text-white/80 break-all">{typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <PageMeta title="Auditoría | Horizonte Plus" description="Registro de auditoría del sistema" />

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Auditoría</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Registro completo de todas las acciones del sistema
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <input
          className="h-11 w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder-gray-500"
          placeholder="Buscar en descripción..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <select
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
        >
          <option value="">Todas las acciones</option>
          {ACTION_LIST.map((a) => <option key={a} value={a}>{ACTION_LABEL[a] || a}</option>)}
        </select>
        <select
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          value={filterEntity}
          onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
        >
          <option value="">Todas las entidades</option>
          {ENTITY_LIST.map((e) => <option key={e} value={e}>{ENTITY_LABEL[e] || e}</option>)}
        </select>
        <input
          type="date"
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
        />
        <input
          type="date"
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
        />
        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-brand-500 dark:text-gray-400">Limpiar filtros</button>
        )}
      </div>

      {/* Results count */}
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Mostrando {total > 0 ? `${startItem}–${endItem}` : "0"} de {total} registros
      </p>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <span className="mb-3 text-4xl">📋</span>
            <p className="text-gray-400 dark:text-gray-500">
              {hasFilters ? "No se encontraron registros." : "No hay registros de auditoría."}
            </p>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Fecha</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Usuario</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Acción</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Entidad</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Request</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Descripción</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 w-16">Detalle</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="py-3 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell className="py-3">
                      {log.user ? (
                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{log.user.firstName} {log.user.lastName}</p>
                          <p className="text-gray-500 text-theme-xs dark:text-gray-400">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-theme-sm">Anónimo</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge size="sm" color={ACTION_COLOR[log.action] as any || "light"}>
                        {ACTION_LABEL[log.action] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {ENTITY_LABEL[log.entity] || log.entity}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 whitespace-nowrap">
                      {log.method || log.statusCode ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-theme-xs font-semibold text-gray-400">{log.method || ""}</span>
                          <span className="font-mono text-theme-xs text-gray-500 max-w-[150px] truncate" title={log.path ?? ""}>
                            {formatPath(log.path)}
                          </span>
                          {log.statusCode != null && (
                            <span className={`font-mono text-theme-xs font-bold ${statusColor(log.statusCode)}`}>
                              {log.statusCode}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-gray-300 max-w-xs truncate">
                      {log.description}
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      {(log.oldValues || log.newValues || log.method) ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          Ver
                        </button>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(1)} disabled={page <= 1} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">««</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">‹ Anterior</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">Siguiente ›</button>
            <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">»»</button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white/90">Detalle del registro</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(selectedLog.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>
            <div className="space-y-5 p-6">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Usuario</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {selectedLog.user ? `${selectedLog.user.firstName} ${selectedLog.user.lastName}` : "Anónimo"}
                  </p>
                  {selectedLog.user && <p className="text-xs text-gray-500 dark:text-gray-400">{selectedLog.user.email}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Acción</p>
                  <Badge size="sm" color={ACTION_COLOR[selectedLog.action] as any || "light"}>
                    {ACTION_LABEL[selectedLog.action] || selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Entidad</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">{ENTITY_LABEL[selectedLog.entity] || selectedLog.entity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID entidad</p>
                  <p className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">{selectedLog.entityId || "—"}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Descripción</p>
                <p className="text-sm text-gray-800 dark:text-white/90">{selectedLog.description}</p>
              </div>

              {/* Request HTTP */}
              {(selectedLog.method || selectedLog.path || selectedLog.statusCode != null) && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Request</p>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
                    {selectedLog.method && <span className="font-semibold text-gray-500 dark:text-gray-400">{selectedLog.method}</span>}
                    <span className="text-gray-800 dark:text-white/90 break-all">{selectedLog.path || "—"}</span>
                    {selectedLog.statusCode != null && (
                      <span className={`font-bold ${statusColor(selectedLog.statusCode)}`}>{selectedLog.statusCode}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Old vs New values side by side */}
              {(selectedLog.oldValues || selectedLog.newValues) && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {renderJson(selectedLog.oldValues, "Valores anteriores")}
                  {renderJson(selectedLog.newValues, "Valores nuevos")}
                </div>
              )}

              {/* IP & User Agent */}
              {(selectedLog.ipAddress || selectedLog.userAgent) && (
                <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedLog.ipAddress && <>IP: <span className="font-mono">{selectedLog.ipAddress}</span></>}
                    {selectedLog.ipAddress && selectedLog.userAgent && " · "}
                    {selectedLog.userAgent && <>UA: <span className="font-mono text-xs break-all">{selectedLog.userAgent.substring(0, 100)}</span></>}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
