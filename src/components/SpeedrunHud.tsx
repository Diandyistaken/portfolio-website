"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const TRIGGER = "speedrun";
const BEST_KEY = "mm-speedrun-best";
const MAX_RUN_MS = 10 * 60 * 1000;
const RESULT_MS = 9000;

function formatMs(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const tenths = Math.floor((ms % 1000) / 100);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

// terminal artifacts — deliberately English, like the other stamps
function rankFor(ms: number): { rank: string; line: string } {
  if (ms < 30000) return { rank: "S-TIER", line: "you skim like a senior recruiter" };
  if (ms < 60000) return { rank: "A-TIER", line: "efficient. respect." };
  if (ms < 120000) return { rank: "B-TIER", line: "thorough reader detected" };
  return { rank: "C-TIER", line: "the scenic route — also valid" };
}

type RunResult = { ms: number; rank: string; line: string; pb: boolean; best: number };

/**
 * #48 Recruiter speedrun: typing "speedrun" anywhere starts a visible
 * mm:ss.ms HUD timer; copying the email (app:email-copied) stops it and
 * prints a shareable rank card. Best time persists as a ghost target.
 */
export function SpeedrunHud() {
  const reducedMotion = useReducedMotion();
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const startRef = useRef(0);
  const runningRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(BEST_KEY);
        if (raw) setBest(Number(raw));
      } catch {
        // storage unavailable — no ghost target
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let buffer = "";

    const stopRun = () => {
      runningRef.current = false;
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      setElapsed(null);
    };

    const startRun = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      startRef.current = performance.now();
      setResult(null);
      if (hideRef.current) clearTimeout(hideRef.current);
      tickRef.current = setInterval(() => {
        const ms = performance.now() - startRef.current;
        if (ms > MAX_RUN_MS) {
          stopRun();
          return;
        }
        setElapsed(ms);
      }, 47);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        stopRun();
        setResult(null);
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (event.key.length !== 1) return;
      buffer = (buffer + event.key.toLowerCase()).slice(-TRIGGER.length);
      if (buffer === TRIGGER) {
        buffer = "";
        startRun();
      }
    };

    const onCopied = () => {
      if (!runningRef.current) return;
      const ms = performance.now() - startRef.current;
      stopRun();
      setBest((previousBest) => {
        const pb = previousBest === null || ms < previousBest;
        const nextBest = pb ? ms : previousBest;
        try {
          localStorage.setItem(BEST_KEY, String(Math.round(nextBest)));
        } catch {
          // ignore
        }
        setResult({ ms, ...rankFor(ms), pb, best: nextBest });
        return nextBest;
      });
      if (hideRef.current) clearTimeout(hideRef.current);
      hideRef.current = setTimeout(() => setResult(null), RESULT_MS);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("app:email-copied", onCopied);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("app:email-copied", onCopied);
      if (tickRef.current) clearInterval(tickRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, []);

  return (
    <>
      {/* live HUD timer */}
      <AnimatePresence>
        {elapsed !== null && (
          <m.div
            initial={reducedMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            className="fixed right-4 top-16 z-[90] rounded border border-accent/50 bg-background/90 px-3 py-2 font-mono text-xs text-foreground shadow-[0_0_20px_rgb(var(--accent-rgb)/0.2)]"
            aria-hidden="true"
          >
            <span className="text-accent">SPEEDRUN</span> {formatMs(elapsed)}
            {best !== null && <span className="ml-2 text-muted">PB {formatMs(best)}</span>}
            <span className="mt-1 block text-[0.58rem] text-muted">objective: copy the email</span>
          </m.div>
        )}
      </AnimatePresence>

      {/* rank card */}
      <AnimatePresence>
        {result && (
          <m.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed left-1/2 top-1/3 z-[95] w-72 -translate-x-1/2 rounded-lg border border-accent/60 bg-background/95 p-5 text-center font-mono shadow-[0_24px_80px_rgb(0_0_0/0.6),0_0_32px_rgb(var(--accent-rgb)/0.18)]"
            aria-hidden="true"
          >
            <p className="text-[0.6rem] tracking-[0.3em] text-muted">RECRUITER SPEEDRUN</p>
            <p className="mt-2 text-2xl font-bold text-accent">
              {result.rank}: {formatMs(result.ms)}
            </p>
            <p className="mt-2 text-[0.68rem] text-foreground/85">{result.line}</p>
            <p className="mt-3 border-t border-foreground/10 pt-2 text-[0.6rem] text-muted">
              {result.pb ? "NEW PERSONAL BEST ✓" : `personal best: ${formatMs(result.best)}`}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
