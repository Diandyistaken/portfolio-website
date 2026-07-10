"use client";

import { Gamepad2, Layers, Network, Shield } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { skillsMeta } from "@/lib/data";
import { m } from "framer-motion";

const icons = {
  cyber: Shield,
  gamedev: Gamepad2,
  corporate: Network,
  other: Layers,
} as const;

export function Skills() {
  const { t } = useLanguage();

  return (
    <section id="skills" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="02"
          kicker={t.skills.kicker}
          title={t.skills.title}
          description={t.skills.description}
        />

        <RevealGroup
          stagger={0.08}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {t.skills.categories.map((category) => {
            const Icon = icons[category.id as keyof typeof icons];
            const meta = skillsMeta[category.id];
            return (
              <m.div
                key={category.id}
                variants={revealItem}
                className={`surface surface-hover rounded-lg p-6 ${
                  meta.size === "lg" ? "sm:col-span-2" : ""
                }`}
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-foreground/12 text-accent">
                  <Icon size={18} />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {category.title}
                </h3>

                <ul className="mt-4 space-y-3">
                  {category.items.map((item) => (
                    <li key={item.label}>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {item.description}
                      </p>
                    </li>
                  ))}
                </ul>

                {meta.tools && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {meta.tools.map((tool) => (
                      <span
                        key={tool}
                        className="font-mono rounded-sm border border-foreground/12 px-2.5 py-1 text-[0.7rem] text-muted"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </m.div>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
