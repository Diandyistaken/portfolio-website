"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { usePerfLite } from "./SectionBackdrop";

const IDLE_MS = 45000;
const GAME_TIMEOUT_MS = 30000;
const BLIP_ANGLES = [70, 180, 300];
const HIT_WINDOW_DEG = 16;

/**
 * #119 Idle sentry minigame: after 45s of stillness the robot deploys a
 * one-button radar — a sweep rotates past three blips; click (or Space) when
 * the sweep crosses one to neutralize it. 3/3 fires the SENTRY badge and a
 * robot high-five. Scrolling or clicking elsewhere dismisses it instantly;
 * never auto-appears under reduced-motion/perf-lite.
 */
export function IdleSentry() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [open, setOpen] = useState(false);
  const [neutralized, setNeutralized] = useState<number[]>([]);
  const [won, setWon] = useState(false);
  const openRef = useRef(false);
  const angleRef = useRef(0);
  const sweepRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const wonOnce = useRef(false);

  // idle detection
  useEffect(() => {
    if (reducedMotion || perfLite) return;
    if (window.matchMedia("(hover: none)").matches) return;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const arm = () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (openRef.current) return;
      idleTimer = setTimeout(() => {
        if (wonOnce.current) return; // one victory per visit is enough
        openRef.current = true;
        setOpen(true);
        setNeutralized([]);
        setWon(false);
      }, IDLE_MS);
    };
    const reset = () => {
      // any real activity while the game is up dismisses it (scroll/keys);
      // clicks inside the radar are handled by the panel itself
      if (openRef.current) return;
      arm();
    };
    const dismissOnScroll = () => {
      if (openRef.current) {
        openRef.current = false;
        setOpen(false);
      }
      arm();
    };
    window.addEventListener("mousemove", reset, { passive: true });
    window.addEventListener("keydown", reset);
    window.addEventListener("scroll", dismissOnScroll, { passive: true });
    arm();
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("scroll", dismissOnScroll);
    };
  }, [reducedMotion, perfLite]);

  const fire = useCallback(() => {
    const sweep = angleRef.current;
    setNeutralized((previous) => {
      const hit = BLIP_ANGLES.findIndex(
        (blip, index) =>
          !previous.includes(index) &&
          Math.abs(((sweep - blip + 540) % 360) - 180) < HIT_WINDOW_DEG,
      );
      if (hit === -1) return previous;
      const next = [...previous, hit];
      if (next.length >= BLIP_ANGLES.length) {
        wonOnce.current = true;
        setWon(true);
        window.dispatchEvent(new Event("app:sentry-win"));
        setTimeout(() => {
          openRef.current = false;
          setOpen(false);
        }, 2200);
      }
      return next;
    });
  }, []);

  // sweep rotation + auto-timeout while open
  useEffect(() => {
    if (!open) return;
    const startedAt = performance.now();
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const now = performance.now();
      if (now - startedAt > GAME_TIMEOUT_MS) {
        openRef.current = false;
        setOpen(false);
        return;
      }
      angleRef.current = ((now - startedAt) / 2400) * 360 % 360;
      if (sweepRef.current) sweepRef.current.style.transform = `rotate(${angleRef.current.toFixed(1)}deg)`;
    };
    rafRef.current = requestAnimationFrame(loop);

    const onSpace = (event: KeyboardEvent) => {
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        fire();
      }
    };
    window.addEventListener("keydown", onSpace);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onSpace);
    };
  }, [open, fire]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="terminal-panel fixed bottom-28 right-6 z-[75] w-48 rounded-lg border border-accent/50 p-3 shadow-[0_20px_70px_rgb(0_0_0/0.65)]"
          aria-hidden="true"
        >
          <p className="font-mono text-[0.55rem] tracking-[0.2em] text-accent">SENTRY DRILL — {neutralized.length}/3</p>
          <button type="button" tabIndex={-1} onClick={fire} className="relative mx-auto mt-2 block h-36 w-36 cursor-crosshair overflow-hidden rounded-full border border-accent/30">
            {/* rings */}
            <span className="absolute inset-4 rounded-full border border-accent/15" />
            <span className="absolute inset-10 rounded-full border border-accent/15" />
            {/* blips */}
            {BLIP_ANGLES.map((blip, index) => (
              <span
                key={blip}
                className={`absolute h-1.5 w-1.5 rounded-full transition-colors ${
                  neutralized.includes(index) ? "bg-foreground/25" : "bg-accent shadow-[0_0_8px_rgb(var(--accent-rgb)/0.9)]"
                }`}
                style={{
                  left: `${50 + Math.sin((blip * Math.PI) / 180) * 34}%`,
                  top: `${50 - Math.cos((blip * Math.PI) / 180) * 34}%`,
                }}
              />
            ))}
            {/* rotating sweep */}
            <div ref={sweepRef} className="absolute inset-0 origin-center">
              <span
                className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom bg-gradient-to-t from-accent/90 to-transparent"
                style={{ boxShadow: "0 0 8px rgb(var(--accent-rgb) / 0.6)" }}
              />
            </div>
            <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
          </button>
          <p className="mt-2 text-center font-mono text-[0.52rem] text-muted">
            {won ? "SENTRY ✓ — perimeter secured" : "click / space when the sweep crosses a blip"}
          </p>
        </m.div>
      )}
    </AnimatePresence>
  );
}
