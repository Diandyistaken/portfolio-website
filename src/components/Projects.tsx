"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { projectsMeta } from "@/lib/data";
import { AnimatePresence, m, useInView, useReducedMotion, useSpring } from "framer-motion";
import { useSpotlight } from "@/lib/useSpotlight";
import { useTilt3D } from "@/lib/useTilt3D";
import { BotShowcase } from "./BotShowcase";
import { CONTAINER } from "@/lib/layout";
import { usePerfLite } from "./SectionBackdrop";

type ProjectItem = ReturnType<typeof useLanguage>["t"]["projects"]["items"][number];

function ProjectRow({
  project,
  index,
  onPeek,
  onLeave,
}: {
  project: ProjectItem;
  index: number;
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
  return (
    <m.a ref={scanRef} data-scanned={scanned ? "true" : "false"} {...tilt.handlers} style={tilt.motionStyle} onMouseMove={spotlight.onMouseMove} onMouseEnter={() => onPeek(project, index)} onMouseLeave={onLeave} href={meta.url} target="_blank" rel="noopener noreferrer" variants={revealItem} className="scan-row spotlight-card target-frame group relative grid min-w-0 grid-cols-1 items-center gap-3 overflow-hidden border-b border-foreground/10 py-6 transition-[background-color,border-color,box-shadow] last:border-b-0 hover:border-accent/30 hover:bg-foreground/[0.04] hover:shadow-[0_16px_42px_rgb(var(--accent-rgb)/0.08)] sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-6 sm:px-2 3xl:grid-cols-[4rem_minmax(0,1fr)_auto] 3xl:gap-10 3xl:py-8">
      <div className="spotlight-overlay" aria-hidden="true" />
      <span className="font-mono relative z-10 hidden text-sm text-muted [transform:translateZ(12px)] sm:block">
        {String(index + 1).padStart(2, "0")}
        <span className="mt-0.5 block text-[0.55rem] uppercase tracking-wider text-accent/0 transition-colors duration-300 group-hover:text-accent/70">:{port} open</span>
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
        />

        <m.div {...featuredTilt.handlers} style={featuredTilt.motionStyle} className="surface target-frame mt-14 grid grid-cols-1 items-center gap-8 overflow-hidden rounded-xl p-6 transition-[border-color,box-shadow] hover:border-accent/40 hover:shadow-[0_18px_54px_rgb(var(--accent-rgb)/0.12)] sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 3xl:gap-16 3xl:p-12">
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
          <m.div data-prox data-prox-radius="340" initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="prox-heat rounded-2xl border border-foreground/10 [transform:translateZ(24px)]"><BotShowcase /></m.div>
        </m.div>

        <RevealGroup stagger={0.06} className="surface mt-5 flex flex-col rounded-lg px-6 sm:px-8">
          {projects.map((project, i) => (
            <ProjectRow
              key={project.id}
              project={project}
              index={i + 1}
              onPeek={canPeek ? (proj, index) => setPeek({ project: proj, index }) : () => {}}
              onLeave={() => setPeek(null)}
            />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
