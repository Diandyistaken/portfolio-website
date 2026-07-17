"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { usePerfLite } from "./SectionBackdrop";

const DRAG_MIN_PX = 34;
const COOLDOWN_MS = 3500;

type Cube = { id: number; x: number; y: number };

/**
 * #63 Robot treat toss: click-and-drag on EMPTY background spawns an ice-blue
 * data-cube that flies to the corner robot on release; the robot "catches" it
 * (app:treat-catch → "nom. 64 bytes." bubble). Drags that start on text or
 * interactive elements are ignored so selection and links keep working.
 */
export function TreatToss() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [cube, setCube] = useState<Cube | null>(null);
  const dragRef = useRef<{ active: boolean; startX: number; startY: number } | null>(null);
  const lastTossAt = useRef(0);
  const counter = useRef(0);

  useEffect(() => {
    if (reducedMotion || perfLite) return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const isEmptyGround = (target: HTMLElement | null) => {
      if (!target) return false;
      if (target.closest("a,button,input,textarea,select,canvas,[role='button'],[data-prox],img,svg")) return false;
      // only true background containers — never text nodes' wrappers
      return !/^(P|SPAN|H1|H2|H3|H4|LI|CODE|EM|STRONG|A|LABEL)$/.test(target.tagName);
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (!isEmptyGround(event.target as HTMLElement)) return;
      dragRef.current = { active: true, startX: event.clientX, startY: event.clientY };
    };
    const onUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag?.active) return;
      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      if (distance < DRAG_MIN_PX) return;
      const now = performance.now();
      if (now - lastTossAt.current < COOLDOWN_MS) return;
      lastTossAt.current = now;
      counter.current += 1;
      setCube({ id: counter.current, x: event.clientX, y: event.clientY });
    };

    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [reducedMotion, perfLite]);

  if (reducedMotion || perfLite) return null;

  return (
    <AnimatePresence>
      {cube && (
        <m.span
          key={cube.id}
          aria-hidden="true"
          initial={{ left: cube.x, top: cube.y, opacity: 0.95, rotate: 0, scale: 1 }}
          animate={{
            left: "calc(100vw - 5.5rem)",
            top: "calc(100vh - 6.5rem)",
            rotate: 340,
            scale: 0.4,
            opacity: [0.95, 1, 0.2],
          }}
          transition={{ duration: 0.7, ease: [0.3, 0.6, 0.4, 1] }}
          onAnimationComplete={() => {
            setCube(null);
            window.dispatchEvent(new Event("app:treat-catch"));
          }}
          className="pointer-events-none fixed z-[60] block h-3.5 w-3.5 rounded-[3px] border border-accent bg-accent/40 shadow-[0_0_14px_rgb(var(--accent-rgb)/0.9)]"
        />
      )}
    </AnimatePresence>
  );
}
