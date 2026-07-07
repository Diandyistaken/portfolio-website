"use client";

import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { experienceMeta } from "@/lib/data";
import { motion } from "framer-motion";

export function Experience() {
  const { t } = useLanguage();

  return (
    <section id="experience" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <SectionHeading index="04" kicker={t.experience.kicker} title={t.experience.title} />

        <RevealGroup stagger={0.1} className="mt-14 flex flex-col">
          {t.experience.items.map((exp, i) => (
            <motion.div
              key={exp.id}
              variants={revealItem}
              className={`grid grid-cols-1 gap-2 py-6 sm:grid-cols-[8rem_1fr] sm:gap-8 ${
                i === 0 ? "border-t border-foreground/10" : ""
              } border-b border-foreground/10`}
            >
              <p className="font-mono text-xs text-muted">{exp.period}</p>
              <div>
                <h3 className="font-display text-lg font-semibold">{exp.role}</h3>
                <p className="text-sm text-accent">{experienceMeta[exp.id].company}</p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                  {exp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
