"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionBackground } from "./SectionBackground";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { experienceMeta } from "@/lib/data";

export function Experience() {
  const { t } = useLanguage();

  return (
    <section id="experience" className="relative overflow-hidden px-6 py-28 sm:py-32">
      <SectionBackground variant="mesh" />
      <div className="mx-auto max-w-3xl">
        <SectionHeading kicker={t.experience.kicker} title={t.experience.title} />

        <RevealGroup stagger={0.15} className="relative mt-16">
          <div className="absolute left-[0.7rem] top-2 bottom-2 w-px bg-gradient-to-b from-accent via-white/10 to-transparent" />

          <div className="flex flex-col gap-8">
            {t.experience.items.map((exp) => (
              <motion.div
                key={exp.id}
                variants={revealItem}
                className="relative pl-12"
              >
                <span className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-background">
                  <Briefcase size={12} />
                </span>

                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="glass rounded-2xl p-6"
                >
                  <p className="text-xs font-medium uppercase tracking-widest text-accent">
                    {exp.period}
                  </p>
                  <h3 className="font-display mt-2 text-lg font-semibold">
                    {exp.role}
                  </h3>
                  <p className="text-sm text-muted">{experienceMeta[exp.id].company}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {exp.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
