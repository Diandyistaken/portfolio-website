"use client";

import { useState } from "react";
import { m, useReducedMotion, type Variants } from "framer-motion";
import { Target } from "lucide-react";
import { RevealGroup } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { goalsMeta } from "@/lib/data";
import { CONTAINER } from "@/lib/layout";
import { SectionBackdrop, usePerfLite } from "./SectionBackdrop";

const goalVariants: Variants = {
  hidden: ({ index, motionSafe }: { index: number; motionSafe: boolean }) =>
    motionSafe ? { opacity: 0, x: index % 2 === 0 ? -30 : 30, rotateY: index % 2 === 0 ? -5 : 5 } : { opacity: 1 },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  hover: { x: 6 },
};

export function Goals() {
  const { t, locale } = useLanguage();
  // clicking a card re-runs its progress animation (remount via key bump)
  const [pulse, setPulse] = useState<Record<string, number>>({});
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const motionSafe = !reducedMotion && !perfLite;
  const percentFormatter = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  });

  const rerun = (id: string) =>
    setPulse((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));

  return (
    <section id="goals" className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <SectionBackdrop variant="target" flip />
      <div className={`relative z-10 ${CONTAINER}`}>
        <div className="mx-auto max-w-3xl 3xl:max-w-5xl">
        <SectionHeading
        index="09"
          kicker={t.goals.kicker}
          title={t.goals.title}
          description={t.goals.description}
        />

        <RevealGroup stagger={0.1} className="mt-14 flex flex-col gap-4">
          {t.goals.items.map((goal, index) => {
            const { progress } = goalsMeta[goal.id];
            const runKey = pulse[goal.id] ?? 0;
            return (
              <m.div
                key={goal.id}
                custom={{ index, motionSafe }}
                variants={goalVariants}
                whileHover={motionSafe ? "hover" : undefined}
                onClick={() => rerun(goal.id)}
                className="surface surface-hover tap-pop cursor-pointer rounded-lg p-6 [transform-style:preserve-3d]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <m.div variants={{ hover: { x: 3, rotate: 4 } }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-foreground/12 text-accent [transform:translateZ(12px)]">
                    <Target size={16} />
                  </m.div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-semibold">
                      {goal.title}
                    </h3>
                    <p className="break-words text-sm text-muted">{goal.description}</p>
                  </div>
                  <m.span
                    key={`pct-${runKey}`}
                    initial={motionSafe ? { scale: 0.6, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.35 }}
                    className="font-mono text-sm text-accent"
                  >
                    {percentFormatter.format(progress / 100)}
                  </m.span>
                </div>

                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-foreground/8">
                  <m.div
                    key={`bar-${runKey}`}
                    initial={motionSafe ? { scaleX: 0 } : false}
                    whileInView={{ scaleX: progress / 100 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full origin-left rounded-full bg-accent"
                    style={{ width: "100%", boxShadow: "0 0 12px rgb(var(--accent-rgb) / 0.6)" }}
                  />
                </div>
              </m.div>
            );
          })}
        </RevealGroup>
        </div>
      </div>
    </section>
  );
}
