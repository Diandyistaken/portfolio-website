"use client";

import { motion } from "framer-motion";
import { Gamepad2, Layers, Network, Shield } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionBackground } from "./SectionBackground";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { skillsMeta } from "@/lib/data";

const icons = {
  cyber: Shield,
  gamedev: Gamepad2,
  corporate: Network,
  other: Layers,
} as const;

export function Skills() {
  const { t } = useLanguage();

  return (
    <section id="skills" className="relative overflow-hidden px-6 py-28 sm:py-32">
      <SectionBackground variant="lines" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker={t.skills.kicker}
          title={t.skills.title}
          description={t.skills.description}
        />

        <RevealGroup
          stagger={0.12}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {t.skills.categories.map((category) => {
            const Icon = icons[category.id as keyof typeof icons];
            const meta = skillsMeta[category.id];
            return (
              <motion.div
                key={category.id}
                variants={revealItem}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`glass rounded-3xl p-7 transition-shadow duration-300 hover:shadow-2xl hover:shadow-accent/10 ${
                  meta.size === "lg" ? "sm:col-span-2" : ""
                }`}
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                  <Icon size={20} />
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
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
