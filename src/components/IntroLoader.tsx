"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "portfolio-intro-seen";
const PROGRESS_DURATION = 1300;
const EXIT_DURATION = 600;

export function IntroLoader() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const initiatedRef = useRef(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Storage access can throw (Safari private mode, cookies disabled by
    // policy) — treat that the same as "no record of a previous visit"
    // rather than letting it crash the whole component.
    let alreadySeen = false;
    try {
      alreadySeen = Boolean(sessionStorage.getItem(SESSION_KEY));
    } catch {
      alreadySeen = false;
    }

    if (reducedMotion || (!initiatedRef.current && alreadySeen)) {
      return;
    }

    initiatedRef.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // best-effort only; the intro just replays next visit
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.min((now - start) / PROGRESS_DURATION, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setProgress(Math.round(eased * 100));

      if (elapsed < 1) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      setExiting(true);
      exitTimerRef.current = window.setTimeout(() => {
        document.body.style.overflow = previousOverflow;
        setVisible(false);
      }, EXIT_DURATION);
    };

    frameRef.current = requestAnimationFrame((now) => {
      setVisible(true);
      frameRef.current = requestAnimationFrame(() => tick(now));
    });

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (exitTimerRef.current !== null) clearTimeout(exitTimerRef.current);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`intro-loader ${exiting ? "intro-loader--exiting" : ""}`}
      aria-hidden="true"
    >
      <div className="intro-loader__content">
        <div className="intro-loader__mark font-display">MMC</div>
        <div className="intro-loader__status font-mono">
          <div className="intro-loader__track">
            <span style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
          <span className="intro-loader__count">{progress.toString().padStart(3, "0")}%</span>
        </div>
      </div>
    </div>
  );
}
