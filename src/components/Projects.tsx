"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { projectsMeta } from "@/lib/data";
import { AnimatePresence, m, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useSpotlight } from "@/lib/useSpotlight";
import { useTilt3D } from "@/lib/useTilt3D";
import { BotShowcase } from "./BotShowcase";
import { CONTAINER } from "@/lib/layout";
import { usePerfLite } from "./SectionBackdrop";
import { AccessKey } from "./KeyHunt";

type ProjectItem = ReturnType<typeof useLanguage>["t"]["projects"]["items"][number];

// #81 fake intercepted traffic — log lines and their "decrypted" facts are
// terminal artifacts, deliberately English
const MITM_LINES = [
  { log: "POST /api/chat → 200 · 214ms", fact: "handler: LLM + retrieval over a daily AI-news corpus" },
  { log: "GET /digest/today → 200 · 41ms", fact: "cron compiles a fresh digest every morning @ 07:00" },
  { log: "POST /api/chat → 200 · ██████ REDACTED", fact: "prompt-injection filter strips hostile inputs" },
  { log: "WS /stream → 101 · upgraded", fact: "responses stream token-by-token over a socket" },
];

/**
 * Featured demo frame with two toys:
 * #69 CRT boot-up — the frame powers on from a collapsed horizontal line as
 * it enters the viewport (scanline flash), and powers back down when far;
 * #81 man-in-the-middle tooltip — hovering reveals an "intercepted traffic"
 * panel whose log lines decrypt into real one-line facts when clicked.
 */
function CrtDemo({ alive }: { alive: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-12% 0px -12% 0px" });
  const [powerKey, setPowerKey] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [decrypted, setDecrypted] = useState<number[]>([]);

  useEffect(() => {
    if (!alive || !inView) return;
    const raf = requestAnimationFrame(() => setPowerKey((key) => key + 1));
    return () => cancelAnimationFrame(raf);
  }, [alive, inView]);

  const powered = !alive || inView;

  return (
    <m.div
      ref={ref}
      data-prox
      data-prox-radius="340"
      initial={false}
      animate={
        alive
          ? powered
            ? { opacity: 1, scaleY: 1 }
            : { opacity: 0.25, scaleY: 0.015 }
          : { opacity: 1, scaleY: 1 }
      }
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => alive && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="prox-heat relative rounded-2xl border border-foreground/10 [transform:translateZ(24px)]"
    >
      <BotShowcase />
      {/* #69 power-on scanline sweep */}
      {alive && powered && powerKey > 0 && (
        <m.span
          key={powerKey}
          aria-hidden="true"
          initial={{ top: "0%", opacity: 0.9 }}
          animate={{ top: "100%", opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="pointer-events-none absolute inset-x-0 h-10 rounded-2xl bg-gradient-to-b from-transparent via-accent/25 to-transparent"
        />
      )}
      {/* #81 intercepted traffic panel */}
      <AnimatePresence>
        {alive && hovered && (
          <m.div
            aria-hidden="true"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="terminal-panel absolute bottom-3 right-3 z-20 hidden w-72 rounded-lg border border-accent/40 p-3 shadow-[0_16px_50px_rgb(0_0_0/0.6)] lg:block"
          >
            <p className="font-mono text-[0.55rem] tracking-[0.2em] text-accent">INTERCEPTED TRAFFIC // MITM</p>
            <div className="mt-2 space-y-1">
              {MITM_LINES.map((line, index) => (
                <button
                  key={line.log}
                  type="button"
                  tabIndex={-1}
                  onClick={() =>
                    setDecrypted((previous) => (previous.includes(index) ? previous : [...previous, index]))
                  }
                  className="block w-full cursor-pointer text-left font-mono text-[0.58rem] leading-relaxed text-muted transition-colors hover:text-foreground"
                >
                  {decrypted.includes(index) ? <span className="text-accent">▸ {line.fact}</span> : line.log}
                </button>
              ))}
            </div>
            <p className="mt-2 font-mono text-[0.5rem] text-muted/60">click a line to decrypt</p>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}

function ProjectRow({
  project,
  index,
  alive,
  onPeek,
  onLeave,
}: {
  project: ProjectItem;
  index: number;
  alive: boolean;
  onPeek: (project: ProjectItem, index: number) => void;
  onLeave: () => void;
}) {
  const meta = projectsMeta[project.id];
  const spotlight = useSpotlight<HTMLAnchorElement>();
  const tilt = useTilt3D<HTMLAnchorElement>();
  // #25 Port-scan reveal: fire the scan-line sweep when the row enters view
  const scanRef = useRef<HTMLAnchorElement>(null);
  const scanned = useInView(scanRef, { once: true, amount: 0.6 });
  const [port] = useState(() => 1024 + index * 137);
  // #100 dossier unstack: each folder starts slightly offset + rotated like a
  // stacked classified file and straightens as its own scrub progresses;
  // scrolling back restacks the pile.
  const { scrollYProgress: unstack } = useScroll({ target: scanRef, offset: ["start 0.98", "start 0.62"] });
  const dossierY = useTransform(unstack, [0, 1], [26 + index * 6, 0], { clamp: true });
  const dossierRot = useTransform(unstack, [0, 1], [index % 2 === 0 ? -1.4 : 1.6, 0], { clamp: true });
  return (
    <m.a ref={scanRef} data-scanned={scanned ? "true" : "false"} {...tilt.handlers} style={alive ? { ...tilt.motionStyle, y: dossierY, rotate: dossierRot } : tilt.motionStyle} onMouseMove={spotlight.onMouseMove} onMouseEnter={() => onPeek(project, index)} onMouseLeave={onLeave} href={meta.url} target="_blank" rel="noopener noreferrer" variants={revealItem} className="scan-row spotlight-card target-frame group relative grid min-w-0 grid-cols-1 items-center gap-3 overflow-hidden border-b border-foreground/10 py-6 transition-[background-color,border-color,box-shadow] last:border-b-0 hover:border-accent/30 hover:bg-foreground/[0.04] hover:shadow-[0_16px_42px_rgb(var(--accent-rgb)/0.08)] sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-6 sm:px-2 3xl:grid-cols-[4rem_minmax(0,1fr)_auto] 3xl:gap-10 3xl:py-8">
      <div className="spotlight-overlay" aria-hidden="true" />
      <span className="font-mono relative z-10 hidden text-sm text-muted [transform:translateZ(12px)] sm:block">
        {String(index + 1).padStart(2, "0")}
        <span className="mt-0.5 block text-[0.55rem] uppercase tracking-wider text-accent/0 transition-colors duration-300 group-hover:text-accent/70">:{port} open</span>
        {/* #67 hidden key no.3 rides the second dossier */}
        {index === 2 && <AccessKey id="project" />}
      </span>
      <div className="relative z-10 min-w-0 [transform:translateZ(18px)]"><div className="flex min-w-0 items-center gap-2"><h3 className="font-display break-words text-lg font-semibold sm:text-xl 3xl:text-2xl">{project.title}</h3><ArrowUpRight size={16} className="shrink-0 text-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" /></div><p className="mt-1.5 max-w-xl break-words text-sm leading-relaxed text-muted 3xl:max-w-3xl 3xl:text-base">{project.description}</p></div>
      <div className="relative z-10 flex flex-wrap gap-2 [transform:translateZ(14px)] sm:justify-end">{meta.tags.map((tag) => <span key={tag} data-prox className="prox-chip font-mono rounded-sm border border-foreground/12 px-2.5 py-1 text-[0.7rem] text-muted">{tag}</span>)}</div>
    </m.a>
  );
}

export function Projects() {
  const { t } = useLanguage();
  const featuredTilt = useTilt3D<HTMLDivElement>();
  const [featured, ...projects] = t.projects.items;
  const featuredMeta = projectsMeta[featured.id];

  // #34 Thumbnail peek-zoom: a floating terminal card follows the cursor over
  // text rows (desktop only). One shared panel spring-follows the pointer.
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [peek, setPeek] = useState<{ project: ProjectItem; index: number } | null>(null);
  const panelX = useSpring(0, { stiffness: 350, damping: 30 });
  const panelY = useSpring(0, { stiffness: 350, damping: 30 });
  const panelRot = useSpring(0, { stiffness: 250, damping: 20 });
  const lastX = useRef(0);
  const peekActive = peek !== null;

  useEffect(() => {
    if (!peekActive || reducedMotion || perfLite) return;
    if (window.matchMedia("(hover: none)").matches) return;
    let raf = 0;
    const onMove = (event: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        panelX.set(event.clientX + 22);
        panelY.set(event.clientY - 40);
        const delta = event.clientX - lastX.current;
        lastX.current = event.clientX;
        panelRot.set(Math.max(-4, Math.min(4, delta * 0.4)));
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [peekActive, reducedMotion, perfLite, panelX, panelY, panelRot]);

  const canPeek = !reducedMotion && !perfLite;

  return (
    <section id="projects" className="px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      {canPeek && (
        <AnimatePresence>
          {peek && (
            <m.div
              aria-hidden="true"
              style={{ left: panelX, top: panelY, rotate: panelRot }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="terminal-panel pointer-events-none fixed z-50 hidden w-52 origin-top-left rounded-lg border border-accent/40 p-3 shadow-[0_20px_60px_rgb(0_0_0/0.6)] lg:block"
            >
              <p className="font-mono text-[0.7rem] font-semibold text-foreground">{peek.project.title}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {projectsMeta[peek.project.id].tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="font-mono rounded-sm border border-foreground/12 px-1.5 py-0.5 text-[0.55rem] text-muted">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-2 font-mono text-[0.58rem] text-accent/80">
                GET /{peek.project.id} → 200 OK · build {30 + peek.index * 7}s
              </p>
            </m.div>
          )}
        </AnimatePresence>
      )}
      <div className={CONTAINER}>
        <SectionHeading
        index="06"
          kicker={t.projects.kicker}
          title={t.projects.title}
          description={t.projects.description}
          diffCorrect
        />

        {/* #120 rubber-band deck (simplified on purpose — the backlog itself
            flags a full layout rebuild as poor payoff): the featured card can
            be yanked horizontally against rubber-band resistance and snaps
            back; the demo side "weighs more" via a heavier drag factor. */}
        <m.div
          {...featuredTilt.handlers}
          style={featuredTilt.motionStyle}
          drag={canPeek ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          dragSnapToOrigin
          dragTransition={{ bounceStiffness: 320, bounceDamping: 16 }}
          className="surface target-frame mt-14 grid grid-cols-1 items-center gap-8 overflow-hidden rounded-xl p-6 transition-[border-color,box-shadow] hover:border-accent/40 hover:shadow-[0_18px_54px_rgb(var(--accent-rgb)/0.12)] sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 3xl:gap-16 3xl:p-12"
        >
          <m.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.5 }} className="[transform:translateZ(18px)]">
            <span className="font-mono text-xs text-accent">01 / FEATURED</span>
            <a href={featuredMeta.url} target="_blank" rel="noopener noreferrer" className="group mt-4 block">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-2xl font-semibold sm:text-3xl">{featured.title}</h3>
                <ArrowUpRight size={18} className="shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{featured.description}</p>
            </a>
            <div className="mt-6 flex flex-wrap gap-2">{featuredMeta.tags.map((tag) => <span key={tag} data-prox className="prox-chip font-mono rounded-sm border border-foreground/12 px-2.5 py-1 text-[0.7rem] text-muted">{tag}</span>)}</div>
          </m.div>
          <CrtDemo alive={canPeek} />
        </m.div>

        <RevealGroup stagger={0.06} className="surface mt-5 flex flex-col rounded-lg px-6 sm:px-8">
          {projects.map((project, i) => (
            <ProjectRow
              key={project.id}
              project={project}
              index={i + 1}
              alive={canPeek}
              onPeek={canPeek ? (proj, index) => setPeek({ project: proj, index }) : () => {}}
              onLeave={() => setPeek(null)}
            />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
