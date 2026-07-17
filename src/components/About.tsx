"use client";

import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { KpiStats } from "./KpiStats";
import { CONTAINER } from "@/lib/layout";
import { AboutTerminal } from "./AboutTerminal";
import { usePerfLite } from "./SectionBackdrop";

/** #47 Scroll-scrub manifesto: one line that types itself as you scroll down
 *  and un-types as you scroll up — a sentence you play with the scrollbar. */
function ScrubManifesto({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "center 0.4"] });
  const chars = useTransform(scrollYProgress, (value) =>
    text.slice(0, Math.round(Math.max(0, Math.min(1, value)) * text.length)),
  );
  const staticText = reducedMotion || perfLite;

  return (
    <p
      ref={ref}
      className="font-mono mt-10 text-center text-sm text-accent/90 sm:text-base"
    >
      <span className="text-accent/50">&gt; </span>
      {staticText ? text : <m.span>{chars}</m.span>}
      {!staticText && <span className="ops-cursor ml-0.5 inline-block" aria-hidden="true">▊</span>}
    </p>
  );
}

export function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <div className={CONTAINER}>
        <SectionHeading index="01" kicker={t.about.kicker} title={t.about.title} />
        <Reveal
          delay={0.1}
          className="surface mt-10 grid grid-cols-1 gap-6 rounded-lg p-6 sm:gap-8 sm:p-10 lg:grid-cols-[auto_1fr] 3xl:gap-12 3xl:p-12"
        >
          <span className="font-display select-none text-8xl font-semibold leading-none text-accent/20 sm:text-9xl">
            ―
          </span>
          <p className="max-w-3xl text-base leading-relaxed text-foreground/85 sm:text-lg 3xl:max-w-5xl 3xl:text-xl">
            {t.personalInfo.bio}
          </p>
        </Reveal>
        <ScrubManifesto text={t.about.manifesto} />
        <KpiStats />
        <Reveal delay={0.15} className="mt-14 sm:mt-16">
          <p className="mb-5 font-display text-lg font-medium text-foreground/90 sm:text-xl">
            {t.about.terminalLead}
          </p>
          <AboutTerminal />
        </Reveal>
      </div>
    </section>
  );
}
