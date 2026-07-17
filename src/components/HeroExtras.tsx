"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { usePerfLite } from "./SectionBackdrop";

// "coding since" epoch — drives the live uptime odometer
const UPTIME_START = Date.UTC(2020, 8, 1); // 2020-09-01

/**
 * #10 Breach meter: press-and-hold the primary CTA to charge an accent ring;
 * at 100% it "breaches" (shockwave + glitch) and smooth-scrolls to contact.
 * A normal quick tap still follows the anchor — zero conversion friction.
 */
export function BreachCTA({ label, targetId }: { label: string; targetId: string }) {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [charge, setCharge] = useState(0);
  const [breached, setBreached] = useState(0);
  const [glitch, setGlitch] = useState<string | null>(null);
  const holding = useRef(false);
  const raf = useRef(0);
  const glitchStep = useRef(0);

  const canHold = !reducedMotion && !perfLite;

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const fireBreach = () => {
    setBreached((n) => n + 1);
    // brief label glitch via a rotating swap set (no Math.random in render)
    const glitches = ["#" + label.slice(1), label.slice(0, -1) + "_", "0x" + label.slice(2)];
    glitchStep.current += 1;
    setGlitch(glitches[glitchStep.current % glitches.length]);
    setTimeout(() => setGlitch(null), 220);
    setTimeout(() => setCharge(0), 260);
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  };

  const onDown = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (!canHold || window.matchMedia("(hover: none)").matches) return;
    holding.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (raf.current) cancelAnimationFrame(raf.current);
    // the timing loop lives inside the handler so performance.now() is never
    // reachable from render (react-compiler purity rule)
    const startedAt = performance.now();
    const loop = () => {
      if (!holding.current) return;
      const progress = Math.min(100, ((performance.now() - startedAt) / 1100) * 100);
      setCharge(progress);
      if (progress >= 100) {
        holding.current = false;
        fireBreach();
        return;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  };
  const onUp = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (!holding.current) return;
    holding.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
    // decay whatever charge remains
    const decay = () => {
      setCharge((current) => {
        const next = Math.max(0, current - 7);
        if (next > 0) raf.current = requestAnimationFrame(decay);
        return next;
      });
    };
    raf.current = requestAnimationFrame(decay);
  };

  return (
    <a
      href={`#${targetId}`}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onClickCapture={(event) => {
        // if the hold reached breach, we already scrolled — swallow the click
        if (charge >= 100) event.preventDefault();
      }}
      className="tap-pop group relative flex items-center gap-2 overflow-visible rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-[transform,box-shadow] hover:scale-[1.02] hover:shadow-[0_0_32px_rgb(var(--accent-rgb)/0.3)]"
    >
      {canHold && charge > 1 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1 rounded-full"
          style={{
            background: `conic-gradient(rgb(var(--accent-rgb)) ${charge}%, transparent 0)`,
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          }}
        />
      )}
      <AnimatePresence>
        {breached > 0 && (
          <m.span
            key={breached}
            aria-hidden="true"
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{ opacity: 0, scale: 2.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-accent"
          />
        )}
      </AnimatePresence>
      <span className="relative">{glitch ?? label}</span>
      <ArrowRight size={16} className="relative transition-transform duration-200 group-hover:translate-x-1" />
    </a>
  );
}

/** #57 Uptime odometer: a live ticking "career uptime" line. */
export function UptimeCounter() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // seed the value from a rAF callback (not synchronously in the effect
    // body) to satisfy the react-compiler no-setState-in-effect rule
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    let id: ReturnType<typeof setInterval> | null = null;
    if (!(reducedMotion || perfLite)) {
      id = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => {
      cancelAnimationFrame(raf);
      if (id) clearInterval(id);
    };
  }, [reducedMotion, perfLite]);

  if (now === null) return null;
  let seconds = Math.floor((now - UPTIME_START) / 1000);
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <p className="mt-4 border-t border-foreground/10 pt-3 font-mono text-[0.62rem] tracking-wide text-muted" aria-hidden="true">
      <span className="text-accent/70">UPTIME</span> {days}d {h}:{m}:{s}
    </p>
  );
}

/** #58 Status LED rack: four blinking, labelled LEDs with hover tooltips. */
export function LedRack({ tips }: { tips: string[] }) {
  const labels = ["UPTIME", "FOCUS", "COFFEE", "DEPLOY"];
  const [hot, setHot] = useState(false);

  const wrap = (index: number, node: ReactNode) => (
    <div key={labels[index]} className="group/led relative flex flex-col items-center gap-1">
      {node}
      <span className="font-mono text-[0.44rem] uppercase tracking-[0.12em] text-muted/70">{labels[index]}</span>
      <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded border border-foreground/15 bg-background/95 px-2 py-1 font-mono text-[0.56rem] text-foreground/85 group-hover/led:block">
        {tips[index]}
      </span>
    </div>
  );

  return (
    <div className="mt-4 flex items-start justify-between gap-2 border-t border-foreground/10 pt-3" aria-hidden="true">
      {labels.map((label, index) =>
        wrap(
          index,
          <button
            type="button"
            onClick={index === 2 ? () => setHot((v) => !v) : undefined}
            className={index === 2 ? "cursor-pointer" : "cursor-default"}
            tabIndex={-1}
          >
            <m.span
              className="block h-2 w-2 rounded-full bg-accent"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{
                duration: index === 2 && hot ? 0.5 : 1.6 + index * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ boxShadow: "0 0 6px rgb(var(--accent-rgb) / 0.8)" }}
            />
          </button>,
        ),
      )}
    </div>
  );
}
