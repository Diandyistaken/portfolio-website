"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { usePerfLite } from "./SectionBackdrop";

/**
 * #49 Sonar reveal: double-click empty background to emit an expanding sonar
 * ring; for ~1.5s the body gets a `sonar-flash` class so every proximity toy
 * on screen outlines itself — a discoverability meta-toy for finding all the
 * other toys. Ignores double-clicks on interactive elements / text.
 */
export function SonarReveal() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [pings, setPings] = useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = useRef(0);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reducedMotion || perfLite) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const onDouble = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      // only fire on "empty" background, not on toys/links/inputs/text
      if (target && target.closest("a, button, input, textarea, [role='button'], h1, h2, h3, p")) return;
      if (window.getSelection()?.toString()) return;

      idRef.current += 1;
      const id = idRef.current;
      setPings((prev) => [...prev.slice(-2), { id, x: event.clientX, y: event.clientY }]);
      setTimeout(() => setPings((prev) => prev.filter((p) => p.id !== id)), 1200);

      document.body.classList.add("sonar-flash");
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => document.body.classList.remove("sonar-flash"), 1500);
    };

    window.addEventListener("dblclick", onDouble);
    return () => {
      window.removeEventListener("dblclick", onDouble);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      document.body.classList.remove("sonar-flash");
    };
  }, [reducedMotion, perfLite]);

  if (reducedMotion || perfLite) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true">
      <AnimatePresence>
        {pings.map((ping) => (
          <m.span
            key={ping.id}
            initial={{ opacity: 0.7, scale: 0 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="absolute h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/50"
            style={{ left: ping.x, top: ping.y }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
