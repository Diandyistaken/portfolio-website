"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { usePerfLite } from "./SectionBackdrop";

type Boundary = { el: HTMLElement; label: string };

/**
 * #72 Section boundary scanline: while scrolling, a 1px accent line rides the
 * exact screen position of the nearest section boundary (page-anchored — it
 * moves with scroll, not a timer), stamped "SECTOR 04 // PROJECTS". It fades
 * out ~400ms after scrolling stops, leaving boundaries as felt checkpoints.
 */
export function SectionScanline() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [line, setLine] = useState<{ y: number; label: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reducedMotion || perfLite) return;
    let boundaries: Boundary[] = [];
    const collect = () => {
      boundaries = Array.from(document.querySelectorAll<HTMLElement>("main section[id]")).map(
        (el, index) => ({
          el,
          label: `SECTOR ${String(index + 1).padStart(2, "0")} // ${el.id.toUpperCase()}`,
        }),
      );
    };
    collect();
    const recollect = setTimeout(collect, 1500); // after hydration settles

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const viewport = window.innerHeight;
        let found: { y: number; label: string } | null = null;
        for (const boundary of boundaries) {
          const top = boundary.el.getBoundingClientRect().top;
          if (top > viewport * 0.06 && top < viewport * 0.94) {
            found = { y: top, label: boundary.label };
            break;
          }
        }
        setLine(found);
        setVisible(found !== null);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setVisible(false), 420);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      clearTimeout(recollect);
    };
  }, [reducedMotion, perfLite]);

  if (reducedMotion || perfLite || !line) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 z-20 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ top: line.y }}
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent shadow-[0_0_12px_rgb(var(--accent-rgb)/0.5)]" />
      <span className="absolute right-6 top-1 font-mono text-[0.55rem] tracking-[0.2em] text-accent/70 sm:right-10">
        {line.label}
      </span>
    </div>
  );
}
