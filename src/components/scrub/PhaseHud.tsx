"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollVideo } from "./ScrollVideoProvider";

/**
 * Right-edge mission HUD: phase readout mirroring the on-video captions,
 * a scrub progress rail and a frame counter. Purely decorative — hidden from
 * assistive tech and from small screens.
 */

const PHASES = [
  { until: 0.15, label: "SYSTEM // SECURED" },
  { until: 0.42, label: "RED TEAM // OFFENSE" },
  { until: 0.9, label: "BLUE TEAM // DEFENSE" },
  { until: 1.01, label: "SIGNAL // OPEN" },
];

const phaseLabel = (p: number) =>
  PHASES.find((ph) => p < ph.until)?.label ?? PHASES[PHASES.length - 1].label;

export function PhaseHud() {
  const { subscribe, getProgress } = useScrollVideo();
  const [label, setLabel] = useState(() => phaseLabel(getProgress()));
  const fillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let currentLabel = "";
    return subscribe((p) => {
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${p})`;
      }
      if (counterRef.current) {
        const frame = String(Math.round(p * 179)).padStart(3, "0");
        counterRef.current.textContent = `F ${frame}/179`;
      }
      const next = phaseLabel(p);
      if (next !== currentLabel) {
        currentLabel = next;
        setLabel(next);
      }
    });
  }, [subscribe]);

  return (
    <div
      aria-hidden="true"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex"
    >
      <span
        className="font-mono text-[0.6rem] tracking-[0.25em] text-accent"
        style={{
          writingMode: "vertical-rl",
          textShadow: "0 0 18px rgb(var(--accent-rgb) / 0.6)",
        }}
      >
        {label}
      </span>
      <div className="relative h-40 w-px overflow-hidden bg-white/15">
        <div
          ref={fillRef}
          className="absolute inset-0 origin-top bg-accent"
          style={{ transform: "scaleY(0)" }}
        />
      </div>
      <span
        ref={counterRef}
        className="font-mono text-[0.6rem] tracking-[0.2em] text-muted"
        style={{ writingMode: "vertical-rl" }}
      >
        F 000/179
      </span>
    </div>
  );
}
