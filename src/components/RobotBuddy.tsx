"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePerfLite } from "./SectionBackdrop";

const PATROL_AFTER_MS = 7000;
const SLEEP_AFTER_MS = 19000;
const BUBBLE_MS = 3400;
const MAX_TILT = 17;

/**
 * Corner robot companion, v2: pops in with a wave and a greeting so nobody
 * misses it, tracks the cursor with big expressive eyes (3D head tilt +
 * pupils + a soft ground shadow that slides with the tilt), leans against
 * fast scrolling, patrols with its eyes when you idle, dozes off if you
 * leave, and chats when clicked. Fine-pointer desktops only.
 */
export function RobotBuddy() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const rootRef = useRef<HTMLDivElement>(null);

  const [enabled, setEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [patrol, setPatrol] = useState(false);
  const [waving, setWaving] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [alerted, setAlerted] = useState(false);
  // Eyes widen when the cursor gets close — makes the tracking unmissable.
  const [near, setNear] = useState(false);
  const nearRef = useRef(false);
  const flinchedRef = useRef(false);

  // Head rotation + pupil offset follow the cursor through springs; the
  // shadow slides opposite the head tilt for a cheap depth cue.
  const rotateX = useSpring(0, { stiffness: 120, damping: 14 });
  const rotateY = useSpring(0, { stiffness: 120, damping: 14 });
  const pupilX = useSpring(0, { stiffness: 170, damping: 15 });
  const pupilY = useSpring(0, { stiffness: 170, damping: 15 });
  const shadowX = useTransform(rotateY, [-MAX_TILT, MAX_TILT], [7, -7]);

  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    let patrolTimer: ReturnType<typeof setTimeout> | null = null;
    let sleepTimer: ReturnType<typeof setTimeout> | null = null;
    let lastScrollY = window.scrollY;
    let scrollResetTimer: ReturnType<typeof setTimeout> | null = null;

    const armIdleTimers = () => {
      if (patrolTimer) clearTimeout(patrolTimer);
      if (sleepTimer) clearTimeout(sleepTimer);
      patrolTimer = setTimeout(() => setPatrol(true), PATROL_AFTER_MS);
      sleepTimer = setTimeout(() => {
        setPatrol(false);
        setSleeping(true);
      }, SLEEP_AFTER_MS);
    };

    const onMove = (event: MouseEvent) => {
      setSleeping(false);
      setPatrol(false);
      armIdleTimers();
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
        rotateY.set(Math.max(-MAX_TILT, Math.min(MAX_TILT, dx * MAX_TILT * 2.6)));
        rotateX.set(Math.max(-MAX_TILT, Math.min(MAX_TILT, -dy * MAX_TILT * 2.6)));

        // Target-lock: tracking gain rises as the cursor closes in — lazy
        // glance from afar, wide-eyed stare up close, startled "!" at <70px.
        const distance = Math.hypot(event.clientX - cx, event.clientY - cy);
        const gain = distance < 280 ? 1.6 : 1;
        pupilX.set(Math.max(-4.5, Math.min(4.5, dx * 14 * gain)));
        pupilY.set(Math.max(-3.5, Math.min(3.5, dy * 11 * gain)));

        const isNear = distance < 280;
        if (isNear !== nearRef.current) {
          nearRef.current = isNear;
          setNear(isNear);
          if (!isNear) flinchedRef.current = false;
        }
        if (distance < 70 && !flinchedRef.current) {
          flinchedRef.current = true;
          if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
          setBubble("!");
          bubbleTimer.current = setTimeout(() => setBubble(null), 900);
        }
      });
    };

    // Lean against fast scrolling, then spring back upright.
    const onScroll = () => {
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      if (Math.abs(delta) < 24) return;
      rotateX.set(Math.max(-12, Math.min(12, delta * 0.12)));
      if (scrollResetTimer) clearTimeout(scrollResetTimer);
      scrollResetTimer = setTimeout(() => rotateX.set(0), 180);
    };

    armIdleTimers();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (patrolTimer) clearTimeout(patrolTimer);
      if (sleepTimer) clearTimeout(sleepTimer);
      if (scrollResetTimer) clearTimeout(scrollResetTimer);
    };
  }, [enabled, dismissed, reducedMotion, perfLite, rotateX, rotateY, pupilX, pupilY]);

  // Entry greeting: wave + intro bubble shortly after the robot pops in, so
  // visitors discover both the robot and its cursor-tracking eyes.
  useEffect(() => {
    if (!enabled || dismissed || reducedMotion || perfLite) return;
    const timer = setTimeout(() => {
      setWaving(true);
      setBubble(t.robot.introMessage);
      waveTimer.current = setTimeout(() => setWaving(false), 2300);
      bubbleTimer.current = setTimeout(() => setBubble(null), BUBBLE_MS + 800);
    }, 2400);
    return () => clearTimeout(timer);
  }, [enabled, dismissed, reducedMotion, perfLite, t]);

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
      if (waveTimer.current) clearTimeout(waveTimer.current);
    };
  }, []);

  const showBubble = (text: string) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setBubble(text);
    bubbleTimer.current = setTimeout(() => setBubble(null), BUBBLE_MS);
  };

  const handleClick = () => {
    window.dispatchEvent(new Event("app:robot-click"));
    if (sleeping) {
      setSleeping(false);
      return;
    }
    if (waveTimer.current) clearTimeout(waveTimer.current);
    setWaving(true);
    waveTimer.current = setTimeout(() => setWaving(false), 2300);
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

      <m.button
        type="button"
        onClick={handleClick}
        aria-label={t.robot.label}
        initial={{ opacity: 0, y: 46, scale: 0.6 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 17, delay: 1.4 }}
        className="relative block cursor-pointer outline-none focus-visible:rounded-2xl"
      >
        <m.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          animate={alerted ? { x: [0, -3, 3, -3, 3, 0] } : undefined}
          transition={alerted ? { duration: 0.45 } : undefined}
          className={`robot-body relative ${patrol && !sleeping ? "robot-patrol" : ""}`}
        >
          {/* antenna */}
          <span className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-foreground/30" aria-hidden="true" />
          <span
            className={`robot-antenna-tip absolute -top-4 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full ${
              alerted ? "bg-amber-400" : "bg-accent"
            }`}
            aria-hidden="true"
          />

          {/* arms: right one waves on entry and on click */}
          <span
            aria-hidden="true"
            className="absolute -left-2 top-7 h-5 w-1.5 rounded-full bg-foreground/25"
          />
          <span
            aria-hidden="true"
            className={`absolute -right-2 top-7 h-5 w-1.5 rounded-full bg-foreground/25 ${
              waving ? "robot-arm--wave bg-accent/70" : ""
            }`}
          />

          {/* head */}
          <div className="surface relative h-16 w-[4.5rem] rounded-2xl border border-foreground/15 shadow-[0_10px_30px_rgb(0_0_0/0.5)]">
            {/* face plate */}
            <div className="absolute inset-1.5 rounded-xl bg-[rgb(var(--background-rgb)/0.85)]">
              {/* eyes: visible sockets + glowing pupils that chase the cursor */}
              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center gap-3">
                {[0, 1].map((eye) => (
                  <span
                    key={eye}
                    className={`robot-eye relative overflow-hidden rounded-full border border-accent/25 bg-accent/10 transition-all duration-200 ${
                      sleeping
                        ? "h-0.5 w-3.5 border-0 bg-accent/70"
                        : near
                          ? "h-[1.4rem] w-4 border-accent/50"
                          : "h-[1.15rem] w-3.5"
                    }`}
                  >
                    {!sleeping && (
                      <m.span
                        style={{ x: pupilX, y: pupilY }}
                        className={`robot-pupil absolute inset-x-0 top-1/2 mx-auto h-2.5 w-2.5 -translate-y-1/2 rounded-full ${
                          alerted ? "bg-amber-400" : "bg-accent"
                        } shadow-[0_0_8px_rgb(var(--accent-rgb)/1)]`}
                      />
                    )}
                  </span>
                ))}
              </div>
              {/* mouth: tiny status line, smiles on hover */}
              <span
                className="absolute bottom-1.5 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-accent/50 transition-all duration-300 group-hover/robot:h-[3px] group-hover/robot:w-5 group-hover/robot:rounded-b-full"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* neck + shoulders hint */}
          <div className="mx-auto mt-0.5 h-1.5 w-6 rounded-b-md bg-foreground/15" aria-hidden="true" />
        </m.div>

        {/* ground shadow slides opposite the head tilt — sells the 3D */}
        <m.span
          aria-hidden="true"
          style={{ x: shadowX }}
          className="robot-shadow absolute -bottom-2 left-1/2 h-2 w-14 -translate-x-1/2 rounded-full"
        />
      </m.button>

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
