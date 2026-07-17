"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { usePerfLite } from "./SectionBackdrop";

const STEPS = [
  { id: "experience", label: "SIGNAL 01 // EXPERIENCE" },
  { id: "projects", label: "SIGNAL 02 // PROJECTS" },
  { id: "contact", label: "SIGNAL 03 // CONTACT" },
];
const STEP_MS = 3400;

/**
 * #106 Recruiter mode: a [RECRUITER] toggle in the navbar HUD. Enabling it
 * salutes the robot (app:recruiter-mode), pulses the KPIs and auto-scrolls a
 * guided line through experience → projects → contact with typed callouts.
 * Any wheel/touch/key input cancels the tour instantly; toggling off restores
 * everything.
 */
export function RecruiterMode() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [on, setOn] = useState(false);
  const [callout, setCallout] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      cancelRef.current?.();
    };
  }, []);

  const stopTour = () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
    setCallout(null);
    cancelRef.current?.();
    cancelRef.current = null;
  };

  const toggle = () => {
    if (on) {
      stopTour();
      setOn(false);
      return;
    }
    setOn(true);
    window.dispatchEvent(new Event("app:recruiter-mode"));
    if (reducedMotion || perfLite) return; // salute + KPI pulse only, no auto-scroll

    STEPS.forEach((step, index) => {
      timers.current.push(
        setTimeout(() => {
          document.getElementById(step.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          setCallout(step.label);
        }, index * STEP_MS + 350),
      );
    });
    timers.current.push(setTimeout(() => setCallout(null), STEPS.length * STEP_MS + 1200));

    // the tour must be skippable on ANY real input
    const cancel = () => stopTour();
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", cancel);
    cancelRef.current = () => {
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
    };
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label="recruiter mode"
        className={`hidden h-8 items-center rounded-md border px-2 font-mono text-[0.6rem] tracking-wide transition-colors lg:flex ${
          on ? "border-accent/60 text-accent" : "border-foreground/10 text-muted hover:border-accent/40"
        }`}
      >
        [RECRUITER]
      </button>
      <AnimatePresence>
        {callout && (
          <m.p
            key={callout}
            initial={reducedMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pointer-events-none fixed left-1/2 top-20 z-[80] -translate-x-1/2 rounded border border-accent/50 bg-background/90 px-4 py-1.5 font-mono text-[0.65rem] tracking-[0.2em] text-accent"
            aria-hidden="true"
          >
            {callout}
          </m.p>
        )}
      </AnimatePresence>
    </>
  );
}
