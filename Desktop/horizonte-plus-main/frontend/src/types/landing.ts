/**
 * Tipos y contenido por defecto del landing.
 *
 * El contenido real se sirve desde el backend (GET /landing). Este DEFAULT_LANDING
 * es el fallback usado mientras carga o si la petición falla, para que el landing
 * nunca se vea vacío.
 *
 * Mini-sintaxis de texto enriquecido (ver <RichText> en Landing.tsx):
 *   **negrita**   -> <strong>
 *   ==resaltado== -> pill ámbar con texto azul
 *   salto de línea -> <br>
 */

export type BadgeColor = "salmon" | "cyan" | "amber";

export interface NavLink {
  label: string;
  href: string;
}

export interface ValueCard {
  title: string;
  text: string;
}

export interface SliderCard {
  img: string;
  badge: string;
  badgeColor: BadgeColor;
  title: string;
  text: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface LandingContent {
  navbar: {
    logo: string;
    links: NavLink[];
    cta: { label: string; to: string };
  };
  hero: {
    badge: string;
    title: string;
    paragraph: string;
    primaryCta: { label: string; to: string };
    secondaryCta: { label: string; href: string };
    images: string[];
  };
  offer: {
    badge: string;
    title: string;
    paragraph: string;
    illustration: string;
    cards: ValueCard[];
  };
  find: {
    badge: string;
    title: string;
    paragraphs: string[];
    ctaLabel: string;
    ctaTo: string;
    cards: SliderCard[];
  };
  banner: {
    titleLine1: string;
    titleLine2: string;
    paragraph: string;
    image: string;
  };
  faq: {
    image: string;
    title: string;
    paragraph: string;
    items: FaqItem[];
    whatsappText: string;
    whatsappCtaLabel: string;
    whatsappUrl: string;
  };
  footer: {
    logo: string;
    links: NavLink[];
  };
}

export const DEFAULT_LANDING: LandingContent = {
  navbar: {
    logo: "/images/landing/Logo300x.png",
    links: [
      { label: "Home", href: "#hero" },
      { label: "Cursos", href: "#cursos" },
      { label: "FAQ", href: "#faq" },
    ],
    cta: { label: "Ingresar", to: "/signin" },
  },

  hero: {
    badge: "Aprende lo que necesitas",
    title: "Construye **tu futuro,**\nCrece **rápido,** avanza **hoy.**",
    paragraph:
      "Horizonte+ es la plataforma de **educación continua** de la Fundación Universitaria Horizonte. Cursos cortos, diplomados y formaciones especializadas, no son carreras profesionales: son herramientas prácticas para avanzar en tu trabajo, cambiar de rumbo o aprender algo nuevo hoy.",
    primaryCta: { label: "Ver cursos disponibles", to: "/cursos" },
    secondaryCta: { label: "¿Cómo funciona?", href: "#que-ofrecemos" },
    images: [
      "/images/landing/Hero-img-1.png",
      "/images/landing/Hero-img-2.png",
      "/images/landing/Hero-img-3.png",
      "/images/landing/Hero-img-4.png",
      "/images/landing/Hero-img-5.png",
      "/images/landing/Hero-img-6.png",
    ],
  },

  offer: {
    badge: "¿Qué ofrecemos?",
    title: "Tu Experiencia de Aprendizaje con ==Horizonte Plus==",
    paragraph:
      "Transforma tu futuro con una metodología diseñada para adaptarse a tu vida. Descubre una forma práctica y flexible de adquirir las habilidades que el mercado laboral exige hoy mismo para alcanzar tu máximo potencial.",
    illustration: "/images/landing/Ilustracion.png",
    cards: [
      {
        title: "100% cursos,\n0% carreras",
        text: "Olvídate de matrícula semestral, horarios rígidos o años de compromiso. Cada curso es autocontenido y te entrega un conocimiento concreto.",
      },
      {
        title: "A tu ritmo, desde\ncualquier lugar",
        text: "Videos, lecturas y evaluaciones disponibles 24/7. Avanzas cuando puedas, pausas cuando necesites, retomas donde quedaste.",
      },
      {
        title: "Certificado al **finalizar**",
        text: "Al completar un curso o diplomado recibes un certificado con código de validación pública que puedes compartir en LinkedIn.",
      },
    ],
  },

  find: {
    badge: "¿Qué vas a encontrar?",
    title: "Formación práctica\npara el **MUNDO REAL**",
    paragraphs: [
      "En Horizonte+ encuentras **solo cursos y diplomados** — nada de programas universitarios largos. Nuestra oferta está pensada para quienes ya trabajan, están estudiando algo más, o simplemente quieren sumar una habilidad puntual sin pausar su vida.",
      "Desde **Excel avanzado** y **Marketing digital**, hasta **Investigación de accidentes laborales**, **Inteligencia Artificial generativa** o **Contabilidad financiera**.",
    ],
    ctaLabel: "Explorar catálogo completo →",
    ctaTo: "/cursos",
    cards: [
      {
        img: "/images/landing/Group-19.png",
        badge: "Cursos",
        badgeColor: "salmon",
        title: "Diseñados por especialistas",
        text: "Que trabajan en el área que enseñan.",
      },
      {
        img: "/images/landing/Group-20.png",
        badge: "Módulos",
        badgeColor: "cyan",
        title: "4 a 12 semanas",
        text: "Que prioriza la agilidad sobre los planes de estudio extensos, permitiéndote dominar habilidades críticas y aplicarlas de inmediato.",
      },
      {
        img: "/images/landing/Group-21.png",
        badge: "Ofertamos",
        badgeColor: "salmon",
        title: "Variedad\nde opciones",
        text: "Desde cursos gratuitos hasta diplomados certificados por la Fundación.",
      },
      {
        img: "/images/landing/Group-25.png",
        badge: "Cursos",
        badgeColor: "amber",
        title: "Diseñados por especialistas",
        text: "Que trabajan en el área que enseñan.",
      },
    ],
  },

  banner: {
    titleLine1: "Horizonte Plus",
    titleLine2: "No es una carrera universitaria",
    paragraph:
      "Si buscas un pregrado o posgrado, visita el portal principal de la Fundación Universitaria Horizonte. Aquí encuentras formación continua: cursos, diplomados y capacitaciones cortas que complementan o impulsan lo que ya sabes.",
    image: "/images/landing/Banner.png",
  },

  faq: {
    image: "/images/landing/Recurso-8300x.png",
    title: "¿Preguntas? ¿Dudas?",
    paragraph:
      "Estamos aquí para acompañar tu proceso de aprendizaje. Escríbenos y resolvamos tus preguntas juntos.",
    items: [
      {
        q: "¿Recibo un título profesional?",
        a: "No. Horizonte+ entrega certificados de curso o diplomado, no títulos académicos de pregrado o posgrado.",
      },
      {
        q: "¿Cuánto dura un curso?",
        a: "Cada curso está diseñado para adaptarse a tu propio ritmo. En promedio, tienen una duración de **4 a 6 semanas** (dedicando entre 3 y 5 horas semanales), pero tendrás acceso a la plataforma de forma continua para que avances según tu disponibilidad.",
      },
      {
        q: "¿Tengo clases en vivo?",
        a: "**No, las clases están 100% grabadas** en video de alta calidad para que las veas cuando quieras. Sin embargo, contarás con espacios de mentoría programados, foros de discusión y sesiones de resolución de dudas en vivo con expertos del sector de manera periódica.",
      },
      {
        q: "¿Sirve para mi hoja de vida?",
        a: "**Totalmente.** Aunque no es un título profesional regulado, los certificados de Horizonte+ validan competencias técnicas y habilidades prácticas específicas de alta demanda laboral, lo cual demuestra a los reclutadores tu actualización constante y proactividad profesional.",
      },
    ],
    whatsappText:
      "**¡Hablemos por WhatsApp!** Estamos listos para ayudarte a elegir tu próximo curso ahora mismo.",
    whatsappCtaLabel: "Escríbenos",
    whatsappUrl: "https://wa.me/",
  },

  footer: {
    logo: "/images/landing/Recurso-5300x.png",
    links: [
      { label: "Home", href: "#hero" },
      { label: "Cursos", href: "#cursos" },
      { label: "FAQ", href: "#faq" },
    ],
  },
};
