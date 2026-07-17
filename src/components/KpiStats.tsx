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
  spin,
}: {
  value: number;
  suffix: string;
  replay: number;
  base: NumberBase;
  scrollProgress: MotionValue<number>;
  /** #76 slot pull: {key} bumps per pull; scam pulls land on "???" first */
  spin: { key: number; scam: boolean };
}) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? value : 0);
  const [spinning, setSpinning] = useState(false);
  const [scamShow, setScamShow] = useState(false);
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

  // #76: on a pull, all counters blur-spin through pseudo digits, decelerate
  // onto the true value — scam pulls flash "???" before correcting.
  useEffect(() => {
    if (spin.key === 0 || reducedMotion) return;
    rollingRef.current = true;
    const startedAt = performance.now();
    const spinMs = 750;
    const ceiling = Math.max(10, value * 4);
    let scamTimer: ReturnType<typeof setTimeout> | null = null;
    let started = false;
    const interval = setInterval(() => {
      const now = performance.now();
      const progress = Math.min(1, (now - startedAt) / spinMs);
      if (!started) {
        started = true;
        setSpinning(true);
      }
      if (progress < 1) {
        setDisplay(Math.floor(now / 29) % ceiling);
        return;
      }
      clearInterval(interval);
      setSpinning(false);
      if (spin.scam) {
        setScamShow(true);
        scamTimer = setTimeout(() => {
          setScamShow(false);
          setDisplay(value);
          rollingRef.current = false;
        }, 650);
      } else {
        setDisplay(value);
        rollingRef.current = false;
      }
    }, 45);
    return () => {
      clearInterval(interval);
      if (scamTimer) clearTimeout(scamTimer);
      rollingRef.current = false;
    };
  }, [spin, reducedMotion, value]);

  const shown = reducedMotion ? value : display;
  return (
    <span
      className={`font-display break-all text-3xl font-semibold text-foreground transition-[filter] duration-150 sm:text-4xl 3xl:text-6xl 4xl:text-7xl ${
        spinning ? "blur-[1.5px]" : ""
      }`}
    >
      {scamShow ? "???" : `${formatBase(shown, base)}${suffix}`}
    </span>
  );
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

  // #76 slot-machine pull: dragging any tile downward like a lever and
  // releasing spins ALL counters; every 8th pull "lands" on ??? first.
  const [spin, setSpin] = useState({ key: 0, scam: false });
  const pullCount = useRef(0);
  const draggedAt = useRef(0);
  const canPull = !reducedMotion && !perfLite;
  const onLeverRelease = (offsetY: number) => {
    draggedAt.current = performance.now();
    if (offsetY < 36) return;
    pullCount.current += 1;
    setSpin({ key: pullCount.current, scam: pullCount.current % 8 === 3 });
  };

  return (
    <m.div ref={containerRef} className="mt-5 grid grid-cols-1 border-t border-foreground/10 pt-3 sm:grid-cols-3 sm:pt-6 3xl:mt-8 3xl:pt-8" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
      {t.about.stats.map((stat) => (
        <m.div
          key={stat.label}
          initial="idle"
          whileHover={reducedMotion || perfLite ? undefined : "pulse"}
          onMouseEnter={() => reroll(stat.label)}
          onClickCapture={(event) => {
            // a lever pull is not a base-cycle click
            if (performance.now() - draggedAt.current < 250) event.stopPropagation();
          }}
          onClick={() => cycleBase(stat.label)}
          drag={canPull ? "y" : false}
          dragConstraints={{ top: 0, bottom: 52 }}
          dragElastic={0.25}
          dragSnapToOrigin
          dragMomentum={false}
          onDragEnd={(_event, info) => onLeverRelease(info.offset.y)}
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
          <Counter value={stat.value} suffix={stat.suffix} replay={replays[stat.label] ?? 0} base={bases[stat.label] ?? "dec"} scrollProgress={scrollYProgress} spin={spin} />
          <p className="mt-1 break-words font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted sm:text-xs 3xl:mt-2 3xl:text-sm">{stat.label}</p>
        </m.div>
      ))}
    </m.div>
  );
}
