"use client";

import dynamic from "next/dynamic";
import { useRef, useSyncExternalStore } from "react";
import { HeroAurora } from "./HeroAurora";

const HeroSequence = dynamic(() => import("./HeroSequence").then((mod) => mod.HeroSequence), {
  ssr: false,
});

const emptySubscribe = () => () => {};

// No WebGL check needed anymore — the chosen hero-lab picks are all
// CSS/SVG/Canvas2D, nothing that needs a GPU context.
function detectEligible() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (document.documentElement.classList.contains("perf-lite")) return false;
  return true;
}

/**
 * Hero atmosphere layer: the curated crossfade sequence (see
 * HeroSequence.tsx, picked from /hero-lab's 40-candidate gallery) on
 * capable devices, the flat CSS aurora everywhere else (reduced motion,
 * perf-lite). Decided once per mount.
 */
export function HeroBackdrop() {
  const decision = useRef<boolean | null>(null);
  const eligible = useSyncExternalStore(
    emptySubscribe,
    () => (decision.current ??= detectEligible()),
    () => false,
  );

  return eligible ? <HeroSequence /> : <HeroAurora />;
}
