"use client";

import { Lock, ShieldCheck, Wrench, Zap } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CONTAINER } from "@/lib/layout";
import { m } from "framer-motion";

/**
 * Anonymized client & private work: type + stack + status only. Names,
 * identities and content stay redacted on purpose (NDA / private projects) —
 * the classified-file styling turns that constraint into the design.
 */
export function ClassifiedWork() {
  const { t } = useLanguage();

  const statusIcon = {
    delivered: <ShieldCheck size={12} aria-hidden="true" />,
    active: <Zap size={12} aria-hidden="true" />,
    building: <Wrench size={12} aria-hidden="true" />,
  } as const;

  return (
    <section id="classified" className="px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <div className={CONTAINER}>
        <SectionHeading
          index="07"
          kicker={t.classified.kicker}
          title={t.classified.title}
          description={t.classified.description}
        />

        <RevealGroup stagger={0.08} className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 3xl:gap-7">
          {t.classified.items.map((item) => (
            <m.article
              key={item.code}
              variants={revealItem}
              className="surface surface-hover target-frame group relative overflow-hidden rounded-lg p-6 sm:p-7 3xl:p-9"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[0.68rem] tracking-[0.14em] text-muted">
                  {`${t.classified.fileLabel} // ${item.code}`}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-accent/40 px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.16em] text-accent">
                  <Lock size={10} aria-hidden="true" />
                  {item.tag}
                </span>
              </div>

              {/* Redacted "name" line: the bar IS the point — reads as a
                  censored classified file, backed by a screen-reader label. */}
              <div className="mt-5 flex items-center gap-3" aria-label={t.classified.redactedLabel}>
                <span className="redacted-bar h-6 w-36 rounded-sm sm:w-44" aria-hidden="true" />
                <span className="redacted-bar h-6 w-14 rounded-sm sm:w-20" aria-hidden="true" />
              </div>

              <h3 className="font-display mt-4 text-lg font-semibold sm:text-xl">{item.type}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.blurb}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {item.stack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono rounded-sm border border-foreground/12 px-2.5 py-1 text-[0.7rem] text-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-foreground/10 pt-4">
                <span className="font-mono text-[0.68rem] text-muted">{item.year}</span>
                <span
                  className={`flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] ${
                    item.status === "delivered" ? "text-accent" : "text-foreground/70"
                  }`}
                >
                  {statusIcon[item.status]}
                  {t.classified.statuses[item.status]}
                </span>
              </div>
            </m.article>
          ))}
        </RevealGroup>

        <p className="mt-6 font-mono text-xs leading-relaxed text-muted/80">
          {t.classified.note}
        </p>
      </div>
    </section>
  );
}
