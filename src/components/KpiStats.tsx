"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  type MotionValue,
} from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePerfLite } from "./SectionBackdrop";

type NumberBase = "dec" | "hex" | "bin";

/** #18 Number Base Cycler: click a stat and it re-renders in hex, then
 *  binary, then back — a tiny toy for the terminal-minded. */
function formatBase(value: number, base: NumberBase): string {
  if (base === "hex") return `0x${value.toString(16).toUpperCase()}`;
  if (base === "bin") return `0b${value.toString(2)}`;
  return String(value);
}

/**
 * #54 KPI odometer scrub: the figure rolls up odometer-style with the
 * section's scroll progress and rolls back down when scrolling up. The #16
 * hover re-roll (replay) briefly takes over, then scroll resumes control.
 */
function Counter({
  value,
  suffix,
  replay,
  base,
  scrollProgress,
}: {
  value: number;
  suffix: string;
  replay: number;
  base: NumberBase;
  scrollProgress: MotionValue<number>;
}) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? value : 0);
  const rollingRef = useRef(false);

  useMotionValueEvent(scrollProgress, "change", (latest) => {
    if (reducedMotion || rollingRef.current) return;
    setDisplay(Math.round(Math.max(0, Math.min(1, latest)) * value));
  });

  useEffect(() => {
    if (replay === 0 || reducedMotion) return;
    rollingRef.current = true;
    const controls = animate(0, value, {
      duration: 0.7,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
      onComplete: () => {
        rollingRef.current = false;
      },
    });
    return () => {
      controls.stop();
      rollingRef.current = false;
    };
  }, [replay, reducedMotion, value]);

  const shown = reducedMotion ? value : display;
  return <span className="font-display break-all text-3xl font-semibold text-foreground sm:text-4xl 3xl:text-6xl 4xl:text-7xl">{formatBase(shown, base)}{suffix}</span>;
}

export function KpiStats() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [replays, setReplays] = useState<Record<string, number>>({});
  const [bases, setBases] = useState<Record<string, NumberBase>>({});

  // #54: one shared progress for all three counters, scrubbed by scroll
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.95", "start 0.45"],
  });

  const reroll = (label: string) => {
    if (reducedMotion || perfLite) return;
    setReplays((previous) => ({ ...previous, [label]: (previous[label] ?? 0) + 1 }));
  };

  const cycleBase = (label: string) => {
    setBases((previous) => {
      const order: NumberBase[] = ["dec", "hex", "bin"];
      const next = order[(order.indexOf(previous[label] ?? "dec") + 1) % order.length];
      return { ...previous, [label]: next };
    });
  };

  return (
    <m.div ref={containerRef} className="mt-5 grid grid-cols-1 border-t border-foreground/10 pt-3 sm:grid-cols-3 sm:pt-6 3xl:mt-8 3xl:pt-8" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
      {t.about.stats.map((stat) => (
        <m.div
          key={stat.label}
          initial="idle"
          whileHover={reducedMotion || perfLite ? undefined : "pulse"}
          onMouseEnter={() => reroll(stat.label)}
          onClick={() => cycleBase(stat.label)}
          className="relative isolate min-w-0 cursor-pointer border-b border-foreground/10 px-3 py-4 text-center last:border-b-0 sm:border-r sm:border-b-0 sm:px-6 sm:py-0 sm:last:border-r-0"
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
          <Counter value={stat.value} suffix={stat.suffix} replay={replays[stat.label] ?? 0} base={bases[stat.label] ?? "dec"} scrollProgress={scrollYProgress} />
          <p className="mt-1 break-words font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted sm:text-xs 3xl:mt-2 3xl:text-sm">{stat.label}</p>
        </m.div>
      ))}
    </m.div>
  );
}
