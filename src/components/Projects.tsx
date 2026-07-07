"use client";

import { ArrowUpRight } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { projectsMeta } from "@/lib/data";
import { motion } from "framer-motion";

export function Projects() {
  const { t } = useLanguage();

  return (
    <section id="projects" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="06"
          kicker={t.projects.kicker}
          title={t.projects.title}
          description={t.projects.description}
        />

        <RevealGroup stagger={0.06} className="mt-14 flex flex-col">
          {t.projects.items.map((project, i) => {
            const meta = projectsMeta[project.id];
            return (
              <motion.a
                key={project.id}
                href={meta.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={revealItem}
                className={`group grid grid-cols-1 items-center gap-3 py-6 transition-colors hover:bg-foreground/[0.03] sm:grid-cols-[3rem_1fr_auto] sm:gap-6 sm:px-4 ${
                  i === 0 ? "border-t border-foreground/10" : ""
                } border-b border-foreground/10`}
              >
                <span className="font-mono hidden text-sm text-muted sm:block">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold sm:text-xl">
                      {project.title}
                    </h3>
                    <ArrowUpRight
                      size={16}
                      className="shrink-0 text-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </div>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono rounded-sm border border-foreground/12 px-2.5 py-1 text-[0.7rem] text-muted"
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
