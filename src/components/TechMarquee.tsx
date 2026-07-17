"use client";

import { useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { VelocityTrack } from "./VelocityTrack";
import { usePerfLite } from "./SectionBackdrop";

/**
 * Infinite tool ticker between hero and about. Pure CSS transform animation
 * (GPU-composited) plus a scroll-velocity skew wrapper; paused on hover,
 * disabled in perf-lite and for reduced motion.
 * #111 payload swap: as you scroll deeper, items compile down one by one
 * into their hex byte aliases (REACT → 0x52 45 41 43 54) — fully hex by the
 * footer, back to names at the top. Both marquee copies swap in sync.
 */

const ITEMS = [
  "KALI LINUX",
  "NMAP",
  "METASPLOIT",
  "WIRESHARK",
  "BETTERCAP",
  "PYTHON",
  "RED TEAM",
  "BLUE TEAM",
  "UNITY · C#",
  "NEXT.JS",
  "REACT",
  "SAP PI/PO",
  "RASPBERRY PI",
  "TRYHACKME",
] as const;

function hexAlias(item: string): string {
  const bytes = Array.from(item.replace(/[^A-Za-z0-9]/g, "").slice(0, 5), (char) =>
    char.charCodeAt(0).toString(16).toUpperCase(),
  );
  return `0x${bytes.join(" ")}${item.length > 5 ? " …" : ""}`;
}

const HEX_ALIASES = ITEMS.map(hexAlias);

function Row({ hidden, swapped }: { hidden?: boolean; swapped: number }) {
  return (
    <div aria-hidden={hidden} className="flex shrink-0 items-center">
      {ITEMS.map((item, index) => {
        const hexed = index < swapped;
        return (
          <span
            key={item}
            className="flex items-center font-mono text-[0.65rem] tracking-[0.25em] text-muted 3xl:text-sm 4xl:text-base"
          >
            <span
              data-prox
              data-prox-radius="140"
              className={`prox-wake inline-block px-5 transition-colors duration-300 3xl:px-8 4xl:px-10 ${
                hexed ? "text-accent/60" : ""
              }`}
            >
              {hexed ? HEX_ALIASES[index] : item}
            </span>
            <span className="text-accent" style={{ fontSize: "0.5rem" }}>
              ◆
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function TechMarquee() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const alive = !reducedMotion && !perfLite;

  const { scrollYProgress } = useScroll();
  const [swapped, setSwapped] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!alive) return;
    const next = Math.max(0, Math.min(ITEMS.length, Math.floor(progress * (ITEMS.length + 2))));
    setSwapped((previous) => (previous === next ? previous : next));
  });

  return (
    <div className="marquee relative overflow-hidden border-y border-white/6 py-3.5 3xl:py-5 4xl:py-6">
      <VelocityTrack>
        <div className="marquee-track flex w-max">
          <Row swapped={alive ? swapped : 0} />
          <Row hidden swapped={alive ? swapped : 0} />
        </div>
      </VelocityTrack>
      {/* #91 stowaway: a tiny robot silhouette rides the ticker */}
      <span className="marquee-stowaway pointer-events-none absolute -top-1 left-0 flex flex-col items-center" aria-hidden="true">
        <span className="flex h-2 w-3 items-center justify-center gap-[2px] rounded-sm border border-accent/50 bg-background">
          <span className="h-[3px] w-[3px] rounded-full bg-accent" />
          <span className="h-[3px] w-[3px] rounded-full bg-accent" />
        </span>
        <span className="h-1 w-2 rounded-b-sm bg-accent/40" />
      </span>
    </div>
  );
}
