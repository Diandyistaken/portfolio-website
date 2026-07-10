"use client";

import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { experienceMeta } from "@/lib/data";
import { m } from "framer-motion";

export function Experience() {
  const { t } = useLanguage();

  return (
    <section id="experience" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <SectionHeading index="04" kicker={t.experience.kicker} title={t.experience.title} />

        <RevealGroup stagger={0.1} className="surface mt-14 flex flex-col rounded-lg px-6 sm:px-8">
          {t.experience.items.map((exp) => (
            <m.div
              key={exp.id}
              variants={revealItem}
              className="grid grid-cols-1 gap-2 border-b border-foreground/10 py-6 last:border-b-0 sm:grid-cols-[8rem_1fr] sm:gap-8"
            >
              <p className="font-mono text-xs text-muted">{exp.period}</p>
              <div>
                <h3 className="font-display text-lg font-semibold">{exp.role}</h3>
                <p className="text-sm text-accent">{experienceMeta[exp.id].company}</p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                  {exp.description}
                </p>
              </div>
            </m.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
