"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Lock, Maximize2 } from "lucide-react";
import { m } from "framer-motion";
import { RevealGroup, revealItem } from "./Reveal";
import { ChapterHeading } from "./ChapterHeading";
import { GithubIcon } from "./icons";
import { Lightbox } from "./Lightbox";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useSpotlight } from "@/lib/useSpotlight";
import { arsenalMeta } from "@/lib/data";
import { CONTAINER } from "@/lib/layout";

type ArsenalItem = ReturnType<typeof useLanguage>["t"]["arsenal"]["items"][number];

function ArsenalCard({
  item,
  onOpen,
}: {
  item: ArsenalItem;
  onOpen: (images: { src: string; alt: string }[], index: number) => void;
}) {
  const { t } = useLanguage();
  const meta = arsenalMeta[item.id];
  const spotlight = useSpotlight<HTMLElement>();
  const images = meta.screenshots.map((src) => ({ src, alt: item.alt }));
  const isCommercial = meta.kind === "commercial";
  const badgeLabel = isCommercial ? t.arsenal.badges.commercial : t.arsenal.badges.oss;

  return (
    <m.article
      variants={revealItem}
      onMouseMove={spotlight.onMouseMove}
      className="spotlight-card group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-foreground/10 bg-[rgb(var(--surface)/0.92)] transition-[border-color,box-shadow] hover:border-accent/35 hover:shadow-[0_18px_54px_rgb(var(--accent-rgb)/0.12)]"
    >
      <div className="spotlight-overlay" aria-hidden="true" />

      {/* Cover screenshot — click to open the forensic lightbox */}
      <button
        type="button"
        onClick={() => onOpen(images, 0)}
        aria-label={item.alt}
        className="relative z-10 block aspect-[16/10] w-full overflow-hidden border-b border-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
      >
        <Image
          src={meta.screenshots[0]}
          alt={item.alt}
          fill
          sizes="(min-width: 1024px) 33vw, calc(100vw - 3rem)"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" aria-hidden="true" />
        <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-accent/40 bg-background/70 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-accent backdrop-blur">
          {isCommercial ? <Lock size={10} aria-hidden="true" /> : <GithubIcon width={10} height={10} aria-hidden="true" />}
          {badgeLabel}
        </span>
        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md border border-white/15 bg-black/45 px-2 py-1 font-mono text-[0.58rem] text-white/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Maximize2 size={11} aria-hidden="true" />
          {t.arsenal.screenshotHint.replace("{n}", String(meta.screenshots.length))}
        </span>
      </button>

      <div className="relative z-10 flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{item.title}</h3>
          <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-accent/25 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-wider text-accent">
            <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
            {item.badge}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>

        <ul className="mt-4 space-y-1.5">
          {item.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2 text-[0.82rem] leading-relaxed text-muted">
              <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent/70" aria-hidden="true" />
              {bullet}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-2">
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono rounded-sm border border-foreground/12 px-2.5 py-1 text-[0.68rem] text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4 border-t border-foreground/10 pt-4">
          {meta.url ? (
            <a
              href={meta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-accent transition-colors hover:text-foreground"
            >
              <GithubIcon width={14} height={14} aria-hidden="true" />
              {t.arsenal.viewSource}
              <ArrowUpRight size={13} className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" aria-hidden="true" />
            </a>
          ) : isCommercial ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-muted/70">
              <Lock size={13} aria-hidden="true" />
              {t.arsenal.badges.commercial}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-accent/80">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
              {t.arsenal.demoLabel}
            </span>
          )}
        </div>
      </div>
    </m.article>
  );
}

/**
 * "Canlı Vitrin" — the strongest, most recent builds shown with real
 * (anonymized) product screenshots. The copyright-detection engine is a
 * commercial product: screenshots only, source stays closed. The rest link to
 * their public repos.
 */
export function LiveArsenal() {
  const { t } = useLanguage();
  const [lightbox, setLightbox] = useState<{ images: { src: string; alt: string }[]; index: number } | null>(null);

  return (
    <section id="arsenal" className="px-6 pt-16 pb-20 sm:px-10 sm:pt-20 sm:pb-24 3xl:px-16">
      <div className={CONTAINER}>
        <ChapterHeading
          step="06.1"
          label={t.arsenal.kicker}
          title={t.arsenal.title}
          description={t.arsenal.description}
        />

        <RevealGroup stagger={0.08} className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 3xl:gap-7">
          {t.arsenal.items.map((item) => (
            <ArsenalCard
              key={item.id}
              item={item}
              onOpen={(images, index) => setLightbox({ images, index })}
            />
          ))}
        </RevealGroup>

        <p className="mt-8 text-center font-mono text-xs leading-relaxed text-muted">{t.arsenal.note}</p>
      </div>

      <Lightbox
        images={lightbox?.images ?? []}
        openIndex={lightbox ? lightbox.index : null}
        onClose={() => setLightbox(null)}
      />
    </section>
  );
}
