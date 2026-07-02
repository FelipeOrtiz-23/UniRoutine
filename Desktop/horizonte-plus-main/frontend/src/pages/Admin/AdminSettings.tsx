import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { settingsApi } from "../../services/api";

type Setting = { key: string; value: string; description: string };

const SETTING_LABELS: Record<string, { label: string; type: "number" | "boolean" }> = {
  quiz_max_attempts: { label: "Intentos máximos por quiz", type: "number" },
  quiz_show_answers: { label: "Mostrar respuestas correctas al estudiante", type: "boolean" },
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    settingsApi.getAll().then(setSettings).finally(() => setLoading(false));
  }, []);

  const handleChange = async (key: string, value: string) => {
    setSaving(key);
    setSuccess(null);
    try {
      await settingsApi.update(key, value);
      setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
      setSuccess(key);
      setTimeout(() => setSuccess(null), 2000);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Configuración | Admin" description="" />
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Configuración de la plataforma
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Parámetros globales que afectan el comportamiento de la plataforma
        </p>
      </div>

      <div className="space-y-4">
        {settings.map((s) => {
          const meta = SETTING_LABELS[s.key];
          return (
            <div
              key={s.key}
              className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    {meta?.label || s.key}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.description}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">{s.key}</p>
                </div>
                <div className="flex items-center gap-3">
                  {meta?.type === "boolean" ? (
                    <button
                      onClick={() => handleChange(s.key, s.value === "true" ? "false" : "true")}
                      disabled={saving === s.key}
                      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        s.value === "true" ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                          s.value === "true" ? "translate-x-7" : "translate-x-0"
                        }`}
                      />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={s.value}
                        onChange={(e) =>
                          setSettings((prev) =>
                            prev.map((x) => (x.key === s.key ? { ...x, value: e.target.value } : x))
                          )
                        }
                        className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        onClick={() => handleChange(s.key, s.value)}
                        disabled={saving === s.key}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600 disabled:opacity-50"
                      >
                        {saving === s.key ? "..." : "Guardar"}
                      </button>
                    </div>
                  )}
                  {success === s.key && (
                    <span className="text-green-500 text-sm">✓</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
