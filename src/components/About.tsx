"use client";

import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { KpiStats } from "./KpiStats";
import { CONTAINER } from "@/lib/layout";
import { ReelPanel } from "./CinematicReel";

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
        <KpiStats />
        <Reveal delay={0.15} className="mt-14 sm:mt-16">
          <p className="mb-5 font-display text-lg font-medium text-foreground/90 sm:text-xl">
            {t.about.reelLead}
          </p>
          <ReelPanel />
        </Reveal>
      </div>
    </section>
  );
}
