"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePerfLite } from "./SectionBackdrop";

/**
 * #23 Clearance scroll HUD: a fixed mono badge that upgrades the visitor's
 * "access level" as they scroll deeper — GUEST → USER → ANALYST → ROOT —
 * each step flipping like a keycard with an "escalation granted" flash.
 * Reaching ROOT once per visit prints a cheeky "full access: hire me".
 * Decorative (aria-hidden); disabled for reduced-motion / perf-lite.
 */
export function ClearanceHud() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();

  const [level, setLevel] = useState(0);
  const [flash, setFlash] = useState(false);
  const [fullAccess, setFullAccess] = useState(false);
  const rootReached = useRef(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reducedMotion || perfLite) return;
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const depth = max > 0 ? window.scrollY / max : 0;
        const next = depth > 0.85 ? 3 : depth > 0.55 ? 2 : depth > 0.25 ? 1 : 0;
        setLevel((current) => {
          if (next === current) return current;
          if (next > current) {
            setFlash(true);
            if (flashTimer.current) clearTimeout(flashTimer.current);
            flashTimer.current = setTimeout(() => setFlash(false), 1200);
            if (next === 3 && !rootReached.current) {
              rootReached.current = true;
              setFullAccess(true);
              if (fullTimer.current) clearTimeout(fullTimer.current);
              fullTimer.current = setTimeout(() => setFullAccess(false), 2500);
            }
          }
          return next;
        });
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      if (fullTimer.current) clearTimeout(fullTimer.current);
    };
  }, [reducedMotion, perfLite]);

  if (reducedMotion || perfLite) return null;

  const levels = t.hud.levels;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-6 top-24 z-40 hidden select-none lg:block"
    >
      <div className="overdrive-hud rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent-rgb)/0.9)]" />
          ACCESS
        </div>
        <div className="mt-0.5 h-5 overflow-hidden" style={{ perspective: 300 }}>
          <AnimatePresence mode="wait" initial={false}>
            <m.p
              key={level}
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: -90, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="font-mono text-sm font-semibold tracking-wide text-accent"
            >
              {levels[level]}
            </m.p>
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {flash && (
            <m.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-accent/80"
            >
              {t.hud.escalation}
            </m.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {fullAccess && (
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-1 font-mono text-[0.6rem] text-foreground/80"
            >
              {t.hud.fullAccess}
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
