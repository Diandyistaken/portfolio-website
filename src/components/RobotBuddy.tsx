"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion, useSpring } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePerfLite } from "./SectionBackdrop";

const SLEEP_AFTER_MS = 18000;
const BUBBLE_MS = 3200;
const MAX_TILT = 16;

/**
 * Corner robot companion: the head tilts in 3D toward the cursor, the pupils
 * track it, it blinks, dozes off when the mouse goes quiet, and answers
 * clicks with little speech bubbles. Listens for the site-wide "hack"
 * easter egg and panics accordingly. Desktop + fine pointer only.
 */
export function RobotBuddy() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const rootRef = useRef<HTMLDivElement>(null);

  const [enabled, setEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [alerted, setAlerted] = useState(false);

  // Head rotation + pupil offset follow the cursor through springs, so the
  // motion stays soft even when the pointer jumps across the screen.
  const rotateX = useSpring(0, { stiffness: 120, damping: 14 });
  const rotateY = useSpring(0, { stiffness: 120, damping: 14 });
  const pupilX = useSpring(0, { stiffness: 160, damping: 16 });
  const pupilY = useSpring(0, { stiffness: 160, damping: 16 });

  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageIndex = useRef(0);

  useEffect(() => {
    // Fine pointer + hover only — there is no cursor to follow on touch.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const wide = window.matchMedia("(min-width: 1024px)");
    const update = () => setEnabled(fine.matches && wide.matches);
    update();
    fine.addEventListener("change", update);
    wide.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      wide.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled || dismissed || reducedMotion || perfLite) return;

    let raf = 0;
    let sleepTimer: ReturnType<typeof setTimeout> | null = null;

    const armSleep = () => {
      if (sleepTimer) clearTimeout(sleepTimer);
      sleepTimer = setTimeout(() => setSleeping(true), SLEEP_AFTER_MS);
    };

    const onMove = (event: MouseEvent) => {
      setSleeping(false);
      armSleep();
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const root = rootRef.current;
        if (!root) return;
        const bounds = root.getBoundingClientRect();
        const cx = bounds.left + bounds.width / 2;
        const cy = bounds.top + bounds.height / 2;
        const dx = (event.clientX - cx) / window.innerWidth;
        const dy = (event.clientY - cy) / window.innerHeight;
        rotateY.set(Math.max(-MAX_TILT, Math.min(MAX_TILT, dx * MAX_TILT * 2.4)));
        rotateX.set(Math.max(-MAX_TILT, Math.min(MAX_TILT, -dy * MAX_TILT * 2.4)));
        pupilX.set(Math.max(-3, Math.min(3, dx * 10)));
        pupilY.set(Math.max(-2.5, Math.min(2.5, dy * 8)));
      });
    };

    armSleep();
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
      if (sleepTimer) clearTimeout(sleepTimer);
    };
  }, [enabled, dismissed, reducedMotion, perfLite, rotateX, rotateY, pupilX, pupilY]);

  const showBubble = (text: string) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setBubble(text);
    bubbleTimer.current = setTimeout(() => setBubble(null), BUBBLE_MS);
  };

  // Site-wide easter egg hook: EasterEgg dispatches this when "hack" is
  // typed. Bubble logic is inlined so the effect only closes over `t`.
  useEffect(() => {
    const onHack = () => {
      setSleeping(false);
      setAlerted(true);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      setBubble(t.robot.hackMessage);
      bubbleTimer.current = setTimeout(() => setBubble(null), BUBBLE_MS);
      setTimeout(() => setAlerted(false), 2600);
    };
    window.addEventListener("app:hack-egg", onHack);
    return () => window.removeEventListener("app:hack-egg", onHack);
  }, [t]);

  useEffect(() => {
    return () => {
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    };
  }, []);

  const handleClick = () => {
    if (sleeping) {
      setSleeping(false);
      return;
    }
    const messages = t.robot.messages;
    showBubble(messages[messageIndex.current % messages.length]);
    messageIndex.current += 1;
  };

  if (!enabled || dismissed || reducedMotion || perfLite) return null;

  return (
    <div ref={rootRef} className="group/robot fixed bottom-6 right-6 z-40 hidden lg:block" style={{ perspective: 400 }}>
      <AnimatePresence>
        {bubble && (
          <m.div
            key={bubble}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="surface absolute bottom-full right-0 mb-3 w-max max-w-[15rem] rounded-lg rounded-br-sm px-3.5 py-2 font-mono text-[0.68rem] leading-relaxed text-foreground/90"
          >
            {bubble}
          </m.div>
        )}
      </AnimatePresence>

      {sleeping && (
        <span
          aria-hidden="true"
          className="absolute -top-4 right-1 font-mono text-xs text-muted"
          title={t.robot.sleepingMessage}
        >
          z<span className="text-[0.6rem]">z</span>
          <span className="text-[0.5rem]">z</span>
        </span>
      )}

      <button
        type="button"
        onClick={handleClick}
        aria-label={t.robot.label}
        className="group relative block cursor-pointer outline-none focus-visible:rounded-2xl"
      >
        <m.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          animate={alerted ? { x: [0, -3, 3, -3, 3, 0] } : undefined}
          transition={alerted ? { duration: 0.45 } : undefined}
          className="robot-body relative"
        >
          {/* antenna */}
          <span className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-foreground/30" aria-hidden="true" />
          <span
            className={`robot-antenna-tip absolute -top-4 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full ${
              alerted ? "bg-amber-400" : "bg-accent"
            }`}
            aria-hidden="true"
          />

          {/* head */}
          <div className="surface relative h-14 w-16 rounded-2xl border border-foreground/15 shadow-[0_10px_30px_rgb(0_0_0/0.5)]">
            {/* face plate */}
            <div className="absolute inset-1.5 rounded-xl bg-[rgb(var(--background-rgb)/0.85)]">
              {/* eyes */}
              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center gap-3">
                {[0, 1].map((eye) => (
                  <span
                    key={eye}
                    className={`robot-eye relative h-3.5 w-2.5 overflow-hidden rounded-full ${
                      sleeping ? "!h-0.5 bg-accent/70" : "bg-accent/20"
                    }`}
                  >
                    {!sleeping && (
                      <m.span
                        style={{ x: pupilX, y: pupilY }}
                        className={`absolute inset-x-0 top-1/2 mx-auto h-2 w-2 -translate-y-1/2 rounded-full ${
                          alerted ? "bg-amber-400" : "bg-accent"
                        } shadow-[0_0_6px_rgb(var(--accent-rgb)/0.9)]`}
                      />
                    )}
                  </span>
                ))}
              </div>
              {/* mouth: tiny status line, smiles on hover */}
              <span
                className="absolute bottom-1.5 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-accent/50 transition-all duration-300 group-hover:h-[3px] group-hover:w-5 group-hover:rounded-b-full"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* neck + shoulders hint */}
          <div className="mx-auto mt-0.5 h-1.5 w-6 rounded-b-md bg-foreground/15" aria-hidden="true" />
        </m.div>
      </button>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t.robot.dismissLabel}
        className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full border border-foreground/20 bg-background text-muted transition-colors hover:text-foreground group-hover/robot:flex"
      >
        <X size={10} />
      </button>
    </div>
  );
}
