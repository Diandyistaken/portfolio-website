"use client";

import { m, useReducedMotion } from "framer-motion";
import { Eye } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { RevealGroup, revealItem } from "./Reveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useSpotlight } from "@/lib/useSpotlight";

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
          <rect x={25 + index * 170} y="68" width="105" height="74" rx="7" fill="rgb(10 14 22)" stroke="rgb(var(--accent-rgb))" strokeOpacity=".7" />
          <circle cx={48 + index * 170} cy="92" r="5" fill="rgb(var(--accent-rgb))" />
          <text x={77 + index * 170} y="112" textAnchor="middle" fill="#e9eef6" fontSize="14" fontFamily="monospace">{label}</text>
          <text x={77 + index * 170} y="132" textAnchor="middle" fill="#94a0b3" fontSize="9" fontFamily="monospace">0{index + 1}</text>
        </m.g>
      ))}
    </svg>
  );
}

function ShowcaseCard({ item, pipeline }: { item: ReturnType<typeof useLanguage>["t"]["showcase"]["items"][number]; pipeline: string[] }) {
  const spotlight = useSpotlight<HTMLDivElement>();
  return (
    <m.article variants={revealItem} onMouseMove={spotlight.onMouseMove} className="spotlight-card group relative overflow-hidden rounded-lg border border-foreground/10 bg-[rgb(var(--surface)/0.92)] p-6 sm:p-8">
      <div className="spotlight-overlay" aria-hidden="true" />
      <div className="relative z-10">
        <span className="inline-flex items-center gap-2 rounded-sm border border-accent/30 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-accent"><span className="h-1.5 w-1.5 bg-accent" />{item.badge}</span>
        <h3 className="font-display mt-5 text-2xl font-semibold tracking-tight">{item.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{item.description}</p>
        {item.id === "platform" ? (
          <div className="relative mt-8 aspect-[16/10]">
            <img src="/showcase/platform-2.webp" alt={item.alt} width="1200" height="750" className="absolute inset-x-4 top-0 w-[calc(100%-2rem)] rounded-md border border-foreground/10 object-cover opacity-55" />
            <img src="/showcase/platform-1.webp" alt={item.alt} width="1200" height="750" className="absolute inset-x-0 top-5 w-full rounded-md border border-foreground/15 object-cover shadow-2xl transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:-rotate-1 motion-reduce:transform-none" />
          </div>
        ) : <div className="mt-8"><Pipeline labels={pipeline} /></div>}
      </div>
    </m.article>
  );
}

export function ShowcaseLab() {
  const { t } = useLanguage();
  return (
    <section id="showcase" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="07" kicker={t.showcase.kicker} title={t.showcase.title} description={t.showcase.description} />
        <RevealGroup stagger={0.1} className="mt-14 grid gap-5 lg:grid-cols-2">
          {t.showcase.items.map((item) => <ShowcaseCard key={item.id} item={item} pipeline={t.showcase.pipeline} />)}
        </RevealGroup>
        <div className="mt-6 flex items-center justify-center gap-2 font-mono text-xs text-muted"><Eye size={14} className="text-accent" />{t.showcase.note}</div>
      </div>
    </section>
  );
}
