"use client";

import { useEffect, useRef } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { accentAt } from "@/lib/scenePhases";

/**
 * Site-wide "new colors as you scroll" effect: drives the --accent /
 * --accent-rgb CSS variables from scroll position through the same
 * green → red → blue → gold sweep the old video background used, so every
 * surface/glow-text/accent element that already reads var(--accent) shifts
 * hue automatically — no per-component changes needed. Renders nothing.
 */
export function AccentCycler() {
  const progressRef = useScrollProgress();
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const tick = () => {
      const [r, g, b] = accentAt(progressRef.current);
      root.style.setProperty("--accent", `rgb(${r} ${g} ${b})`);
      root.style.setProperty("--accent-rgb", `${r} ${g} ${b}`);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [progressRef]);

  return null;
}
