"use client";

import { RevealGroup } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { experienceMeta } from "@/lib/data";
import { m, useReducedMotion } from "framer-motion";
import { CONTAINER } from "@/lib/layout";
import { SectionBackdrop, usePerfLite } from "./SectionBackdrop";

export function Experience() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();

  return (
    <section id="experience" className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <SectionBackdrop variant="circuit" flip />
      <div className={`relative z-10 ${CONTAINER}`}>
        <div className="mx-auto max-w-3xl 3xl:max-w-5xl 4xl:max-w-6xl">
          <SectionHeading index="04" kicker={t.experience.kicker} title={t.experience.title} />

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted 3xl:max-w-3xl 3xl:text-base">
          {t.experience.intro}
        </p>

        <RevealGroup stagger={0.1} className="surface relative mt-14 flex flex-col overflow-hidden rounded-lg px-6 sm:px-8 3xl:px-12">
          <m.div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-px origin-top bg-accent/50 shadow-[0_0_14px_rgb(var(--accent-rgb)/0.35)]"
            initial={reducedMotion || perfLite ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          {t.experience.items.map((exp) => (
            <m.div
              key={exp.id}
              initial={reducedMotion || perfLite ? false : { opacity: 0, x: -28, rotateY: -6 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              whileHover={reducedMotion || perfLite ? undefined : { x: 4, rotateY: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="grid min-w-0 grid-cols-1 gap-2 border-b border-foreground/10 py-6 last:border-b-0 sm:grid-cols-[8rem_1fr] sm:gap-8 3xl:grid-cols-[11rem_1fr] 3xl:gap-12 3xl:py-8"
            >
              <p className="font-mono text-xs text-muted">{exp.period}</p>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold">{exp.role}</h3>
                <p className="text-sm text-accent">{experienceMeta[exp.id].company}</p>
                <p className="mt-3 max-w-2xl break-words text-sm leading-relaxed text-muted 3xl:max-w-4xl 3xl:text-base">
                  {exp.description}
                </p>
              </div>
            </m.div>
          ))}
        </RevealGroup>
        </div>
      </div>
    </section>
  );
}
