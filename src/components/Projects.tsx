"use client";

import { ArrowUpRight } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { projectsMeta } from "@/lib/data";
import { m } from "framer-motion";
import { useSpotlight } from "@/lib/useSpotlight";
import { useTilt3D } from "@/lib/useTilt3D";
import { BotShowcase } from "./BotShowcase";
import { CONTAINER } from "@/lib/layout";

function ProjectRow({ project, index }: { project: ReturnType<typeof useLanguage>["t"]["projects"]["items"][number]; index: number }) {
  const meta = projectsMeta[project.id];
  const spotlight = useSpotlight<HTMLAnchorElement>();
  const tilt = useTilt3D<HTMLAnchorElement>();
  return (
    <m.a {...tilt.handlers} style={tilt.motionStyle} onMouseMove={spotlight.onMouseMove} href={meta.url} target="_blank" rel="noopener noreferrer" variants={revealItem} className="spotlight-card target-frame group relative grid min-w-0 grid-cols-1 items-center gap-3 overflow-hidden border-b border-foreground/10 py-6 transition-[background-color,border-color,box-shadow] last:border-b-0 hover:border-accent/30 hover:bg-foreground/[0.04] hover:shadow-[0_16px_42px_rgb(var(--accent-rgb)/0.08)] sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-6 sm:px-2 3xl:grid-cols-[4rem_minmax(0,1fr)_auto] 3xl:gap-10 3xl:py-8">
      <div className="spotlight-overlay" aria-hidden="true" />
      <span className="font-mono relative z-10 hidden text-sm text-muted [transform:translateZ(12px)] sm:block">{String(index + 1).padStart(2, "0")}</span>
      <div className="relative z-10 min-w-0 [transform:translateZ(18px)]"><div className="flex min-w-0 items-center gap-2"><h3 className="font-display break-words text-lg font-semibold sm:text-xl 3xl:text-2xl">{project.title}</h3><ArrowUpRight size={16} className="shrink-0 text-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" /></div><p className="mt-1.5 max-w-xl break-words text-sm leading-relaxed text-muted 3xl:max-w-3xl 3xl:text-base">{project.description}</p></div>
      <div className="relative z-10 flex flex-wrap gap-2 [transform:translateZ(14px)] sm:justify-end">{meta.tags.map((tag) => <span key={tag} className="font-mono rounded-sm border border-foreground/12 px-2.5 py-1 text-[0.7rem] text-muted">{tag}</span>)}</div>
    </m.a>
  );
}

export function Projects() {
  const { t } = useLanguage();
  const featuredTilt = useTilt3D<HTMLDivElement>();
  const [featured, ...projects] = t.projects.items;
  const featuredMeta = projectsMeta[featured.id];

  return (
    <section id="projects" className="px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
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
            <div className="mt-6 flex flex-wrap gap-2">{featuredMeta.tags.map((tag) => <span key={tag} className="font-mono rounded-sm border border-foreground/12 px-2.5 py-1 text-[0.7rem] text-muted">{tag}</span>)}</div>
          </m.div>
          <div className="[transform:translateZ(24px)]"><BotShowcase /></div>
        </m.div>

        <RevealGroup stagger={0.06} className="surface mt-5 flex flex-col rounded-lg px-6 sm:px-8">
          {projects.map((project, i) => <ProjectRow key={project.id} project={project} index={i + 1} />)}
        </RevealGroup>
      </div>
    </section>
  );
}
