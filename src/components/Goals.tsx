"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { goals } from "@/lib/data";

export function Goals() {
  return (
    <section id="goals" className="relative px-6 py-28 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          kicker="Yol Haritası"
          title="Devam eden hedefler"
          description="Sertifikalardan çok, sürekli ilerleyen bir öğrenme yolculuğu."
        />

        <RevealGroup stagger={0.15} className="mt-14 flex flex-col gap-5">
          {goals.map((goal) => (
            <motion.div
              key={goal.title}
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
                  %{goal.progress}
                </span>
              </div>

              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${goal.progress}%` }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                />
              </div>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
