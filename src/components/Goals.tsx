"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { goalsMeta } from "@/lib/data";

export function Goals() {
  const { t, locale } = useLanguage();
  const percentFormatter = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  });

  return (
    <section id="goals" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          index="07"
          kicker={t.goals.kicker}
          title={t.goals.title}
          description={t.goals.description}
        />

        <RevealGroup stagger={0.1} className="mt-14 flex flex-col gap-4">
          {t.goals.items.map((goal) => {
            const { progress } = goalsMeta[goal.id];
            return (
              <motion.div key={goal.id} variants={revealItem} className="surface rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-foreground/12 text-accent">
                    <Target size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-semibold">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-muted">{goal.description}</p>
                  </div>
                  <span className="font-mono text-sm text-accent">
                    {percentFormatter.format(progress / 100)}
                  </span>
                </div>

                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-foreground/8">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progress}%` }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-accent"
                  />
                </div>
              </motion.div>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
