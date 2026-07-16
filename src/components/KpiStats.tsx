"use client";

import { useEffect, useRef, useState } from "react";
import { animate, m, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePerfLite } from "./SectionBackdrop";

function Counter({ value, suffix, replay }: { value: number; suffix: string; replay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? value : 0);

  useEffect(() => motionValue.on("change", (latest) => setDisplay(Math.round(latest))), [motionValue]);
  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) { motionValue.set(value); return; }
    // replay > 0 → hover re-roll: restart from 0 with a snappier run
    if (replay > 0) motionValue.set(0);
    return animate(motionValue, value, { duration: replay > 0 ? 0.7 : 1.35, ease: "easeOut" }).stop;
  }, [inView, motionValue, reducedMotion, value, replay]);

  return <span ref={ref} className="font-display text-3xl font-semibold text-foreground sm:text-4xl 3xl:text-6xl 4xl:text-7xl">{display}{suffix}</span>;
}

export function KpiStats() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [replays, setReplays] = useState<Record<string, number>>({});

  const reroll = (label: string) => {
    if (reducedMotion || perfLite) return;
    setReplays((previous) => ({ ...previous, [label]: (previous[label] ?? 0) + 1 }));
  };

  return (
    <m.div className="mt-5 grid grid-cols-1 border-t border-foreground/10 pt-3 sm:grid-cols-3 sm:pt-6 3xl:mt-8 3xl:pt-8" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
      {t.about.stats.map((stat) => (
        <m.div
          key={stat.label}
          initial="idle"
          whileHover={reducedMotion || perfLite ? undefined : "pulse"}
          onMouseEnter={() => reroll(stat.label)}
          className="relative isolate min-w-0 border-b border-foreground/10 px-3 py-4 text-center last:border-b-0 sm:border-r sm:border-b-0 sm:px-6 sm:py-0 sm:last:border-r-0"
        >
          <m.span
            aria-hidden="true"
            variants={{
              idle: { scale: 0.82, opacity: 0 },
              pulse: {
                scale: [0.82, 1.08, 1.16],
                opacity: [0, 0.5, 0],
                transition: { duration: 0.65, ease: "easeOut" },
              },
            }}
            className="pointer-events-none absolute inset-2 -z-10 rounded-lg border border-accent/50"
          />
          <Counter value={stat.value} suffix={stat.suffix} replay={replays[stat.label] ?? 0} />
          <p className="mt-1 break-words font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted sm:text-xs 3xl:mt-2 3xl:text-sm">{stat.label}</p>
        </m.div>
      ))}
    </m.div>
  );
}
