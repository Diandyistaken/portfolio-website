"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionBackground } from "./SectionBackground";
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
    <section id="goals" className="relative overflow-hidden px-6 py-28 sm:py-32">
      <SectionBackground variant="circuit" />
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          kicker={t.goals.kicker}
          title={t.goals.title}
          description={t.goals.description}
        />

        <RevealGroup stagger={0.15} className="mt-14 flex flex-col gap-5">
          {t.goals.items.map((goal) => {
            const { progress } = goalsMeta[goal.id];
            return (
              <motion.div
                key={goal.id}
                variants={revealItem}
                whileHover={{ y: -3 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <Target size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-semibold">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-muted">{goal.description}</p>
                  </div>
                  <span className="text-sm font-medium text-accent">
                    {percentFormatter.format(progress / 100)}
                  </span>
                </div>

                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progress}%` }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
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
