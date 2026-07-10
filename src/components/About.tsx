"use client";

import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading index="01" kicker={t.about.kicker} title={t.about.title} />
        <Reveal
          delay={0.1}
          className="surface mt-10 grid grid-cols-1 gap-8 rounded-lg p-8 sm:p-10 lg:grid-cols-[auto_1fr]"
        >
          <span className="font-display select-none text-8xl font-semibold leading-none text-accent/20 sm:text-9xl">
            ―
          </span>
          <p className="max-w-3xl text-base leading-relaxed text-foreground/85 sm:text-lg">
            {t.personalInfo.bio}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
