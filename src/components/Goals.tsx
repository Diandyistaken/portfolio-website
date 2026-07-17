"use client";

import { useEffect, useRef, useState } from "react";
import { m, useInView, useReducedMotion, useSpring, useTransform, type Variants } from "framer-motion";
import { Target } from "lucide-react";
import { RevealGroup } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { goalsMeta } from "@/lib/data";
import { CONTAINER } from "@/lib/layout";
import { usePerfLite } from "./SectionBackdrop";

/** #29 Decryption percent: the number scrambles through random digits and
 *  resolves to the real value — a bar "decrypting" its progress. Restarts on
 *  the `runKey` bump (card click) and when it first scrolls into view. */
function DecryptPercent({
  value,
  runKey,
  format,
  animate: doAnimate,
}: {
  value: number;
  runKey: number;
  format: (fraction: number) => string;
  animate: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  // starts at the real value; the interval (a callback, not the effect body)
  // scrambles it while animating, so there's no setState in the effect body.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!doAnimate || !inView) return;
    const startedAt = performance.now();
    const DURATION = 900;
    const id = setInterval(() => {
      const now = performance.now();
      const progress = Math.min(1, (now - startedAt) / DURATION);
      if (progress >= 1) {
        setDisplay(value);
        clearInterval(id);
        return;
      }
      // early: full scramble (time-derived pseudo digits); late: home in on
      // the real value so the last few frames read as "locking in".
      const scrambled = Math.floor(now / 47) % 100;
      setDisplay(progress < 0.7 ? scrambled : Math.round(value * progress + scrambled * (1 - progress)));
    }, 45);
    return () => clearInterval(id);
  }, [doAnimate, inView, value, runKey]);

  return <span ref={ref}>{format(display / 100)}</span>;
}

/**
 * #90 Pull-back slingshot bar: a grabbable handle rides the fill's leading
 * edge — drag it backward and the fill compresses under tension (edge glow
 * brightens with stretch), release and it slingshots past the true value on
 * an underdamped spring, wobbling like liquid before settling exactly right.
 * Also hosts the #30 boost overlay and the #31 loader bot.
 */
function GoalBar({
  runKey,
  progress,
  fillPct,
  overclocked,
  motionSafe,
}: {
  runKey: number;
  progress: number;
  fillPct: number;
  overclocked: boolean;
  motionSafe: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  // sling offset in percent points: negative while pulling, overshoots
  // positive on release (low damping), settles at 0 = true value
  const sling = useSpring(0, { stiffness: 210, damping: 9 });
  const slingWidth = useTransform(sling, (offset) => `${Math.max(0, Math.min(100, fillPct + offset))}%`);
  const tension = useTransform(sling, [-60, 0], [1, 0], { clamp: true });
  const edgeGlow = useTransform(tension, (value) => `0 0 ${12 + value * 18}px rgb(var(--accent-rgb) / ${0.6 + value * 0.4})`);
  const dragState = useRef({ active: false, startX: 0 });

  const onDown = (event: React.PointerEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (!motionSafe || window.matchMedia("(hover: none)").matches) return;
    dragState.current = { active: true, startX: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (!dragState.current.active) return;
    event.preventDefault();
    const width = trackRef.current?.getBoundingClientRect().width ?? 300;
    const deltaPct = ((event.clientX - dragState.current.startX) / width) * 100;
    // only pulling backward builds tension; forward drags do nothing
    sling.jump(Math.max(-progress * 0.85, Math.min(0, deltaPct)));
  };
  const onUp = (event: React.PointerEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (!dragState.current.active) return;
    dragState.current.active = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
    sling.set(0); // spring back — overshoots past true value, then settles
  };

  return (
    <>
      <div ref={trackRef} className="relative mt-4 h-1 w-full rounded-full bg-foreground/8">
        {motionSafe ? (
          <m.div className="absolute inset-y-0 left-0 overflow-hidden rounded-full" style={{ width: slingWidth, boxShadow: edgeGlow }}>
            <m.div
              key={`bar-${runKey}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full w-full origin-left rounded-full ${overclocked ? "bg-white/90" : "bg-accent"}`}
            />
          </m.div>
        ) : (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent"
            style={{ width: `${fillPct}%`, boxShadow: "0 0 12px rgb(var(--accent-rgb) / 0.6)" }}
          />
        )}
        {/* #90 grabbable leading-edge handle */}
        {motionSafe && (
          <m.span
            aria-hidden="true"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onClick={(event) => event.stopPropagation()}
            style={{ left: slingWidth }}
            className="absolute -top-[5px] z-10 h-[14px] w-[7px] -translate-x-1/2 cursor-grab touch-none rounded-sm border border-accent/70 bg-background shadow-[0_0_8px_rgb(var(--accent-rgb)/0.6)] active:cursor-grabbing"
          />
        )}
      </div>
      {motionSafe && (
        <div className="pointer-events-none relative h-0" aria-hidden="true">
          <m.span
            className="absolute -top-[7px] flex h-2.5 w-3 -translate-x-1/2 items-center justify-center rounded-sm bg-accent"
            style={{ left: slingWidth }}
          >
            <span className="robot-eye h-1 w-1 rounded-full bg-background" />
          </m.span>
        </div>
      )}
    </>
  );
}

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
  // #30 overclock: rapid clicks add a temporary boost that leaks back
  const [boosts, setBoosts] = useState<Record<string, number>>({});
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const motionSafe = !reducedMotion && !perfLite;
  const percentFormatter = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  });

  // Leak the boost back toward zero like a pressure gauge (time-based decay).
  useEffect(() => {
    if (!motionSafe) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      setBoosts((prev) => {
        const keys = Object.keys(prev);
        if (keys.length === 0) return prev;
        const next: Record<string, number> = {};
        let changed = false;
        for (const key of keys) {
          const value = Math.max(0, prev[key] - dt * 16);
          if (value > 0.1) next[key] = value;
          if (value !== prev[key]) changed = true;
        }
        return changed ? next : prev;
      });
    }, 80);
    return () => clearInterval(id);
  }, [motionSafe]);

  const rerun = (id: string) => {
    setPulse((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));
    if (motionSafe) setBoosts((b) => ({ ...b, [id]: Math.min(45, (b[id] ?? 0) + 4) }));
  };

  return (
    <section id="goals" className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <div className={`relative z-10 ${CONTAINER}`}>
        <div className="mx-auto max-w-3xl 3xl:max-w-5xl">
        <SectionHeading
        index="10"
          kicker={t.goals.kicker}
          title={t.goals.title}
          description={t.goals.description}
        />

        <RevealGroup stagger={0.1} className="mt-14 flex flex-col gap-4">
          {t.goals.items.map((goal, index) => {
            const { progress } = goalsMeta[goal.id];
            const runKey = pulse[goal.id] ?? 0;
            const boost = boosts[goal.id] ?? 0;
            const fillPct = Math.min(100, progress + boost);
            const overclocked = fillPct >= 99.5;
            return (
              <m.div
                key={goal.id}
                custom={{ index, motionSafe }}
                variants={goalVariants}
                whileHover={motionSafe ? "hover" : undefined}
                role="button"
                tabIndex={0}
                aria-label={goal.title}
                onClick={() => rerun(goal.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    rerun(goal.id);
                  }
                }}
                className="surface surface-hover tap-pop cursor-pointer rounded-lg p-6 outline-none [transform-style:preserve-3d]"
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
                  <span className="relative font-mono text-sm tabular-nums text-accent">
                    {boost > 0.5 ? (
                      <span className={overclocked ? "text-accent" : ""}>
                        {percentFormatter.format(fillPct / 100)}
                      </span>
                    ) : (
                      <m.span
                        key={`pct-${runKey}`}
                        initial={motionSafe ? { scale: 0.6, opacity: 0 } : false}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.35 }}
                        className="inline-block"
                      >
                        <DecryptPercent
                          value={progress}
                          runKey={runKey}
                          format={(fraction) => percentFormatter.format(fraction)}
                          animate={motionSafe}
                        />
                      </m.span>
                    )}
                    {overclocked && (
                      <span className="absolute -right-1 -top-5 whitespace-nowrap rounded-sm border border-accent/50 bg-background/80 px-1.5 py-0.5 text-[0.5rem] uppercase tracking-[0.1em] text-accent">
                        {t.goals.aheadTag}
                      </span>
                    )}
                  </span>
                </div>

                <GoalBar
                  runKey={runKey}
                  progress={progress}
                  fillPct={fillPct}
                  overclocked={overclocked}
                  motionSafe={motionSafe}
                />
              </m.div>
            );
          })}
        </RevealGroup>
        </div>
      </div>
    </section>
  );
}
