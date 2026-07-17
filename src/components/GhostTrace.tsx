"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

const SAMPLE_MS = 900;
const MAX_SAMPLES = 500;
const BANDS = 12;

/**
 * #105 Ghost trace replay: the site quietly samples your scroll depth (this
 * session only, in memory). Typing "trace" anywhere opens a vertical minimap
 * with dwell-heat bands and a dot replaying your journey, signed off with
 * "deepest dwell: PROJECTS — good taste." The site was profiling you back.
 */
export function GhostTrace() {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [replayY, setReplayY] = useState(0); // 0..1 during replay
  const [heat, setHeat] = useState<number[]>([]);
  const [deepest, setDeepest] = useState<string | null>(null);
  const samples = useRef<number[]>([]);
  const replayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // background sampling (cheap: one number every ~0.9s)
  useEffect(() => {
    const id = setInterval(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      samples.current.push(Math.max(0, Math.min(1, window.scrollY / max)));
      if (samples.current.length > MAX_SAMPLES) samples.current.shift();
    }, SAMPLE_MS);
    return () => clearInterval(id);
  }, []);

  const openTrace = useCallback(() => {
    const data = samples.current;
    if (data.length < 3) return;
    // dwell heat per vertical band
    const bands = Array.from({ length: BANDS }, () => 0);
    for (const sample of data) bands[Math.min(BANDS - 1, Math.floor(sample * BANDS))] += 1;
    const peak = Math.max(...bands);
    setHeat(bands.map((count) => count / peak));
    // deepest dwell → section name via page offsets
    const hottest = bands.indexOf(peak) / BANDS + 0.5 / BANDS;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = hottest * max + window.innerHeight / 2;
    let name = "TOP";
    for (const section of document.querySelectorAll<HTMLElement>("main section[id]")) {
      if (section.offsetTop <= targetY) name = section.id.toUpperCase();
    }
    setDeepest(name);
    setOpen(true);
    // replay the journey
    if (replayTimer.current) clearInterval(replayTimer.current);
    let index = 0;
    setReplayY(data[0]);
    replayTimer.current = setInterval(() => {
      index += Math.max(1, Math.floor(data.length / 120));
      if (index >= data.length) {
        if (replayTimer.current) clearInterval(replayTimer.current);
        return;
      }
      setReplayY(data[index]);
    }, 40);
  }, []);

  // "trace" trigger
  useEffect(() => {
    let buffer = "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key.length !== 1) return;
      buffer = (buffer + event.key.toLowerCase()).slice(-5);
      if (buffer === "trace") {
        buffer = "";
        openTrace();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (replayTimer.current) clearInterval(replayTimer.current);
    };
  }, [openTrace]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={reducedMotion ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          className="terminal-panel fixed right-6 top-1/2 z-[80] w-44 -translate-y-1/2 rounded-lg border border-accent/50 p-3 font-mono shadow-[0_20px_70px_rgb(0_0_0/0.65)]"
          aria-hidden="true"
        >
          <div className="flex items-center justify-between">
            <p className="text-[0.55rem] tracking-[0.2em] text-accent">SESSION TRACE</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="close"
              className="grid h-5 w-5 place-items-center rounded border border-foreground/15 text-muted hover:text-foreground"
            >
              <X size={9} />
            </button>
          </div>
          {/* minimap: dwell-heat bands + replay dot */}
          <div className="relative mt-2 h-44 w-full overflow-hidden rounded border border-foreground/10">
            {heat.map((value, index) => (
              <div
                key={index}
                className="absolute inset-x-0"
                style={{
                  top: `${(index / BANDS) * 100}%`,
                  height: `${100 / BANDS}%`,
                  background: `rgb(var(--accent-rgb) / ${(value * 0.35).toFixed(3)})`,
                }}
              />
            ))}
            <m.span
              className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent-rgb)/0.9)]"
              animate={{ top: `${replayY * 100}%` }}
              transition={{ duration: 0.05, ease: "linear" }}
            />
          </div>
          <p className="mt-2 text-[0.55rem] leading-relaxed text-muted">
            deepest dwell: <span className="text-accent">{deepest}</span> — good taste.
          </p>
        </m.div>
      )}
    </AnimatePresence>
  );
}
