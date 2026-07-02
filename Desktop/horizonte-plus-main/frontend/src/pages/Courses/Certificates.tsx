import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { certificatesApi, Certificate } from "../../services/api";

export default function Certificates() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { certificatesApi.my().then(setCerts).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <>
      <PageMeta title="Certificados | Horizonte Plus" description="" />
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Mis certificados</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Certificados obtenidos al completar cursos</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>
      ) : certs.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white py-20 dark:border-gray-800 dark:bg-white/[0.03]">
          <span className="mb-3 text-5xl">🎓</span>
          <p className="text-gray-500 dark:text-gray-400">Completa cursos al 100% para obtener certificados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {certs.map((cert) => (
            <div key={cert.id} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-success-50 to-brand-50 dark:from-success-500/10 dark:to-brand-500/10">
                <span className="text-5xl">🎓</span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white/90">{cert.course?.title || "Curso"}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Emitido el {new Date(cert.issuedAt).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}</p>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                <span className="text-xs text-gray-400 dark:text-gray-500">Código:</span>
                <span className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300">{cert.code}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
