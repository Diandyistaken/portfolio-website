"use client";

import Image from "next/image";
import { m, useReducedMotion } from "framer-motion";
import { Eye } from "lucide-react";
import { useState } from "react";
import { Lightbox } from "./Lightbox";
import { SectionHeading } from "./SectionHeading";
import { RevealGroup, revealItem } from "./Reveal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useSpotlight } from "@/lib/useSpotlight";
import { useTilt3D } from "@/lib/useTilt3D";
import { CONTAINER } from "@/lib/layout";

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

function ShowcaseCard({ item, pipeline, onOpenScreenshot }: { item: ReturnType<typeof useLanguage>["t"]["showcase"]["items"][number]; pipeline: string[]; onOpenScreenshot: (index: number) => void }) {
  const spotlight = useSpotlight<HTMLDivElement>();
  const tilt = useTilt3D<HTMLElement>();
  return (
    <m.article {...tilt.handlers} style={tilt.motionStyle} variants={revealItem} onMouseMove={spotlight.onMouseMove} className="spotlight-card group relative min-w-0 overflow-hidden rounded-lg border border-foreground/10 bg-[rgb(var(--surface)/0.92)] p-6 transition-[border-color,box-shadow] hover:border-accent/35 hover:shadow-[0_18px_48px_rgb(var(--accent-rgb)/0.1)] sm:p-8 3xl:p-10">
      <div className="spotlight-overlay" aria-hidden="true" />
      <div className="relative z-10 [transform:translateZ(18px)]">
        <span className="inline-flex items-center gap-2 rounded-sm border border-accent/30 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-accent"><span className="h-1.5 w-1.5 bg-accent" />{item.badge}</span>
        <h3 className="font-display mt-5 text-2xl font-semibold tracking-tight">{item.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{item.description}</p>
        {item.id === "platform" ? (
          <div className="relative mt-8 aspect-[16/10]">
            <button type="button" aria-label={item.alt} onClick={() => onOpenScreenshot(1)} className="absolute inset-x-4 top-0 w-[calc(100%-2rem)] cursor-zoom-in rounded-md transition-transform duration-300 hover:scale-[1.015] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transform-none">
              <Image src="/showcase/platform-2.webp" alt={item.alt} width={1200} height={750} sizes="(min-width: 2400px) 60rem, (min-width: 1024px) 50vw, calc(100vw - 3rem)" className="w-full rounded-md border border-foreground/10 object-cover opacity-55" />
            </button>
            <button type="button" aria-label={item.alt} onClick={() => onOpenScreenshot(0)} className="absolute inset-x-0 top-5 w-full cursor-zoom-in rounded-md transition-transform duration-500 hover:scale-[1.015] group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:-rotate-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transform-none">
              <Image src="/showcase/platform-1.webp" alt={item.alt} width={1200} height={750} sizes="(min-width: 2400px) 60rem, (min-width: 1024px) 50vw, calc(100vw - 3rem)" className="w-full rounded-md border border-foreground/15 object-cover shadow-2xl" />
            </button>
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

  return (
    <section id="showcase" className="px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <div className={CONTAINER}>
        <SectionHeading index="07" kicker={t.showcase.kicker} title={t.showcase.title} description={t.showcase.description} />
        <RevealGroup stagger={0.1} className="mt-14 grid gap-5 lg:grid-cols-2 3xl:gap-8">
          {t.showcase.items.map((item) => <ShowcaseCard key={item.id} item={item} pipeline={t.showcase.pipeline} onOpenScreenshot={setLightboxIndex} />)}
        </RevealGroup>
        <div className="mt-6 flex items-center justify-center gap-2 font-mono text-xs text-muted"><Eye size={14} className="text-accent" />{t.showcase.note}</div>
      </div>
      <Lightbox images={showcaseImages} openIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
    </section>
  );
}
