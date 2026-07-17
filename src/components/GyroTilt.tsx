"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { usePerfLite } from "./SectionBackdrop";

const PREF_KEY = "mm-gyro-v1";

type GyroPermission = { requestPermission?: () => Promise<"granted" | "denied"> };

/**
 * #53 Gyro tilt world (mobile): device tilt drives a smoothed parallax by
 * writing --gyro-x/--gyro-y (px) on the root; `.gyro-lean` layers consume
 * them at different depths. The permission ask is styled as a terminal
 * command chip; declining stores the choice and everything stays static.
 * Touch devices only — desktop already has the cursor-proximity magic.
 */
export function GyroTilt() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [status, setStatus] = useState<"hidden" | "offer" | "active">("hidden");
  const rafRef = useRef(0);
  const listenerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null);

  // enable() is called from the tap handler (gesture context — required for
  // the iOS permission prompt) and from mount for returning opted-in users.
  const enable = useRef(async () => {
    try {
      const OrientationEvent = DeviceOrientationEvent as unknown as GyroPermission;
      if (typeof OrientationEvent.requestPermission === "function") {
        const result = await OrientationEvent.requestPermission();
        if (result !== "granted") {
          setStatus("hidden");
          return;
        }
      }
      const target = { x: 0, y: 0 };
      const current = { x: 0, y: 0 };
      let baseBeta: number | null = null;
      const onOrientation = (event: DeviceOrientationEvent) => {
        if (event.gamma === null || event.beta === null) return;
        if (baseBeta === null) baseBeta = event.beta;
        target.x = Math.max(-12, Math.min(12, event.gamma * 0.55));
        target.y = Math.max(-9, Math.min(9, (event.beta - baseBeta) * 0.4));
      };
      listenerRef.current = onOrientation;
      window.addEventListener("deviceorientation", onOrientation);
      const root = document.documentElement;
      const loop = () => {
        rafRef.current = requestAnimationFrame(loop);
        current.x += (target.x - current.x) * 0.08;
        current.y += (target.y - current.y) * 0.08;
        root.style.setProperty("--gyro-x", current.x.toFixed(2));
        root.style.setProperty("--gyro-y", current.y.toFixed(2));
      };
      rafRef.current = requestAnimationFrame(loop);
      try {
        localStorage.setItem(PREF_KEY, "on");
      } catch {
        // ignore
      }
      setStatus("active");
    } catch {
      setStatus("hidden");
    }
  });

  useEffect(() => {
    if (reducedMotion || perfLite) return;
    const raf = requestAnimationFrame(() => {
      const isTouch = window.matchMedia("(hover: none)").matches;
      if (!isTouch || typeof DeviceOrientationEvent === "undefined") return;
      let pref: string | null = null;
      try {
        pref = localStorage.getItem(PREF_KEY);
      } catch {
        // ignore
      }
      if (pref === "off") return;
      const OrientationEvent = DeviceOrientationEvent as unknown as GyroPermission;
      const needsGesture = typeof OrientationEvent.requestPermission === "function";
      if (pref === "on" && !needsGesture) {
        void enable.current();
      } else {
        setStatus("offer");
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (listenerRef.current) window.removeEventListener("deviceorientation", listenerRef.current);
      document.documentElement.style.removeProperty("--gyro-x");
      document.documentElement.style.removeProperty("--gyro-y");
    };
  }, [reducedMotion, perfLite]);

  const dismiss = () => {
    try {
      localStorage.setItem(PREF_KEY, "off");
    } catch {
      // ignore
    }
    setStatus("hidden");
  };

  return (
    <AnimatePresence>
      {status === "offer" && (
        <m.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ delay: 2, duration: 0.4 }}
          className="terminal-panel fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-foreground/15 py-2 pl-4 pr-2 shadow-[0_12px_40px_rgb(0_0_0/0.55)]"
        >
          <button
            type="button"
            onClick={() => void enable.current()}
            className="flex items-center gap-2 font-mono text-[0.65rem] text-foreground/85"
          >
            <span className="text-accent">$</span> enable --gyro-tilt
            <span className="rounded-sm border border-accent/50 px-1.5 py-0.5 text-[0.55rem] text-accent">RUN</span>
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="close"
            className="grid h-6 w-6 place-items-center rounded-full border border-foreground/15 text-muted"
          >
            <X size={11} />
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );
}
