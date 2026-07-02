import { useEffect, useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { landingApi, storageApi } from "../../services/api";
import {
  DEFAULT_LANDING,
  type BadgeColor,
  type LandingContent,
} from "../../types/landing";

/* ── Helpers de arreglo (mutan un draft clonado dentro de edit) ── */
function move<T>(arr: T[], from: number, to: number) {
  if (to < 0 || to >= arr.length) return;
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
}

/* ── Campos reutilizables ── */
function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </label>
  );
}

const MARKUP_HINT = "Formato: **negrita**, ==resaltado==, Enter = salto de línea";

function AreaField({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
      {hint && <span className="mt-1 block text-xs text-gray-400">{MARKUP_HINT}</span>}
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr(null);
    try {
      const { url } = await storageApi.upload(file, "landing");
      onChange(url);
    } catch (e: any) {
      setErr(e.message || "No se pudo subir");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <TextField
            label={label}
            value={value}
            onChange={onChange}
            placeholder="/images/landing/archivo.png o sube una imagen →"
          />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-brand-500 hover:text-brand-500 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
        >
          {uploading ? "Subiendo..." : "Subir"}
        </button>
      </div>
      {err && <span className="mt-1 block text-xs text-red-500">{err}</span>}
      {value && (
        <div className="mt-2 flex items-center gap-3">
          <img
            src={value}
            alt=""
            className="h-16 w-16 rounded-lg border border-gray-200 object-contain dark:border-gray-700"
          />
          <span className="text-xs text-gray-400">Vista previa</span>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 py-4"
      >
        <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="space-y-4 border-t border-gray-100 px-6 py-5 dark:border-gray-800">
          {children}
        </div>
      )}
    </div>
  );
}

function ItemRow({
  title,
  idx,
  len,
  onUp,
  onDown,
  onRemove,
  children,
}: {
  title: string;
  idx: number;
  len: number;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {title}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onUp}
            disabled={idx === 0}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700"
            aria-label="Subir"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onDown}
            disabled={idx === len - 1}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700"
            aria-label="Bajar"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            aria-label="Eliminar"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-brand-500 hover:text-brand-500 dark:border-gray-600"
    >
      + {label}
    </button>
  );
}

const BADGE_COLORS: BadgeColor[] = ["salmon", "cyan", "amber"];

export default function AdminLanding() {
  const [content, setContent] = useState<LandingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    landingApi
      .get()
      .then(setContent)
      .catch(() => setContent(DEFAULT_LANDING))
      .finally(() => setLoading(false));
  }, []);

  /* Editor inmutable: clona, muta el draft y reemplaza el estado */
  const edit = (mutator: (draft: LandingContent) => void) => {
    setSuccess(false);
    setContent((prev) => {
      if (!prev) return prev;
      const draft: LandingContent = structuredClone(prev);
      mutator(draft);
      return draft;
    });
  };

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const saved = await landingApi.update(content);
      setContent(saved);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const c = content;

  return (
    <>
      <PageMeta title="Landing (CMS) | Admin" description="" />

      {/* Encabezado + acciones */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Contenido del Landing
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Edita los textos e imágenes de la página de bienvenida pública.{" "}
            <a href="/" target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">
              Ver landing ↗
            </a>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {success && <span className="text-sm text-green-500">✓ Guardado</span>}
          {error && <span className="text-sm text-red-500">{error}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* ───── Navbar ───── */}
        <Section title="Navbar / Logo">
          <ImageField
            label="Logo"
            value={c.navbar.logo}
            onChange={(v) => edit((d) => (d.navbar.logo = v))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Botón (texto)"
              value={c.navbar.cta.label}
              onChange={(v) => edit((d) => (d.navbar.cta.label = v))}
            />
            <TextField
              label="Botón (ruta)"
              value={c.navbar.cta.to}
              onChange={(v) => edit((d) => (d.navbar.cta.to = v))}
            />
          </div>
          <div className="space-y-3">
            <span className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Enlaces del menú
            </span>
            {c.navbar.links.map((l, i) => (
              <ItemRow
                key={i}
                title={`Enlace ${i + 1}`}
                idx={i}
                len={c.navbar.links.length}
                onUp={() => edit((d) => move(d.navbar.links, i, i - 1))}
                onDown={() => edit((d) => move(d.navbar.links, i, i + 1))}
                onRemove={() => edit((d) => d.navbar.links.splice(i, 1))}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="Texto"
                    value={l.label}
                    onChange={(v) => edit((d) => (d.navbar.links[i].label = v))}
                  />
                  <TextField
                    label="Destino (#hero, /cursos…)"
                    value={l.href}
                    onChange={(v) => edit((d) => (d.navbar.links[i].href = v))}
                  />
                </div>
              </ItemRow>
            ))}
            <AddButton
              label="Agregar enlace"
              onClick={() => edit((d) => d.navbar.links.push({ label: "Nuevo", href: "#" }))}
            />
          </div>
        </Section>

        {/* ───── Hero ───── */}
        <Section title="Hero (sección principal)">
          <TextField
            label="Badge"
            value={c.hero.badge}
            onChange={(v) => edit((d) => (d.hero.badge = v))}
          />
          <AreaField
            label="Título"
            value={c.hero.title}
            onChange={(v) => edit((d) => (d.hero.title = v))}
            hint
          />
          <AreaField
            label="Párrafo"
            value={c.hero.paragraph}
            onChange={(v) => edit((d) => (d.hero.paragraph = v))}
            rows={4}
            hint
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="CTA principal (texto)"
              value={c.hero.primaryCta.label}
              onChange={(v) => edit((d) => (d.hero.primaryCta.label = v))}
            />
            <TextField
              label="CTA principal (ruta)"
              value={c.hero.primaryCta.to}
              onChange={(v) => edit((d) => (d.hero.primaryCta.to = v))}
            />
            <TextField
              label="CTA secundario (texto)"
              value={c.hero.secondaryCta.label}
              onChange={(v) => edit((d) => (d.hero.secondaryCta.label = v))}
            />
            <TextField
              label="CTA secundario (destino)"
              value={c.hero.secondaryCta.href}
              onChange={(v) => edit((d) => (d.hero.secondaryCta.href = v))}
            />
          </div>
          <div className="space-y-3">
            <span className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Imágenes del marquee
            </span>
            {c.hero.images.map((img, i) => (
              <ItemRow
                key={i}
                title={`Imagen ${i + 1}`}
                idx={i}
                len={c.hero.images.length}
                onUp={() => edit((d) => move(d.hero.images, i, i - 1))}
                onDown={() => edit((d) => move(d.hero.images, i, i + 1))}
                onRemove={() => edit((d) => d.hero.images.splice(i, 1))}
              >
                <ImageField
                  label="Ruta"
                  value={img}
                  onChange={(v) => edit((d) => (d.hero.images[i] = v))}
                />
              </ItemRow>
            ))}
            <AddButton
              label="Agregar imagen"
              onClick={() => edit((d) => d.hero.images.push("/images/landing/"))}
            />
          </div>
        </Section>

        {/* ───── ¿Qué ofrecemos? ───── */}
        <Section title="¿Qué ofrecemos?">
          <TextField
            label="Badge"
            value={c.offer.badge}
            onChange={(v) => edit((d) => (d.offer.badge = v))}
          />
          <AreaField
            label="Título"
            value={c.offer.title}
            onChange={(v) => edit((d) => (d.offer.title = v))}
            hint
          />
          <AreaField
            label="Párrafo"
            value={c.offer.paragraph}
            onChange={(v) => edit((d) => (d.offer.paragraph = v))}
            rows={4}
          />
          <ImageField
            label="Ilustración"
            value={c.offer.illustration}
            onChange={(v) => edit((d) => (d.offer.illustration = v))}
          />
          <div className="space-y-3">
            <span className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Tarjetas
            </span>
            {c.offer.cards.map((card, i) => (
              <ItemRow
                key={i}
                title={`Tarjeta ${i + 1}`}
                idx={i}
                len={c.offer.cards.length}
                onUp={() => edit((d) => move(d.offer.cards, i, i - 1))}
                onDown={() => edit((d) => move(d.offer.cards, i, i + 1))}
                onRemove={() => edit((d) => d.offer.cards.splice(i, 1))}
              >
                <AreaField
                  label="Título"
                  value={card.title}
                  onChange={(v) => edit((d) => (d.offer.cards[i].title = v))}
                  rows={2}
                  hint
                />
                <AreaField
                  label="Texto"
                  value={card.text}
                  onChange={(v) => edit((d) => (d.offer.cards[i].text = v))}
                />
              </ItemRow>
            ))}
            <AddButton
              label="Agregar tarjeta"
              onClick={() => edit((d) => d.offer.cards.push({ title: "", text: "" }))}
            />
          </div>
        </Section>

        {/* ───── ¿Qué vas a encontrar? (slider) ───── */}
        <Section title="¿Qué vas a encontrar? (slider)">
          <TextField
            label="Badge"
            value={c.find.badge}
            onChange={(v) => edit((d) => (d.find.badge = v))}
          />
          <AreaField
            label="Título"
            value={c.find.title}
            onChange={(v) => edit((d) => (d.find.title = v))}
            hint
          />
          <div className="space-y-3">
            <span className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Párrafos
            </span>
            {c.find.paragraphs.map((p, i) => (
              <ItemRow
                key={i}
                title={`Párrafo ${i + 1}`}
                idx={i}
                len={c.find.paragraphs.length}
                onUp={() => edit((d) => move(d.find.paragraphs, i, i - 1))}
                onDown={() => edit((d) => move(d.find.paragraphs, i, i + 1))}
                onRemove={() => edit((d) => d.find.paragraphs.splice(i, 1))}
              >
                <AreaField
                  label="Texto"
                  value={p}
                  onChange={(v) => edit((d) => (d.find.paragraphs[i] = v))}
                  hint
                />
              </ItemRow>
            ))}
            <AddButton
              label="Agregar párrafo"
              onClick={() => edit((d) => d.find.paragraphs.push(""))}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Enlace (texto)"
              value={c.find.ctaLabel}
              onChange={(v) => edit((d) => (d.find.ctaLabel = v))}
            />
            <TextField
              label="Enlace (ruta)"
              value={c.find.ctaTo}
              onChange={(v) => edit((d) => (d.find.ctaTo = v))}
            />
          </div>
          <div className="space-y-3">
            <span className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Tarjetas del slider
            </span>
            {c.find.cards.map((card, i) => (
              <ItemRow
                key={i}
                title={`Tarjeta ${i + 1}`}
                idx={i}
                len={c.find.cards.length}
                onUp={() => edit((d) => move(d.find.cards, i, i - 1))}
                onDown={() => edit((d) => move(d.find.cards, i, i + 1))}
                onRemove={() => edit((d) => d.find.cards.splice(i, 1))}
              >
                <ImageField
                  label="Imagen de fondo"
                  value={card.img}
                  onChange={(v) => edit((d) => (d.find.cards[i].img = v))}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="Badge"
                    value={card.badge}
                    onChange={(v) => edit((d) => (d.find.cards[i].badge = v))}
                  />
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">
                      Color del badge
                    </span>
                    <select
                      value={card.badgeColor}
                      onChange={(e) =>
                        edit((d) => (d.find.cards[i].badgeColor = e.target.value as BadgeColor))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      {BADGE_COLORS.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <AreaField
                  label="Título"
                  value={card.title}
                  onChange={(v) => edit((d) => (d.find.cards[i].title = v))}
                  rows={2}
                  hint
                />
                <AreaField
                  label="Texto"
                  value={card.text}
                  onChange={(v) => edit((d) => (d.find.cards[i].text = v))}
                />
              </ItemRow>
            ))}
            <AddButton
              label="Agregar tarjeta"
              onClick={() =>
                edit((d) =>
                  d.find.cards.push({
                    img: "/images/landing/",
                    badge: "",
                    badgeColor: "salmon",
                    title: "",
                    text: "",
                  }),
                )
              }
            />
          </div>
        </Section>

        {/* ───── Banner ───── */}
        <Section title="Banner (no es una carrera)">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Título — línea 1 (azul)"
              value={c.banner.titleLine1}
              onChange={(v) => edit((d) => (d.banner.titleLine1 = v))}
            />
            <TextField
              label="Título — línea 2"
              value={c.banner.titleLine2}
              onChange={(v) => edit((d) => (d.banner.titleLine2 = v))}
            />
          </div>
          <AreaField
            label="Párrafo"
            value={c.banner.paragraph}
            onChange={(v) => edit((d) => (d.banner.paragraph = v))}
            rows={4}
          />
          <ImageField
            label="Imagen"
            value={c.banner.image}
            onChange={(v) => edit((d) => (d.banner.image = v))}
          />
        </Section>

        {/* ───── FAQ ───── */}
        <Section title="FAQ + WhatsApp">
          <ImageField
            label="Imagen lateral"
            value={c.faq.image}
            onChange={(v) => edit((d) => (d.faq.image = v))}
          />
          <TextField
            label="Título"
            value={c.faq.title}
            onChange={(v) => edit((d) => (d.faq.title = v))}
          />
          <AreaField
            label="Párrafo"
            value={c.faq.paragraph}
            onChange={(v) => edit((d) => (d.faq.paragraph = v))}
          />
          <div className="space-y-3">
            <span className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Preguntas
            </span>
            {c.faq.items.map((item, i) => (
              <ItemRow
                key={i}
                title={`Pregunta ${i + 1}`}
                idx={i}
                len={c.faq.items.length}
                onUp={() => edit((d) => move(d.faq.items, i, i - 1))}
                onDown={() => edit((d) => move(d.faq.items, i, i + 1))}
                onRemove={() => edit((d) => d.faq.items.splice(i, 1))}
              >
                <TextField
                  label="Pregunta"
                  value={item.q}
                  onChange={(v) => edit((d) => (d.faq.items[i].q = v))}
                />
                <AreaField
                  label="Respuesta"
                  value={item.a}
                  onChange={(v) => edit((d) => (d.faq.items[i].a = v))}
                  rows={4}
                  hint
                />
              </ItemRow>
            ))}
            <AddButton
              label="Agregar pregunta"
              onClick={() => edit((d) => d.faq.items.push({ q: "", a: "" }))}
            />
          </div>
          <AreaField
            label="Texto WhatsApp"
            value={c.faq.whatsappText}
            onChange={(v) => edit((d) => (d.faq.whatsappText = v))}
            hint
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Botón WhatsApp (texto)"
              value={c.faq.whatsappCtaLabel}
              onChange={(v) => edit((d) => (d.faq.whatsappCtaLabel = v))}
            />
            <TextField
              label="URL WhatsApp (https://wa.me/57...)"
              value={c.faq.whatsappUrl}
              onChange={(v) => edit((d) => (d.faq.whatsappUrl = v))}
            />
          </div>
        </Section>

        {/* ───── Footer ───── */}
        <Section title="Footer">
          <ImageField
            label="Logo"
            value={c.footer.logo}
            onChange={(v) => edit((d) => (d.footer.logo = v))}
          />
          <div className="space-y-3">
            <span className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Enlaces
            </span>
            {c.footer.links.map((l, i) => (
              <ItemRow
                key={i}
                title={`Enlace ${i + 1}`}
                idx={i}
                len={c.footer.links.length}
                onUp={() => edit((d) => move(d.footer.links, i, i - 1))}
                onDown={() => edit((d) => move(d.footer.links, i, i + 1))}
                onRemove={() => edit((d) => d.footer.links.splice(i, 1))}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="Texto"
                    value={l.label}
                    onChange={(v) => edit((d) => (d.footer.links[i].label = v))}
                  />
                  <TextField
                    label="Destino"
                    value={l.href}
                    onChange={(v) => edit((d) => (d.footer.links[i].href = v))}
                  />
                </div>
              </ItemRow>
            ))}
            <AddButton
              label="Agregar enlace"
              onClick={() => edit((d) => d.footer.links.push({ label: "Nuevo", href: "#" }))}
            />
          </div>
        </Section>
      </div>

      {/* Acción inferior */}
      <div className="mt-6 flex items-center justify-end gap-3">
        {success && <span className="text-sm text-green-500">✓ Guardado</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </>
  );
}
