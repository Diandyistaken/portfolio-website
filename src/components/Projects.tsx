"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionBackground } from "./SectionBackground";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { projectsMeta } from "@/lib/data";

export function Projects() {
  const { t } = useLanguage();

  return (
    <section id="projects" className="relative overflow-hidden px-6 py-28 sm:py-32">
      <SectionBackground variant="grid" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker={t.projects.kicker}
          title={t.projects.title}
          description={t.projects.description}
        />

        <RevealGroup
          stagger={0.12}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          {t.projects.items.map((project) => {
            const meta = projectsMeta[project.id];
            return (
              <motion.a
                key={project.id}
                href={meta.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={revealItem}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`group glass relative flex flex-col justify-between overflow-hidden rounded-3xl p-7 transition-shadow duration-300 hover:shadow-2xl hover:shadow-accent/10 ${
                  meta.size === "lg" ? "sm:col-span-2 sm:min-h-[14rem]" : "sm:min-h-[14rem]"
                }`}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100 opacity-0" />

                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl font-semibold">
                      {project.title}
                    </h3>
                    <ExternalLink
                      size={18}
                      className="mt-1 shrink-0 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {project.description}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.a>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
