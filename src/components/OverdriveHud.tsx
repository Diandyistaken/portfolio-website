"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Gauge } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePerfLite } from "./SectionBackdrop";

const SHOW_ABOVE = 2600; // px/s
const HIDE_MS = 900;

/**
 * #22 Overdrive HUD: fling the page and a little speedometer flares into the
 * corner reading your scroll velocity in px/s, with a bar that pins to the
 * redline. Fades out once you slow down. Pure telemetry theater.
 */
export function OverdriveHud() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [velocity, setVelocity] = useState(0);
  const [visible, setVisible] = useState(false);

  const lastY = useRef(0);
  const lastT = useRef(0);
  const raf = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peak = useRef(0);

  useEffect(() => {
    if (reducedMotion || perfLite) return;
    lastY.current = window.scrollY;
    lastT.current = performance.now();

    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        const now = performance.now();
        const dt = now - lastT.current;
        if (dt < 40) return;
        const v = Math.abs(window.scrollY - lastY.current) / (dt / 1000);
        lastY.current = window.scrollY;
        lastT.current = now;
        if (v > SHOW_ABOVE) {
          peak.current = Math.max(peak.current * 0.9, v);
          setVelocity(peak.current);
          setVisible(true);
          if (hideTimer.current) clearTimeout(hideTimer.current);
          hideTimer.current = setTimeout(() => {
            setVisible(false);
            peak.current = 0;
          }, HIDE_MS);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [reducedMotion, perfLite]);

  if (reducedMotion || perfLite) return null;

  const fill = Math.min(1, velocity / 12000);

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 340, damping: 22 }}
          className="overdrive-hud pointer-events-none fixed right-6 top-24 z-40 hidden rounded-lg px-3 py-2 lg:block"
          aria-hidden="true"
        >
          <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-accent">
            <Gauge size={12} />
            {t.overdrive.label}
          </div>
          <p className="mt-1 font-mono text-sm tabular-nums text-foreground">
            {Math.round(velocity).toLocaleString("en-US")}
            <span className="ml-1 text-[0.6rem] text-muted">px/s</span>
          </p>
          <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-foreground/12">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-150"
              style={{ width: `${fill * 100}%`, boxShadow: "0 0 8px rgb(var(--accent-rgb) / 0.8)" }}
            />
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
