import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { paymentsApi } from "../../services/api";

type PaymentData = {
  id: string;
  amount: number;
  status: string;
  courseId: string;
  course?: { title: string };
  epaycoRefPayco?: string;
  epaycoTransactionId?: string;
  epaycoFranchise?: string;
  epaycoBankName?: string;
  epaycoApprovalCode?: string;
  epaycoTransactionState?: string;
  createdAt?: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  approved: { label: "Aprobado", color: "text-success-500 bg-success-50 dark:bg-success-500/15", icon: "✅" },
  rejected: { label: "Rechazado", color: "text-error-500 bg-error-50 dark:bg-error-500/15", icon: "❌" },
  pending: { label: "Procesando...", color: "text-warning-500 bg-warning-50 dark:bg-warning-500/15", icon: "⏳" },
  failed: { label: "Fallido", color: "text-error-500 bg-error-50 dark:bg-error-500/15", icon: "❌" },
};

export default function PaymentConfirmation() {
  const [params] = useSearchParams();
  const paymentId = params.get("paymentId");
  const refPayco = params.get("ref_payco");

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!paymentId) return;

    const init = async () => {
      try {
        // Step 1: Confirm and save ref_payco
        if (refPayco) {
          await paymentsApi.confirm(paymentId, refPayco);
        }
        // Step 2: Get initial status
        const data = await paymentsApi.getStatus(paymentId);
        setPayment(data);
        setLoading(false);

        // Step 3: Start polling if pending
        if (data.status === "pending") {
          startPolling(paymentId);
        }
      } catch {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [paymentId, refPayco]);

  const startPolling = (id: string) => {
    let count = 0;
    pollRef.current = setInterval(async () => {
      count++;
      setPollCount(count);

      if (count > 20) {
        // 60 seconds max
        if (pollRef.current) clearInterval(pollRef.current);
        return;
      }

      try {
        const data = await paymentsApi.getStatus(id);
        setPayment(data);
        if (data.status !== "pending") {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // ignore
      }
    }, 3000);
  };

  if (!paymentId) {
    return (
      <div className="flex flex-col items-center py-20">
        <span className="mb-3 text-5xl">⚠️</span>
        <p className="text-gray-500 dark:text-gray-400">No se encontró información del pago</p>
        <Link to="/cursos" className="mt-4 text-sm text-brand-500 hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="text-gray-500 dark:text-gray-400">Verificando tu pago...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center py-20">
        <span className="mb-3 text-5xl">😕</span>
        <p className="text-gray-500 dark:text-gray-400">No se pudo obtener la información del pago</p>
        <Link to="/cursos" className="mt-4 text-sm text-brand-500 hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[payment.status] || STATUS_MAP.pending;

  return (
    <>
      <PageMeta title="Confirmación de pago | Horizonte Plus" description="" />

      <div className="mx-auto max-w-lg">
        {/* Status card */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <span className="mb-4 block text-6xl">{statusInfo.icon}</span>

          <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            {payment.status === "approved"
              ? "¡Pago Exitoso!"
              : payment.status === "pending"
              ? "Procesando pago..."
              : "Pago no completado"}
          </h1>

          <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${statusInfo.color}`}>
            {statusInfo.label}
          </span>

          {payment.status === "pending" && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Verificando estado con ePayco... intento {pollCount}/20
            </p>
          )}

          {payment.status === "approved" && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Ya estás inscrito en el curso. ¡Puedes empezar a aprender!
            </p>
          )}
        </div>

        {/* Details */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Detalles del pago</h2>

          <div className="space-y-3">
            <DetailRow label="Curso" value={payment.course?.title || "—"} />
            <DetailRow label="Monto" value={`$${Number(payment.amount).toLocaleString("es-CO")}`} />
            <DetailRow label="Fecha" value={payment.createdAt ? new Date(payment.createdAt).toLocaleString("es-CO") : "—"} />
            {payment.epaycoFranchise && <DetailRow label="Franquicia" value={payment.epaycoFranchise} />}
            {payment.epaycoBankName && <DetailRow label="Banco" value={payment.epaycoBankName} />}
            {payment.epaycoTransactionId && <DetailRow label="Nº Transacción" value={payment.epaycoTransactionId} />}
            {payment.epaycoRefPayco && <DetailRow label="Ref. ePayco" value={payment.epaycoRefPayco} />}
            {payment.epaycoApprovalCode && <DetailRow label="Código aprobación" value={payment.epaycoApprovalCode} />}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          {payment.status === "approved" && (
            <Link
              to={`/curso/${payment.courseId}/aprender`}
              className="flex w-full items-center justify-center rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              🎓 Ir al curso
            </Link>
          )}
          <Link
            to="/cursos"
            className="flex w-full items-center justify-center rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-700 dark:text-gray-200">{value}</span>
    </div>
  );
}
