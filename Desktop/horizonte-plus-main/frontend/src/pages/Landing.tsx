import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { landingApi } from "../services/api";
import { DEFAULT_LANDING, type BadgeColor, type LandingContent } from "../types/landing";

/* Reveal: anima (fade + slide-up) al entrar en viewport. Solo clases Tailwind.
   Respeta prefers-reduced-motion. Replica el "scroll into view" del diseño Webflow. */
function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

/* RichText: renderiza la mini-sintaxis editable desde el CMS.
   **negrita** -> <strong>, ==resaltado== -> pill ámbar, salto de línea -> <br>.
   No usa HTML crudo: tokeniza con regex y emite nodos React seguros. */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|==[^=]+==)/g;
  let lastIndex = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) nodes.push(text.slice(lastIndex, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-extrabold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <span
          key={key++}
          className="rounded-[20px] bg-hz-amber px-6 font-extrabold text-hz-blue"
        >
          {token.slice(2, -2)}
        </span>,
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function RichText({ text }: { text: string }) {
  const lines = (text ?? "").split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {renderInline(line)}
        </Fragment>
      ))}
    </>
  );
}

/* Imágenes decorativas del diseño que se mantienen fijas en código */
const IMG = "/images/landing";

/* Clases del badge de cada tarjeta del slider, según color elegido en el CMS */
const BADGE_CLASSES: Record<BadgeColor, string> = {
  salmon: "bg-hz-salmon text-white font-medium",
  cyan: "bg-hz-cyan text-white font-semibold",
  amber: "bg-hz-amber text-hz-blue font-semibold",
};

/* Chevron del acordeón FAQ (mismo SVG del diseño) */
function FaqArrow({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 27 13"
      fill="none"
      className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.3332 2.35784L21 9.27181L19.3336 11L13.5 4.95012L7.6664 11L6 9.27181L12.6668 2.35784C12.8878 2.12872 13.1875 2 13.5 2C13.8125 2 14.1122 2.12872 14.3332 2.35784Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* Flecha del slider de cursos (mismo SVG del diseño) */
function SliderArrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
      {dir === "left" ? (
        <path
          d="M3.31066 8.75001L9.03033 14.4697L7.96967 15.5303L0.439339 8.00001L7.96967 0.469676L9.03033 1.53034L3.31066 7.25001L15.5 7.25L15.5 8.75L3.31066 8.75001Z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M12.6893 7.25L6.96967 1.53033L8.03033 0.469666L15.5607 8L8.03033 15.5303L6.96967 14.4697L12.6893 8.75H0.5V7.25H12.6893Z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}

export default function Landing() {
  const [c, setC] = useState<LandingContent>(DEFAULT_LANDING);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  // Carga el contenido editable desde el backend; si falla, queda el fallback.
  useEffect(() => {
    landingApi.get().then(setC).catch(() => {});
  }, []);

  // Slider de cursos
  const trackRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);

  const sliderCards = c.find.cards;
  const heroImgs = c.hero.images;

  const goToCard = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const idx = Math.max(0, Math.min(sliderCards.length - 1, i));
    const card = track.children[idx] as HTMLElement | undefined;
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
  };

  const onTrackScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    let nearest = 0;
    let best = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const d = Math.abs((child as HTMLElement).offsetLeft - track.offsetLeft - track.scrollLeft);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setSlide(nearest);
  };

  return (
    <div className="font-inter bg-white text-gray-800 dark:bg-gray-950 dark:text-gray-200">
      {/* ===== Navbar ===== */}
      <header className="fixed inset-x-0 top-0 z-40 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] dark:bg-gray-900">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-2">
          <Link to="/" className="shrink-0">
            <img src={c.navbar.logo} alt="Horizonte+" className="w-40" loading="lazy" />
          </Link>

          {/* Links desktop */}
          <nav className="hidden items-center gap-5 lg:flex">
            {c.navbar.links.map((l, i) => (
              <a
                key={i}
                href={l.href}
                className="text-sm font-medium text-gray-700 hover:text-hz-blue dark:text-gray-300"
              >
                {l.label}
              </a>
            ))}
            <Link
              to={c.navbar.cta.to}
              className="rounded-[10px] bg-hz-blue px-10 py-2.5 text-base text-white transition-colors hover:bg-hz-blue-dark"
            >
              {c.navbar.cta.label}
            </Link>
          </nav>

          {/* Botón móvil */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-hz-blue lg:hidden"
            aria-label="Menú"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {/* Menú móvil desplegable */}
        {menuOpen && (
          <div className="border-t border-gray-100 bg-white px-5 py-4 lg:hidden dark:border-gray-800 dark:bg-gray-900">
            <nav className="flex flex-col gap-3">
              {c.navbar.links.map((l, i) => (
                <a
                  key={i}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2">
                <Link
                  to={c.navbar.cta.to}
                  className="block rounded-[10px] bg-hz-blue px-4 py-2.5 text-center text-base text-white"
                >
                  {c.navbar.cta.label}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ===== Hero ===== */}
      <section
        id="hero"
        className="relative flex min-h-screen items-center overflow-hidden bg-hz-gray px-5 pt-28 pb-10 dark:bg-gray-950"
      >
        <img
          src={`${IMG}/Linea-amarilla.png`}
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 w-[150px] pt-20 pr-6"
        />
        <div className="mx-auto grid w-full max-w-[1200px] items-center gap-9 lg:grid-cols-2">
          {/* Texto */}
          <Reveal className="flex flex-col gap-4 text-center lg:text-left">
            <div className="self-center rounded-[20px] bg-white px-11 py-2 shadow-sm lg:self-start dark:bg-gray-900">
              <span className="text-[17px] font-semibold text-hz-blue">{c.hero.badge}</span>
            </div>
            <h1 className="text-[40px] font-medium leading-[1.1] tracking-tight text-hz-blue sm:text-5xl lg:text-[54px] dark:text-blue-300">
              <RichText text={c.hero.title} />
            </h1>
            <p className="text-base text-gray-700 sm:text-lg dark:text-gray-300">
              <RichText text={c.hero.paragraph} />
            </p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                to={c.hero.primaryCta.to}
                className="rounded-[10px] bg-hz-blue px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-hz-cyan"
              >
                {c.hero.primaryCta.label}
              </Link>
              <a
                href={c.hero.secondaryCta.href}
                className="rounded-[10px] border border-hz-blue bg-white px-10 py-3.5 text-base font-semibold text-hz-blue transition-colors hover:bg-hz-amber dark:bg-transparent"
              >
                {c.hero.secondaryCta.label}
              </a>
            </div>
          </Reveal>

          {/* Marquee de imágenes */}
          <div className="relative hidden h-[600px] items-center justify-center gap-3 overflow-hidden lg:flex">
            <div className="absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-hz-gray to-transparent dark:from-gray-950" />
            <div className="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-hz-gray to-transparent dark:from-gray-950" />
            <div className="flex animate-[hz-marquee-up_30s_linear_infinite] flex-col gap-5">
              {[...heroImgs, ...heroImgs].map((src, i) => (
                <img key={`a${i}`} src={src} alt="" aria-hidden className="w-44 rounded-2xl" loading="lazy" />
              ))}
            </div>
            <div className="flex animate-[hz-marquee-down_30s_linear_infinite] flex-col gap-5">
              {[...heroImgs, ...heroImgs].reverse().map((src, i) => (
                <img key={`b${i}`} src={src} alt="" aria-hidden className="w-44 rounded-2xl" loading="lazy" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== ¿Qué ofrecemos? ===== */}
      <section
        id="que-ofrecemos"
        className="relative overflow-hidden bg-white py-24 dark:bg-gray-900"
      >
        <img
          src={`${IMG}/Ciculo-azul.png`}
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 hidden w-40 lg:block"
        />
        <div className="mx-auto max-w-[1200px] px-5">
          <Reveal className="max-w-4xl">
            <div className="w-[200px] rounded-[20px] bg-hz-blue py-2 text-center">
              <span className="font-medium text-white">{c.offer.badge}</span>
            </div>
            <h2 className="mt-6 text-[28px] font-bold text-gray-900 sm:text-[33px] dark:text-white">
              <RichText text={c.offer.title} />
            </h2>
            <p className="mt-5 text-base text-gray-600 sm:text-lg dark:text-gray-300">
              <RichText text={c.offer.paragraph} />
            </p>
          </Reveal>

          <div className="mt-14 grid items-center gap-10 lg:grid-cols-[0.75fr_1fr]">
            <Reveal>
              <img
                src={c.offer.illustration}
                alt="Ilustración de aprendizaje"
                className="mx-auto w-full max-w-md"
                loading="lazy"
              />
            </Reveal>
            <div className="flex flex-col gap-5">
              {c.offer.cards.map((card, i) => (
                <Reveal key={i} delay={i * 120}>
                  <div className="group flex flex-col items-center gap-3 rounded-2xl border-[1.5px] border-hz-cyan px-7 py-6 transition-transform duration-300 hover:-rotate-1 hover:bg-hz-blue sm:flex-row sm:justify-between sm:gap-5">
                    <h3 className="min-w-[140px] self-center text-center text-lg font-semibold leading-tight text-gray-900 group-hover:text-white sm:text-left dark:text-white">
                      <RichText text={card.title} />
                    </h3>
                    <p className="self-center text-center text-base leading-snug text-gray-600 group-hover:text-white sm:text-left dark:text-gray-300">
                      {card.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== ¿Qué vas a encontrar? (slider) ===== */}
      <section id="cursos" className="bg-hz-gray py-24 dark:bg-gray-950">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 lg:grid-cols-2">
          {/* Texto */}
          <Reveal className="flex flex-col gap-4">
            <div className="w-fit rounded-[20px] bg-hz-amber px-6 py-2">
              <span className="text-[18px] font-semibold text-hz-blue">{c.find.badge}</span>
            </div>
            <h2 className="text-3xl font-semibold text-hz-blue sm:text-4xl dark:text-blue-300">
              <RichText text={c.find.title} />
            </h2>
            {c.find.paragraphs.map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                <RichText text={p} />
              </p>
            ))}
            <Link
              to={c.find.ctaTo}
              className="mt-2 w-fit text-[18px] font-bold text-hz-blue hover:underline dark:text-blue-300"
            >
              {c.find.ctaLabel}
            </Link>
          </Reveal>

          {/* Slider de tarjetas */}
          <div className="relative">
            <div
              ref={trackRef}
              onScroll={onTrackScroll}
              className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-20"
            >
              {sliderCards.map((card, i) => (
                <div
                  key={i}
                  className="relative aspect-[492/911] w-[270px] min-w-[270px] shrink-0 snap-start"
                >
                  <img
                    src={card.img}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full rounded-[10px] object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex flex-col gap-2 p-7">
                    <div
                      className={`w-[100px] rounded-[20px] px-2 py-1.5 text-center ${
                        BADGE_CLASSES[card.badgeColor] ?? BADGE_CLASSES.salmon
                      }`}
                    >
                      {card.badge}
                    </div>
                    <h3 className="text-[30px] font-extrabold leading-[30px] text-gray-900">
                      <RichText text={card.title} />
                    </h3>
                    <p className="text-[15px] leading-[18px] text-gray-700">{card.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Flechas y paginación */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between">
              {/* Puntos */}
              <div className="flex items-center gap-2">
                {sliderCards.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Ir a la tarjeta ${i + 1}`}
                    onClick={() => goToCard(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      slide === i ? "w-6 bg-hz-blue" : "w-2.5 bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
              {/* Flechas */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Anterior"
                  onClick={() => goToCard(slide - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#585858] text-[#585858] transition-colors hover:bg-[#d5d1c9] dark:border-gray-500 dark:text-gray-400"
                >
                  <SliderArrow dir="left" />
                </button>
                <button
                  type="button"
                  aria-label="Siguiente"
                  onClick={() => goToCard(slide + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#585858] text-[#585858] transition-colors hover:bg-[#d5d1c9] dark:border-gray-500 dark:text-gray-400"
                >
                  <SliderArrow dir="right" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Banner distinción ===== */}
      <section className="flex min-h-[70vh] items-center justify-center bg-white px-5 py-16 dark:bg-gray-900">
        <Reveal className="mx-auto flex max-w-[940px] flex-col items-center gap-5 text-center">
          <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-[28px] dark:text-white">
            <span className="text-[25px] text-hz-blue">{c.banner.titleLine1}</span>
            <br />
            {c.banner.titleLine2}
          </h2>
          <p className="max-w-2xl text-base text-[#656565] dark:text-gray-400">{c.banner.paragraph}</p>
          <img src={c.banner.image} alt="Horizonte Plus" className="w-full max-w-3xl" loading="lazy" />
        </Reveal>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="grid lg:grid-cols-2">
        <Reveal className="flex items-center justify-center bg-hz-amber p-10">
          <img src={c.faq.image} alt="" aria-hidden className="w-full max-w-[700px]" loading="lazy" />
        </Reveal>
        <div className="bg-hz-gray px-6 py-14 sm:px-12 lg:px-20 dark:bg-gray-950">
          <div className="mx-auto flex max-w-[550px] flex-col gap-1">
            <h2 className="text-[28px] font-extrabold leading-tight text-hz-blue sm:text-[32px] dark:text-blue-300">
              {c.faq.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{c.faq.paragraph}</p>

            <div className="mt-5 flex flex-col gap-4">
              {c.faq.items.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={i}
                    className={`rounded-lg border-[1.5px] border-hz-blue px-6 py-4 transition-colors ${
                      open ? "bg-hz-blue" : "bg-transparent"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <span
                        className={`text-[15px] font-semibold ${
                          open ? "text-white" : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {item.q}
                      </span>
                      <span className={open ? "text-white" : "text-hz-blue dark:text-blue-300"}>
                        <FaqArrow open={open} />
                      </span>
                    </button>
                    {open && (
                      <p className="mt-3 text-sm leading-relaxed text-white/90">
                        <RichText text={item.a} />
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <RichText text={c.faq.whatsappText} />
              </p>
              <a
                href={c.faq.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-md bg-hz-cyan px-8 py-2.5 font-medium text-white transition-colors hover:bg-hz-blue"
              >
                {c.faq.whatsappCtaLabel}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="flex min-h-[30vh] flex-col items-center justify-between gap-8 bg-hz-blue px-8 py-12 sm:flex-row sm:px-16 lg:px-24">
        <img src={c.footer.logo} alt="Horizonte+" className="w-[300px] max-w-full" loading="lazy" />
        <nav className="flex flex-col items-center gap-3 sm:items-start sm:pr-16 lg:pr-32">
          {c.footer.links.map((l, i) => (
            <a
              key={i}
              href={l.href}
              className="text-base text-white transition-colors hover:text-hz-amber"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
