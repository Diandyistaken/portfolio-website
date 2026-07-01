"use client";

import { Reveal } from "./Reveal";
import { SectionBackground } from "./SectionBackground";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="relative overflow-hidden px-6 py-28 sm:py-32">
      <SectionBackground variant="waves" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-display text-[16rem] font-bold leading-none text-foreground/[0.05] sm:text-[24rem]"
      >
        ?
      </span>
      <div className="relative mx-auto max-w-4xl">
        <SectionHeading kicker={t.about.kicker} title={t.about.title} />
        <Reveal delay={0.1} className="mt-10">
          <p className="glass-strong rounded-3xl p-8 text-center text-base leading-relaxed text-muted sm:p-12 sm:text-lg">
            {t.personalInfo.bio}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
