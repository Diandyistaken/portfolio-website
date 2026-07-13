"use client";

import { ArrowUpRight } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { projectsMeta } from "@/lib/data";
import { m } from "framer-motion";
import { useSpotlight } from "@/lib/useSpotlight";
import { BotShowcase } from "./BotShowcase";

function ProjectRow({ project, index }: { project: ReturnType<typeof useLanguage>["t"]["projects"]["items"][number]; index: number }) {
  const meta = projectsMeta[project.id];
  const spotlight = useSpotlight<HTMLAnchorElement>();
  return (
    <m.a onMouseMove={spotlight.onMouseMove} href={meta.url} target="_blank" rel="noopener noreferrer" variants={revealItem} className="spotlight-card group relative grid grid-cols-1 items-center gap-3 overflow-hidden border-b border-foreground/10 py-6 transition-colors last:border-b-0 hover:bg-foreground/[0.04] sm:grid-cols-[3rem_1fr_auto] sm:gap-6 sm:px-2">
      <div className="spotlight-overlay" aria-hidden="true" />
      <span className="font-mono relative z-10 hidden text-sm text-muted sm:block">{String(index + 1).padStart(2, "0")}</span>
      <div className="relative z-10"><div className="flex items-center gap-2"><h3 className="font-display text-lg font-semibold sm:text-xl">{project.title}</h3><ArrowUpRight size={16} className="shrink-0 text-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" /></div><p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">{project.description}</p></div>
      <div className="relative z-10 flex flex-wrap gap-2 sm:justify-end">{meta.tags.map((tag) => <span key={tag} className="font-mono rounded-sm border border-foreground/12 px-2.5 py-1 text-[0.7rem] text-muted">{tag}</span>)}</div>
    </m.a>
  );
}

export function Projects() {
  const { t } = useLanguage();
  const [featured, ...projects] = t.projects.items;
  const featuredMeta = projectsMeta[featured.id];

  return (
    <section id="projects" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="06"
          kicker={t.projects.kicker}
          title={t.projects.title}
          description={t.projects.description}
        />

        <div className="surface mt-14 grid grid-cols-1 items-center gap-8 overflow-hidden rounded-xl p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <m.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.5 }}>
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
          <BotShowcase />
        </div>

        <RevealGroup stagger={0.06} className="surface mt-5 flex flex-col rounded-lg px-6 sm:px-8">
          {projects.map((project, i) => <ProjectRow key={project.id} project={project} index={i + 1} />)}
        </RevealGroup>
      </div>
    </section>
  );
}
