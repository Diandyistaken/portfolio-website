"use client";

import Image from "next/image";
import {
  animate,
  m,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  useVelocity,
} from "framer-motion";
import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Lightbox } from "./Lightbox";
import { SectionHeading } from "./SectionHeading";
import { RevealGroup, revealItem } from "./Reveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useSpotlight } from "@/lib/useSpotlight";
import { useTilt3D } from "@/lib/useTilt3D";
import { usePerfLite } from "./SectionBackdrop";
import { CONTAINER } from "@/lib/layout";

const EVIDENCE_KEY = "mm-evidence-v1";

function Pipeline({ labels }: { labels: string[] }) {
  const reducedMotion = useReducedMotion();
  return (
    <svg viewBox="0 0 900 210" role="img" aria-label={labels.join(" → ")} className="h-auto w-full">
      <defs><marker id="pipeline-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="rgb(var(--accent-rgb))" /></marker></defs>
      {labels.slice(0, -1).map((_, index) => (
        <m.path key={index} d={`M${130 + index * 170} 105H${240 + index * 170}`} fill="none" stroke="rgb(var(--accent-rgb))" strokeOpacity=".65" strokeWidth="2" strokeDasharray="8 8" markerEnd="url(#pipeline-arrow)" initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.55, delay: index * 0.14 }} />
      ))}
      {labels.map((label, index) => (
        <m.g key={label} initial={reducedMotion ? false : { opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.35, delay: index * 0.14 }}>
          <rect x={25 + index * 170} y="68" width="105" height="74" rx="7" fill="rgb(var(--surface))" stroke="rgb(var(--accent-rgb))" strokeOpacity=".7" />
          <circle cx={48 + index * 170} cy="92" r="5" fill="rgb(var(--accent-rgb))" />
          <text x={77 + index * 170} y="112" textAnchor="middle" fill="var(--foreground)" fontSize="14" fontFamily="monospace">{label}</text>
          <text x={77 + index * 170} y="132" textAnchor="middle" fill="var(--muted)" fontSize="9" fontFamily="monospace">0{index + 1}</text>
        </m.g>
      ))}
    </svg>
  );
}

/**
 * One showcase screenshot with the full forensic treatment stacked on top of
 * each other, all scrub/proximity-driven:
 * #96 diagonal mask sweep tied to scroll progress (re-seals scrolling back),
 * #62 spring entrance whose overshoot scales with live scroll velocity,
 * #95 exit de-rez — a coarse mosaic + brightness dip as it leaves the view,
 * #33 proximity declassify — grayscale until the cursor closes in (--prox),
 * #52 magnifier scan lens — a radial zoom lens riding the cursor,
 * #97 a persistent ANALYZED stamp once the image was opened in the lightbox.
 */
function ShowcaseImage({
  src,
  alt,
  wrapperClassName,
  buttonClassName,
  imageClassName,
  analyzed,
  onOpen,
}: {
  src: string;
  alt: string;
  wrapperClassName: string;
  buttonClassName: string;
  imageClassName: string;
  analyzed: boolean;
  onOpen: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const isStatic = reducedMotion || perfLite;
  const ref = useRef<HTMLDivElement>(null);

  // #62 mass-coupled entrance: read scroll velocity the moment the image
  // enters view and pick the spring damping from it — fast scroll = boing.
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const entryScale = useMotionValue(isStatic ? 1 : 0.9);
  useEffect(() => {
    if (isStatic) {
      entryScale.set(1);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        const speed = Math.abs(scrollVelocity.get());
        const damping = speed > 1800 ? 8 : speed > 700 ? 12 : 20;
        animate(entryScale, 1, { type: "spring", stiffness: 250, damping });
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isStatic, entryScale, scrollVelocity]);

  // #96 diagonal mask sweep, scrubbed by this element's own scroll progress
  const { scrollYProgress: revealProgress } = useScroll({
    target: ref,
    offset: ["start 0.98", "start 0.55"],
  });
  const maskX1 = useTransform(revealProgress, [0, 1], [9, 132]);
  const maskX2 = useTransform(revealProgress, [0, 1], [-24, 102]);
  const clipPath = useMotionTemplate`polygon(0% 0%, ${maskX1}% 0%, ${maskX2}% 100%, 0% 100%)`;

  // #95 exit de-rez: mosaic + brightness dip as the image scrolls out the top
  const { scrollYProgress: exitProgress } = useScroll({
    target: ref,
    offset: ["end 0.5", "end 0.1"],
  });
  const mosaicOpacity = useTransform(exitProgress, [0, 1], [0, 0.92]);
  const brightness = useTransform(exitProgress, [0, 1], [1, 0.5]);
  const exitFilter = useMotionTemplate`brightness(${brightness})`;

  // #52 lens position vars (cheap string writes inside the event handler)
  const onLensMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isStatic) return;
    const el = event.currentTarget;
    const bounds = el.getBoundingClientRect();
    el.style.setProperty("--lx", `${(((event.clientX - bounds.left) / bounds.width) * 100).toFixed(1)}%`);
    el.style.setProperty("--ly", `${(((event.clientY - bounds.top) / bounds.height) * 100).toFixed(1)}%`);
  };

  return (
    <m.div ref={ref} className={wrapperClassName} style={isStatic ? undefined : { clipPath }}>
      <m.div style={isStatic ? undefined : { scale: entryScale, filter: exitFilter }}>
        <button
          type="button"
          aria-label={alt}
          onClick={onOpen}
          onMouseMove={onLensMove}
          data-prox
          data-prox-radius="240"
          className={`prox-declassify relative block w-full ${buttonClassName}`}
        >
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={750}
            sizes="(min-width: 2400px) 60rem, (min-width: 1024px) 50vw, calc(100vw - 3rem)"
            className={imageClassName}
          />
          {!isStatic && (
            <span
              aria-hidden="true"
              className="scan-lens rounded-md"
              style={{ "--lens-img": `url(${src})` } as React.CSSProperties}
            />
          )}
          {!isStatic && (
            <m.span
              aria-hidden="true"
              className="pixel-mosaic pointer-events-none absolute inset-0 rounded-md"
              style={{ opacity: mosaicOpacity }}
            />
          )}
          {analyzed && (
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 z-10 rotate-3 rounded border border-accent/70 bg-background/75 px-1.5 py-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] text-accent"
            >
              ANALYZED
            </span>
          )}
        </button>
      </m.div>
    </m.div>
  );
}

function ShowcaseCard({
  item,
  pipeline,
  analyzed,
  onOpenScreenshot,
}: {
  item: ReturnType<typeof useLanguage>["t"]["showcase"]["items"][number];
  pipeline: string[];
  analyzed: string[];
  onOpenScreenshot: (index: number) => void;
}) {
  const spotlight = useSpotlight<HTMLDivElement>();
  const tilt = useTilt3D<HTMLElement>();
  return (
    <m.article {...tilt.handlers} style={tilt.motionStyle} variants={revealItem} onMouseMove={spotlight.onMouseMove} data-prox data-prox-radius="360" className="spotlight-card prox-heat group relative min-w-0 overflow-hidden rounded-lg border border-foreground/10 bg-[rgb(var(--surface)/0.92)] p-6 transition-[border-color,box-shadow] hover:border-accent/35 hover:shadow-[0_18px_48px_rgb(var(--accent-rgb)/0.1)] sm:p-8 3xl:p-10">
      <div className="spotlight-overlay" aria-hidden="true" />
      <div className="relative z-10 [transform:translateZ(18px)]">
        <span className="inline-flex items-center gap-2 rounded-sm border border-accent/30 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-accent"><span className="h-1.5 w-1.5 bg-accent" />{item.badge}</span>
        <h3 className="font-display mt-5 text-2xl font-semibold tracking-tight">{item.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{item.description}</p>
        {item.id === "platform" ? (
          <div className="relative mt-8 aspect-[16/10]">
            <ShowcaseImage
              src="/showcase/platform-2.webp"
              alt={item.alt}
              wrapperClassName="absolute inset-x-4 top-0 w-[calc(100%-2rem)]"
              buttonClassName="focal-zoom cursor-zoom-in rounded-md transition-transform duration-300 hover:scale-[1.04] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transform-none"
              imageClassName="w-full rounded-md border border-foreground/10 object-cover opacity-55"
              analyzed={analyzed.includes("/showcase/platform-2.webp")}
              onOpen={() => onOpenScreenshot(1)}
            />
            <ShowcaseImage
              src="/showcase/platform-1.webp"
              alt={item.alt}
              wrapperClassName="absolute inset-x-0 top-5 w-full"
              buttonClassName="focal-zoom cursor-zoom-in rounded-md transition-transform duration-500 hover:scale-[1.04] hover:brightness-110 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:-rotate-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transform-none"
              imageClassName="w-full rounded-md border border-foreground/15 object-cover shadow-2xl"
              analyzed={analyzed.includes("/showcase/platform-1.webp")}
              onOpen={() => onOpenScreenshot(0)}
            />
          </div>
        ) : <div className="mt-8"><Pipeline labels={pipeline} /></div>}
      </div>
    </m.article>
  );
}

export function ShowcaseLab() {
  const { t } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const platformAlt = t.showcase.items.find((item) => item.id === "platform")?.alt ?? "";
  const showcaseImages = [
    { src: "/showcase/platform-1.webp", alt: platformAlt },
    { src: "/showcase/platform-2.webp", alt: platformAlt },
  ];

  // #97 evidence board: every image opened in the lightbox stamps its
  // thumbnail as ANALYZED (persisted); all analyzed → processed banner.
  const [analyzed, setAnalyzed] = useState<string[]>([]);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(EVIDENCE_KEY);
        if (raw) setAnalyzed(JSON.parse(raw) as string[]);
      } catch {
        // storage unavailable — evidence resets per visit
      }
    });
    const onViewed = (event: Event) => {
      const src = (event as CustomEvent<string>).detail;
      if (!src) return;
      setAnalyzed((previous) => {
        if (previous.includes(src)) return previous;
        const next = [...previous, src];
        try {
          localStorage.setItem(EVIDENCE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    };
    window.addEventListener("app:evidence-viewed", onViewed);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("app:evidence-viewed", onViewed);
    };
  }, []);
  const allProcessed = showcaseImages.every((image) => analyzed.includes(image.src));

  return (
    <section id="showcase" className="px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <div className={CONTAINER}>
        <SectionHeading index="08" kicker={t.showcase.kicker} title={t.showcase.title} description={t.showcase.description} />
        <RevealGroup stagger={0.1} className="mt-14 grid gap-5 lg:grid-cols-2 3xl:gap-8">
          {t.showcase.items.map((item) => <ShowcaseCard key={item.id} item={item} pipeline={t.showcase.pipeline} analyzed={analyzed} onOpenScreenshot={setLightboxIndex} />)}
        </RevealGroup>
        <div className="mt-6 flex flex-col items-center gap-1.5">
          <div className="flex items-center justify-center gap-2 font-mono text-xs text-muted"><Eye size={14} className="text-accent" />{t.showcase.note}</div>
          {allProcessed && (
            <m.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-[0.65rem] tracking-[0.18em] text-accent"
            >
              ALL EVIDENCE PROCESSED ✓
            </m.p>
          )}
        </div>
      </div>
      <Lightbox images={showcaseImages} openIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
    </section>
  );
}
