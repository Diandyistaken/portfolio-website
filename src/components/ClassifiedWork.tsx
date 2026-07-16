"use client";

import { useEffect, useState } from "react";
import { Lock, ShieldCheck, Unlock, Wrench, Zap } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CONTAINER } from "@/lib/layout";

const CLEARANCE_TARGET = 3;

function readClearance(): number {
  try {
    const raw = localStorage.getItem("mm-achievements-v1");
    return raw ? (JSON.parse(raw) as unknown[]).length : 0;
  } catch {
    return 0;
  }
}

/**
 * Anonymized client & private work: type + stack + status only. Names,
 * identities and content stay redacted on purpose (NDA / private projects) —
 * the classified-file styling turns that constraint into the design.
 */
export function ClassifiedWork() {
  const { t } = useLanguage();

  // #13 NDA Clearance Level: achievements earned around the site raise the
  // visitor's clearance; at 3+ the first record declassifies one extra,
  // pre-approved sentence. Play converts into real recruiter content.
  const [clearance, setClearance] = useState(0);
  useEffect(() => {
    const sync = () => setClearance(readClearance());
    const initial = setTimeout(sync, 0);
    window.addEventListener("app:achievement-unlocked", sync);
    return () => {
      clearTimeout(initial);
      window.removeEventListener("app:achievement-unlocked", sync);
    };
  }, []);
  const cleared = clearance >= CLEARANCE_TARGET;

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
              <div className="mt-5 flex items-center gap-3">
                <span className="sr-only">{t.classified.redactedLabel}</span>
                <span className="redacted-bar h-6 w-36 rounded-sm sm:w-44" aria-hidden="true" />
                <span className="redacted-bar h-6 w-14 rounded-sm sm:w-20" aria-hidden="true" />
              </div>

              <h3 className="font-display mt-4 text-lg font-semibold sm:text-xl">{item.type}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.blurb}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {item.stack.map((tech) => (
                  <span
                    key={tech}
                    data-prox
                    className="prox-chip font-mono rounded-sm border border-foreground/12 px-2.5 py-1 text-[0.7rem] text-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {item.code === t.classified.items[0].code && (
                <AnimatePresence>
                  {cleared && (
                    <m.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 border-l-2 border-accent/50 pl-3 font-mono text-[0.7rem] leading-relaxed text-accent/90"
                    >
                      {t.classified.bonus}
                    </m.p>
                  )}
                </AnimatePresence>
              )}

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

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs leading-relaxed text-muted">{t.classified.note}</p>
          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.14em] transition-colors ${
              cleared ? "border-accent/60 text-accent" : "border-foreground/15 text-muted"
            }`}
          >
            {cleared ? <Unlock size={11} aria-hidden="true" /> : <Lock size={11} aria-hidden="true" />}
            {t.classified.bonusLabel}: {Math.min(clearance, CLEARANCE_TARGET)}/{CLEARANCE_TARGET}
          </span>
        </div>
      </div>
    </section>
  );
}
